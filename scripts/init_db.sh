#!/usr/bin/env bash
# ===========================================================================
# OpportunityIQ - Database Initialization Script
#
# This script is run on first postgres container start (via docker-entrypoint-initdb.d)
# AND can be run manually to re-initialize or verify the database state.
#
# Usage:
#   In Docker entrypoint: automatically run by postgres container
#   Manual:               docker-compose exec backend bash scripts/init_db.sh
#   Local:                bash scripts/init_db.sh
# ===========================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[init_db]${NC} $*"; }
success() { echo -e "${GREEN}[init_db]${NC} $*"; }
warn()    { echo -e "${YELLOW}[init_db]${NC} $*"; }
error()   { echo -e "${RED}[init_db]${NC} $*" >&2; }

# ---------------------------------------------------------------------------
# Detect whether we're running inside postgres entrypoint or the app container
# ---------------------------------------------------------------------------
if [ -n "${POSTGRES_DB:-}" ] && [ -n "${POSTGRES_USER:-}" ]; then
    # Running as postgres entrypoint SQL init script context
    # Variables are set by postgres container
    DB_NAME="${POSTGRES_DB}"
    DB_USER="${POSTGRES_USER}"
    info "Running in postgres entrypoint context (DB: ${DB_NAME}, User: ${DB_USER})"

    # These commands run as the postgres superuser inside the entrypoint
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
        -- Enable required extensions
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

        -- Grant privileges
        GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USER}";
        GRANT ALL ON SCHEMA public TO "${POSTGRES_USER}";

        -- Set sensible defaults for performance
        ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
        ALTER SYSTEM SET max_connections = 200;
        ALTER SYSTEM SET shared_buffers = '256MB';
        ALTER SYSTEM SET effective_cache_size = '1GB';
        ALTER SYSTEM SET work_mem = '16MB';
        ALTER SYSTEM SET maintenance_work_mem = '256MB';
        ALTER SYSTEM SET random_page_cost = 1.1;
        ALTER SYSTEM SET wal_buffers = '16MB';
        ALTER SYSTEM SET checkpoint_completion_target = 0.9;

        \echo 'Database extensions and configuration applied successfully'
EOSQL

    success "PostgreSQL initialization complete"
    exit 0
fi

# ---------------------------------------------------------------------------
# Running from the application container (manual invocation)
# ---------------------------------------------------------------------------

info "OpportunityIQ Database Initializer"
info "=================================="

# Load environment variables from .env if running locally
if [ -f "/app/../.env" ]; then
    info "Loading .env from project root..."
    set -a
    # shellcheck source=/dev/null
    source /app/../.env
    set +a
elif [ -f ".env" ]; then
    info "Loading local .env..."
    set -a
    # shellcheck source=/dev/null
    source .env
    set +a
fi

# Resolve DATABASE_URL
DATABASE_URL="${DATABASE_URL:-postgresql+asyncpg://postgres:password@postgres:5432/opportunityiq}"
# Convert asyncpg URL to psycopg2-compatible for psql
PSQL_URL="${DATABASE_URL/postgresql+asyncpg/postgresql}"
PSQL_URL="${PSQL_URL/+asyncpg/}"

info "Target: ${PSQL_URL//:*@/:***@}"  # Mask password in logs

# ---------------------------------------------------------------------------
# Wait for postgres to be ready
# ---------------------------------------------------------------------------
info "Waiting for PostgreSQL to become available..."
MAX_RETRIES=30
RETRY_INTERVAL=2
attempt=0

until pg_isready -d "${PSQL_URL}" -q 2>/dev/null; do
    attempt=$((attempt + 1))
    if [ "${attempt}" -ge "${MAX_RETRIES}" ]; then
        error "PostgreSQL did not become available after $((MAX_RETRIES * RETRY_INTERVAL)) seconds"
        exit 1
    fi
    warn "Postgres not ready, retrying in ${RETRY_INTERVAL}s... (${attempt}/${MAX_RETRIES})"
    sleep "${RETRY_INTERVAL}"
done

success "PostgreSQL is ready!"

# ---------------------------------------------------------------------------
# Run Alembic migrations
# ---------------------------------------------------------------------------
info "Running Alembic database migrations..."

# Change to backend directory if we're in scripts/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/../backend"

if [ -d "${BACKEND_DIR}" ]; then
    cd "${BACKEND_DIR}"
fi

if command -v alembic > /dev/null 2>&1; then
    alembic upgrade head
    success "Migrations applied successfully"
else
    warn "alembic not found in PATH - skipping migrations"
    warn "Run manually: docker-compose exec backend alembic upgrade head"
fi

# ---------------------------------------------------------------------------
# (Optional) Seed initial data
# ---------------------------------------------------------------------------
SEED_FILE="${SCRIPT_DIR}/seed_data.py"
if [ -f "${SEED_FILE}" ]; then
    info "Running seed data script..."
    python "${SEED_FILE}"
    success "Seed data applied"
fi

# ---------------------------------------------------------------------------
# Create admin/test user if ADMIN_EMAIL is set
# ---------------------------------------------------------------------------
if [ -n "${ADMIN_EMAIL:-}" ]; then
    info "Creating admin user: ${ADMIN_EMAIL}..."
    python - <<EOF
import asyncio
import sys
import os
sys.path.insert(0, '/app')

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.user_preferences import UserPreferences
import uuid

async def create_admin():
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == os.environ['ADMIN_EMAIL']))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Admin user {os.environ['ADMIN_EMAIL']} already exists")
            return

        user = User(
            id=uuid.uuid4(),
            email=os.environ['ADMIN_EMAIL'],
            name=os.environ.get('ADMIN_NAME', 'Admin'),
            is_active=True,
        )
        session.add(user)
        await session.flush()

        prefs = UserPreferences(user_id=user.id)
        session.add(prefs)
        await session.commit()
        print(f"Admin user created: {user.email} (id={user.id})")

asyncio.run(create_admin())
EOF
    success "Admin user setup complete"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
success "Database initialization complete!"
echo ""
info "Next steps:"
echo "  - Start the application: make dev"
echo "  - View API docs:         http://localhost:8000/docs"
echo "  - Trigger a scrape:      make scrape"

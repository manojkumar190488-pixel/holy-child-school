"""
Alembic async migration environment.

This file configures Alembic to run migrations asynchronously using
asyncpg as the database driver. It imports all application models so
that autogenerate can detect schema changes.
"""

import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ---------------------------------------------------------------------------
# Import all models so Alembic's autogenerate can detect them
# ---------------------------------------------------------------------------
# These imports register the models against Base.metadata
from app.models.user import User  # noqa: F401
from app.models.job import Job, HiddenJob  # noqa: F401
from app.models.bookmark import Bookmark  # noqa: F401
from app.models.application import Application  # noqa: F401
from app.models.recruiter import Recruiter  # noqa: F401
from app.models.search_history import SearchHistory  # noqa: F401

# Import the declarative base so we can use it as target_metadata
try:
    from app.core.database import Base
    target_metadata = Base.metadata
except ImportError:
    # Fallback: try importing from models package
    from app.models import Base  # type: ignore
    target_metadata = Base.metadata

# ---------------------------------------------------------------------------
# Alembic Config object (provides access to alembic.ini values)
# ---------------------------------------------------------------------------
config = context.config

# Interpret the config file for Python logging if present.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override the sqlalchemy.url from the environment variable if available.
# This allows Docker / CI to inject the real DATABASE_URL without editing
# alembic.ini.
_db_url = os.environ.get("DATABASE_URL")
if _db_url:
    # asyncpg is required for async migrations; ensure the scheme is correct.
    if _db_url.startswith("postgresql://"):
        _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    config.set_main_option("sqlalchemy.url", _db_url)


# ---------------------------------------------------------------------------
# Offline migration mode
# ---------------------------------------------------------------------------

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine. By
    skipping the Engine creation we don't even need a DBAPI to be
    available. Calls to context.execute() here emit the given string to
    the script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        include_schemas=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migration mode (async)
# ---------------------------------------------------------------------------

def do_run_migrations(connection: Connection) -> None:
    """Execute the migrations on an open synchronous connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
        include_schemas=True,
        # Render item-level CREATE/DROP statements for pgvector column type
        render_as_batch=False,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Create an async engine from the alembic config and run migrations.

    asyncpg NullPool is used because Alembic only needs a short-lived
    connection – we don't want idle connections left open after the
    migration run completes.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Entry point for online (connected) migration mode."""
    asyncio.run(run_async_migrations())


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

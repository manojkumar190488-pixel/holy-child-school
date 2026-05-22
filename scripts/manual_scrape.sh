#!/usr/bin/env bash
# ===========================================================================
# OpportunityIQ - Manual Scrape Trigger Script
#
# Dispatches a scraping job to the Celery worker queue.
# Can target all sources or a specific source.
#
# Usage:
#   bash scripts/manual_scrape.sh                     # Scrape all sources
#   bash scripts/manual_scrape.sh --source linkedin   # Scrape only LinkedIn
#   bash scripts/manual_scrape.sh --source naukri     # Scrape only Naukri
#   bash scripts/manual_scrape.sh --dry-run           # Show what would be scraped
#   bash scripts/manual_scrape.sh --help              # Show help
# ===========================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}[scrape]${NC} $*"; }
success() { echo -e "${GREEN}[scrape]${NC} $*"; }
warn()    { echo -e "${YELLOW}[scrape]${NC} $*"; }
error()   { echo -e "${RED}[scrape]${NC} $*" >&2; }
header()  { echo -e "\n${BOLD}${CYAN}$*${NC}\n"; }

# ---------------------------------------------------------------------------
# Supported sources
# ---------------------------------------------------------------------------
ALL_SOURCES=(
    "linkedin"
    "naukri"
    "indeed"
    "glassdoor"
    "wellfound"
    "remoteok"
    "workingnomads"
    "weworkremotely"
)

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
SOURCE=""
DRY_RUN=false

usage() {
    echo ""
    echo "  ${BOLD}OpportunityIQ Manual Scraper${NC}"
    echo ""
    echo "  Usage: $0 [OPTIONS]"
    echo ""
    echo "  Options:"
    echo "    --source <name>   Scrape a specific source (see list below)"
    echo "    --dry-run         Show what would be scraped without running"
    echo "    --help, -h        Show this help message"
    echo ""
    echo "  Available sources:"
    for src in "${ALL_SOURCES[@]}"; do
        echo "    - ${src}"
    done
    echo ""
    echo "  Examples:"
    echo "    $0                          # Scrape all sources"
    echo "    $0 --source linkedin        # Scrape LinkedIn only"
    echo "    $0 --source naukri          # Scrape Naukri only"
    echo "    $0 --dry-run                # Preview what would run"
    echo ""
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --source|-s)
            SOURCE="${2:-}"
            shift 2
            ;;
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            error "Unknown argument: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate source if provided
if [ -n "${SOURCE}" ]; then
    VALID=false
    for s in "${ALL_SOURCES[@]}"; do
        if [ "${s}" = "${SOURCE}" ]; then
            VALID=true
            break
        fi
    done
    if [ "${VALID}" = false ]; then
        error "Unknown source: '${SOURCE}'"
        error "Valid sources: ${ALL_SOURCES[*]}"
        exit 1
    fi
fi

# ---------------------------------------------------------------------------
# Detect execution context (inside Docker or local)
# ---------------------------------------------------------------------------
header "OpportunityIQ - Manual Job Scraper"

# Detect docker compose version
DOCKER_COMPOSE="docker-compose"
if docker compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
fi

# Check if the backend container is running
BACKEND_RUNNING=false
if ${DOCKER_COMPOSE} ps backend 2>/dev/null | grep -q "Up\|running"; then
    BACKEND_RUNNING=true
fi

# ---------------------------------------------------------------------------
# Dry run mode
# ---------------------------------------------------------------------------
if [ "${DRY_RUN}" = true ]; then
    warn "DRY RUN MODE - no actual scraping will occur"
    echo ""
    if [ -n "${SOURCE}" ]; then
        info "Would scrape: ${SOURCE}"
    else
        info "Would scrape all ${#ALL_SOURCES[@]} sources:"
        for src in "${ALL_SOURCES[@]}"; do
            echo "  - ${src}"
        done
    fi
    echo ""
    success "Dry run complete"
    exit 0
fi

# ---------------------------------------------------------------------------
# Dispatch the scraping task
# ---------------------------------------------------------------------------
if [ "${BACKEND_RUNNING}" = true ]; then
    info "Backend container is running - dispatching via Celery..."

    if [ -n "${SOURCE}" ]; then
        info "Scraping source: ${SOURCE}"
        ${DOCKER_COMPOSE} exec -T backend python - <<EOF
import sys
sys.path.insert(0, '/app')
try:
    from app.workers.scraping_worker import scrape_source_task
    result = scrape_source_task.delay('${SOURCE}')
    print(f"Task dispatched: {result.id}")
    print(f"Source: ${SOURCE}")
    print(f"Monitor: docker-compose logs -f celery-worker")
except Exception as e:
    print(f"Error dispatching task: {e}")
    sys.exit(1)
EOF
    else
        info "Scraping all ${#ALL_SOURCES[@]} sources..."
        ${DOCKER_COMPOSE} exec -T backend python - <<'EOF'
import sys
sys.path.insert(0, '/app')
try:
    from app.workers.scraping_worker import scrape_all_sources_task
    result = scrape_all_sources_task.delay()
    print(f"Task dispatched: {result.id}")
    print(f"Sources: all configured sources")
    print(f"Monitor: docker-compose logs -f celery-worker")
except ImportError:
    # Fallback: dispatch individual tasks
    try:
        from app.workers.scraping_worker import scrape_source_task
        sources = ["linkedin", "naukri", "indeed", "glassdoor", "wellfound", "remoteok"]
        task_ids = []
        for source in sources:
            r = scrape_source_task.delay(source)
            task_ids.append((source, r.id))
            print(f"Dispatched {source}: {r.id}")
        print(f"\nTotal tasks dispatched: {len(task_ids)}")
    except Exception as e2:
        print(f"Error: {e2}")
        sys.exit(1)
except Exception as e:
    print(f"Error dispatching task: {e}")
    sys.exit(1)
EOF
    fi

    echo ""
    success "Scrape task(s) dispatched to Celery worker queue!"
    info "To monitor progress:"
    echo "  ${DOCKER_COMPOSE} logs -f celery-worker"

elif command -v python > /dev/null 2>&1 || command -v python3 > /dev/null 2>&1; then
    # Running locally without Docker
    PYTHON_CMD="python3"
    command -v python3 > /dev/null 2>&1 || PYTHON_CMD="python"

    # Try to load .env
    ENV_FILE=".env"
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ROOT_ENV="${SCRIPT_DIR}/../.env"
    if [ -f "${ROOT_ENV}" ]; then
        ENV_FILE="${ROOT_ENV}"
        set -a
        # shellcheck source=/dev/null
        source "${ENV_FILE}"
        set +a
        info "Loaded environment from ${ENV_FILE}"
    fi

    info "Running scrape locally (no Docker detected)..."
    cd "${SCRIPT_DIR}/../backend"

    if [ -n "${SOURCE}" ]; then
        info "Scraping source: ${SOURCE}"
        PYTHONPATH=. "${PYTHON_CMD}" -c "
import asyncio
import sys
sys.path.insert(0, '.')

async def main():
    try:
        from app.scrapers.${SOURCE} import ${SOURCE^}Scraper
        scraper = ${SOURCE^}Scraper()
        jobs = await scraper.scrape()
        print(f'Scraped {len(jobs)} jobs from ${SOURCE}')
    except ImportError as e:
        print(f'Could not import scraper for ${SOURCE}: {e}')
        print('Make sure the backend dependencies are installed.')
        sys.exit(1)

asyncio.run(main())
"
    else
        warn "Backend container not running and no specific source given."
        warn "Start the stack with 'make dev' or specify a source with --source"
        echo ""
        echo "  Tip: make dev           # Start full stack"
        echo "  Tip: make scrape        # Scrape via Docker"
        echo "  Tip: $0 --source naukri # Scrape specific source"
        exit 1
    fi

else
    error "Cannot dispatch scrape: backend container is not running and Python is not available locally."
    error ""
    error "Solutions:"
    error "  1. Start the full stack:  make dev"
    error "  2. Start backend only:    make backend"
    error "  3. Then run:              make scrape"
    exit 1
fi

# ---------------------------------------------------------------------------
# Post-scrape summary
# ---------------------------------------------------------------------------
echo ""
header "Scrape Complete"
info "Newly scraped jobs will be:"
echo "  1. Stored in PostgreSQL (jobs table)"
echo "  2. Scored by the AI matching engine"
echo "  3. Embeddings generated via OpenAI"
echo "  4. Available at http://localhost:3000/jobs"
echo ""

if [ "${BACKEND_RUNNING}" = true ]; then
    info "Live logs: ${DOCKER_COMPOSE} logs -f celery-worker"
    info "API stats: curl http://localhost:8000/api/stats"
fi

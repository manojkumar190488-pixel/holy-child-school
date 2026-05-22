# ===========================================================================
# OpportunityIQ - Makefile
# ===========================================================================

.PHONY: help setup dev backend frontend migrate scrape digest logs down \
        clean build test lint format shell db-shell redis-shell ps restart

# Default target
.DEFAULT_GOAL := help

# Detect docker compose version (v2 uses `docker compose`, v1 uses `docker-compose`)
DOCKER_COMPOSE := $(shell docker compose version > /dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

# Colours for terminal output
CYAN  := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED   := \033[0;31m
NC    := \033[0m

# ---------------------------------------------------------------------------
help: ## Show this help message
	@echo ""
	@echo "  $(CYAN)OpportunityIQ$(NC) - AI Career Intelligence Platform"
	@echo ""
	@echo "  Usage: make $(CYAN)<target>$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# ---------------------------------------------------------------------------
# Setup & Installation
# ---------------------------------------------------------------------------

setup: ## Copy .env.example to .env and install local dev dependencies
	@echo "$(CYAN)Setting up OpportunityIQ...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)Created .env from .env.example$(NC)"; \
		echo "$(YELLOW)IMPORTANT: Edit .env and fill in your API keys and secrets!$(NC)"; \
	else \
		echo "$(YELLOW).env already exists, skipping copy$(NC)"; \
	fi
	@echo "$(CYAN)Installing backend Python dependencies locally...$(NC)"
	@if command -v pip > /dev/null 2>&1; then \
		pip install -r backend/requirements.txt; \
	else \
		echo "$(YELLOW)pip not found - skipping local Python install (use Docker instead)$(NC)"; \
	fi
	@echo "$(CYAN)Installing frontend Node.js dependencies locally...$(NC)"
	@if command -v npm > /dev/null 2>&1; then \
		cd frontend && npm install; \
	else \
		echo "$(YELLOW)npm not found - skipping local Node install (use Docker instead)$(NC)"; \
	fi
	@echo "$(GREEN)Setup complete!$(NC) Run 'make dev' to start the stack."

# ---------------------------------------------------------------------------
# Docker Operations
# ---------------------------------------------------------------------------

dev: ## Build and start all services (docker-compose up --build)
	@echo "$(CYAN)Starting OpportunityIQ stack...$(NC)"
	$(DOCKER_COMPOSE) up --build

dev-detached: ## Start all services in the background
	@echo "$(CYAN)Starting OpportunityIQ stack in background...$(NC)"
	$(DOCKER_COMPOSE) up --build -d
	@echo "$(GREEN)Stack is running!$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

build: ## Build all Docker images without starting
	@echo "$(CYAN)Building Docker images...$(NC)"
	$(DOCKER_COMPOSE) build

backend: ## Start only the backend service (and its dependencies)
	@echo "$(CYAN)Starting backend service...$(NC)"
	$(DOCKER_COMPOSE) up --build backend postgres redis

frontend: ## Start only the frontend service
	@echo "$(CYAN)Starting frontend service...$(NC)"
	$(DOCKER_COMPOSE) up --build frontend

workers: ## Start Celery worker and beat scheduler
	@echo "$(CYAN)Starting Celery workers...$(NC)"
	$(DOCKER_COMPOSE) up --build celery-worker celery-beat

down: ## Stop and remove all containers
	@echo "$(RED)Stopping OpportunityIQ stack...$(NC)"
	$(DOCKER_COMPOSE) down

down-volumes: ## Stop containers and remove volumes (DESTRUCTIVE - deletes data)
	@echo "$(RED)WARNING: This will delete all data volumes!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	$(DOCKER_COMPOSE) down -v

restart: ## Restart all services
	@echo "$(CYAN)Restarting all services...$(NC)"
	$(DOCKER_COMPOSE) restart

ps: ## Show running container status
	$(DOCKER_COMPOSE) ps

logs: ## Follow logs from all services
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Follow backend logs only
	$(DOCKER_COMPOSE) logs -f backend

logs-celery: ## Follow Celery worker logs
	$(DOCKER_COMPOSE) logs -f celery-worker celery-beat

logs-nginx: ## Follow nginx logs
	$(DOCKER_COMPOSE) logs -f nginx

clean: ## Remove stopped containers and dangling images
	@echo "$(CYAN)Cleaning up Docker resources...$(NC)"
	$(DOCKER_COMPOSE) down --remove-orphans
	docker image prune -f
	docker container prune -f
	@echo "$(GREEN)Cleanup complete$(NC)"

# ---------------------------------------------------------------------------
# Database Operations
# ---------------------------------------------------------------------------

migrate: ## Run Alembic database migrations (upgrade head)
	@echo "$(CYAN)Running database migrations...$(NC)"
	$(DOCKER_COMPOSE) exec backend alembic upgrade head
	@echo "$(GREEN)Migrations complete$(NC)"

migrate-create: ## Create a new Alembic migration (usage: make migrate-create MSG="description")
	@if [ -z "$(MSG)" ]; then echo "$(RED)Error: provide MSG parameter, e.g. make migrate-create MSG='add index'$(NC)"; exit 1; fi
	$(DOCKER_COMPOSE) exec backend alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Downgrade one migration step
	@echo "$(YELLOW)Downgrading one migration step...$(NC)"
	$(DOCKER_COMPOSE) exec backend alembic downgrade -1

migrate-history: ## Show migration history
	$(DOCKER_COMPOSE) exec backend alembic history --verbose

migrate-current: ## Show current migration revision
	$(DOCKER_COMPOSE) exec backend alembic current

db-shell: ## Open a psql shell in the postgres container
	$(DOCKER_COMPOSE) exec postgres psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-opportunityiq}

redis-shell: ## Open a redis-cli shell in the redis container
	$(DOCKER_COMPOSE) exec redis redis-cli

init-db: ## Initialize the database (create extensions, run migrations)
	@echo "$(CYAN)Initializing database...$(NC)"
	@chmod +x scripts/init_db.sh
	$(DOCKER_COMPOSE) exec backend bash /app/../scripts/init_db.sh
	@echo "$(GREEN)Database initialized$(NC)"

# ---------------------------------------------------------------------------
# Application Operations
# ---------------------------------------------------------------------------

scrape: ## Trigger a manual scraping run for all sources
	@echo "$(CYAN)Triggering manual scrape...$(NC)"
	@chmod +x scripts/manual_scrape.sh
	@bash scripts/manual_scrape.sh
	@echo "$(GREEN)Scrape job dispatched$(NC)"

scrape-source: ## Scrape a specific source (usage: make scrape-source SOURCE=linkedin)
	@if [ -z "$(SOURCE)" ]; then echo "$(RED)Error: provide SOURCE parameter, e.g. make scrape-source SOURCE=linkedin$(NC)"; exit 1; fi
	@echo "$(CYAN)Scraping source: $(SOURCE)...$(NC)"
	$(DOCKER_COMPOSE) exec backend python -c "from app.workers.scraping_worker import scrape_source; scrape_source.delay('$(SOURCE)')"

digest: ## Send a test digest email to DIGEST_RECIPIENT_EMAIL
	@echo "$(CYAN)Sending test email digest...$(NC)"
	$(DOCKER_COMPOSE) exec backend python -c "from app.workers.scheduler import send_daily_digest; send_daily_digest.delay()"
	@echo "$(GREEN)Digest task queued - check logs and your inbox$(NC)"

# ---------------------------------------------------------------------------
# Development Helpers
# ---------------------------------------------------------------------------

shell: ## Open a bash shell in the backend container
	$(DOCKER_COMPOSE) exec backend bash

test: ## Run backend tests
	@echo "$(CYAN)Running backend tests...$(NC)"
	$(DOCKER_COMPOSE) exec backend pytest tests/ -v --tb=short

test-cov: ## Run tests with coverage report
	$(DOCKER_COMPOSE) exec backend pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

lint: ## Run linters (ruff, mypy)
	@echo "$(CYAN)Running linters...$(NC)"
	$(DOCKER_COMPOSE) exec backend ruff check app/
	$(DOCKER_COMPOSE) exec backend mypy app/ --ignore-missing-imports

format: ## Auto-format code with ruff and black
	$(DOCKER_COMPOSE) exec backend ruff format app/
	$(DOCKER_COMPOSE) exec backend ruff check --fix app/

# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

env-check: ## Validate that all required env vars are set in .env
	@echo "$(CYAN)Checking environment variables...$(NC)"
	@required_vars="DATABASE_URL POSTGRES_PASSWORD REDIS_URL OPENAI_API_KEY JWT_SECRET SMTP_PASSWORD"; \
	for var in $$required_vars; do \
		if grep -q "^$$var=" .env 2>/dev/null; then \
			val=$$(grep "^$$var=" .env | cut -d= -f2); \
			if [ -z "$$val" ] || echo "$$val" | grep -q "your_\|sk-\.\.\.\|\.\.\."; then \
				echo "$(YELLOW)  WARNING: $$var may not be set correctly$(NC)"; \
			else \
				echo "$(GREEN)  OK: $$var$(NC)"; \
			fi; \
		else \
			echo "$(RED)  MISSING: $$var$(NC)"; \
		fi; \
	done

health: ## Check health of all running services
	@echo "$(CYAN)Checking service health...$(NC)"
	@curl -sf http://localhost:8000/health > /dev/null && echo "$(GREEN)  Backend: healthy$(NC)" || echo "$(RED)  Backend: unhealthy$(NC)"
	@curl -sf http://localhost:3000 > /dev/null && echo "$(GREEN)  Frontend: healthy$(NC)" || echo "$(RED)  Frontend: unhealthy$(NC)"
	@curl -sf http://localhost/nginx-health > /dev/null && echo "$(GREEN)  Nginx: healthy$(NC)" || echo "$(RED)  Nginx: unhealthy$(NC)"

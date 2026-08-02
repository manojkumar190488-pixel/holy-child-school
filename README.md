# GovIntel AI — Opportunity Intelligence Platform

> Stop scrolling job boards. Let AI find the right government consulting, digital transformation, and multilateral opportunities for you.

GovIntel AI is a self-hosted, AI-powered opportunity intelligence platform purpose-built for senior government consulting leaders, public sector advisors, and digital transformation executives. It continuously discovers opportunities across full-time leadership roles (strict Delhi NCR filter), global remote/advisory roles, and high-value freelance/consulting assignments — scores every one against a weighted profile-fit model, and surfaces only what clears the bar.

**Scoring model (0-100):** Leadership Match 25% · Government Consulting 20% · Domain Match 15% · Multilateral Match 15% · Procurement Match 10% · Technology Match 5% · Compensation Match 5% · Location Match 5%.

**Discovery agent:** runs three times daily (6:00 AM / 12:00 PM / 6:00 PM IST), scraping all configured sources, deduplicating, scoring, and firing real-time alerts (email / Telegram / WhatsApp) whenever match score > 80, opportunity value > ₹25L, or a leadership-level position is found.

**AI Career Copilot:** ask natural-language questions like *"Find VP-level government consulting jobs in Delhi NCR"* or *"Find World Bank consulting assignments worth more than ₹5 lakh"* via `POST /api/v1/copilot/query`.

---

## Features

- **AI Match Scoring** — Every job is scored 0-100 against your profile using GPT-4 + vector similarity. Only high-signal matches reach your inbox.
- **Multi-Source Scraping** — Automatically collects jobs from LinkedIn, Naukri, Indeed, Glassdoor, Wellfound, RemoteOK, and more.
- **Daily Email Digest** — Beautiful HTML digest delivered at your preferred time with explanations of *why* each job is relevant.
- **Telegram Alerts** — Instant push notifications for exceptional matches (90%+ score).
- **Application Pipeline** — Built-in Kanban tracker: Applied → Screening → Interview → Offer.
- **Recruiter CRM** — Track recruiter interactions, notes, and ratings.
- **Semantic Search** — Find jobs by meaning, not just keywords, using pgvector embeddings.
- **Google OAuth** — One-click sign-in, no passwords to manage.
- **Self-Hosted** — Your data stays on your infrastructure. One `docker-compose up` to deploy.

---

## Architecture

```
                          ┌─────────────────────────────────────────┐
                          │              Nginx (Port 80)             │
                          │   Reverse proxy + gzip + rate limiting   │
                          └───────────┬─────────────────┬───────────┘
                                      │                 │
                         ┌────────────▼──────┐ ┌───────▼────────────┐
                         │  Next.js Frontend │ │  FastAPI Backend   │
                         │    (Port 3000)    │ │    (Port 8000)     │
                         │                  │ │                    │
                         │  - Dashboard      │ │  - REST API v1     │
                         │  - Job listings   │ │  - Google OAuth    │
                         │  - Applications   │ │  - JWT auth        │
                         │  - Settings       │ │  - WebSockets      │
                         └──────────────────┘ └────────┬───────────┘
                                                        │
                         ┌──────────────────────────────▼──────────┐
                         │                  Redis                   │
                         │     Celery broker + result backend       │
                         │     + response caching                   │
                         └──────────────┬──────────────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │                          │                          │
    ┌────────▼────────┐       ┌─────────▼────────┐      ┌────────▼────────┐
    │  Celery Worker  │       │   Celery Beat    │      │   PostgreSQL    │
    │                 │       │   (Scheduler)    │      │   + pgvector    │
    │  - Scraping     │       │                  │      │                 │
    │  - AI matching  │       │  - Daily scrape  │      │  - Users        │
    │  - Embeddings   │       │  - Email digest  │      │  - Jobs         │
    │  - Notifications│       │  - Cleanup jobs  │      │  - Applications │
    └─────────────────┘       └──────────────────┘      │  - Embeddings   │
                                                         └─────────────────┘

    External Services:
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  OpenAI API │  │ Anthropic   │  │  Gmail SMTP │  │  Telegram   │
    │  Embeddings │  │  Claude AI  │  │  Digests    │  │    Bot      │
    │  GPT-4      │  │  Analysis   │  │             │  │   Alerts    │
    └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS | Dashboard and UI |
| **Backend** | FastAPI, Python 3.11, SQLAlchemy 2 | REST API and business logic |
| **Database** | PostgreSQL 15 + pgvector | Job storage + semantic search |
| **Cache / Queue** | Redis 7 | Celery broker, API caching |
| **Task Queue** | Celery 5 | Async scraping and notifications |
| **AI / LLM** | OpenAI GPT-4, Claude 3 | Job analysis and scoring |
| **Embeddings** | text-embedding-3-small (1536d) | Semantic vector search |
| **Scraping** | Playwright, httpx, BeautifulSoup | Multi-source job collection |
| **Auth** | Google OAuth 2.0, JWT | Secure authentication |
| **Email** | Jinja2 HTML templates, SMTP | Daily digest emails |
| **Notifications** | Telegram Bot API | Real-time alerts |
| **Proxy** | Nginx (alpine) | Reverse proxy, rate limiting |
| **Containers** | Docker, docker-compose | Local and cloud deployment |

---

## Prerequisites

- **Docker** 24+ and **Docker Compose** v2+
- **Git**
- API keys for: OpenAI, Anthropic (optional), Google OAuth
- An SMTP-capable email account (Gmail recommended)
- (Optional) Telegram bot token

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourname/opportunityiq.git
cd opportunityiq
```

### 2. Configure environment

```bash
make setup
# This copies .env.example → .env
# Open .env and fill in your credentials
nano .env
```

### 3. Start the stack

```bash
make dev
# Builds and starts all Docker services
# First run takes ~3-5 minutes to download images and build
```

### 4. Initialize the database

```bash
# In a new terminal (while `make dev` is running):
make migrate
```

### 5. Open the application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

Sign in with your Google account and configure your job preferences. Then trigger your first scrape:

```bash
make scrape
```

---

## Configuration Guide

All configuration is done via environment variables in `.env`. Copy `.env.example` to get started.

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Full async SQLAlchemy connection string | `postgresql+asyncpg://postgres:pass@postgres:5432/opportunityiq` |
| `POSTGRES_DB` | Database name (used by postgres container) | `opportunityiq` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password — use a strong random value | `your_secure_password` |

### AI APIs

| Variable | Description | Where to get it |
|----------|-------------|----------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 and embeddings | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | Claude API key (optional fallback) | [console.anthropic.com](https://console.anthropic.com) |

**Cost estimate:** With daily scraping of ~500 jobs, expect ~$2-5/month in OpenAI API costs (embeddings are very cheap; GPT-4 analysis is only run on jobs that pass initial filters).

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (type: Web application)
3. Add `http://localhost:8000/auth/google/callback` to Authorized redirect URIs
4. Copy Client ID and Secret to `.env`

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID ending in `.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret |

### Email (SMTP)

For Gmail:
1. Enable 2-factor authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Use that 16-character password as `SMTP_PASSWORD`

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server hostname (`smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587` for TLS) |
| `SMTP_USER` | Your email address |
| `SMTP_PASSWORD` | App password (not your account password) |
| `FROM_EMAIL` | Sender address shown in digest emails |
| `DIGEST_RECIPIENT_EMAIL` | Where to send daily digests |

### Scheduler

| Variable | Description | Default |
|----------|-------------|---------|
| `DAILY_SCRAPE_HOUR` | Hour to run daily scrape (0-23) | `8` |
| `DAILY_SCRAPE_MINUTE` | Minute to run daily scrape (0-59) | `0` |
| `TIMEZONE` | IANA timezone name | `Asia/Kolkata` |

---

## API Documentation

The full interactive API documentation is available at `/docs` (Swagger UI) and `/redoc` when the backend is running.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | OAuth callback |
| `GET` | `/api/v1/jobs` | List jobs with filters and pagination |
| `GET` | `/api/v1/jobs/{id}` | Get single job with full AI analysis |
| `POST` | `/api/v1/jobs/search` | Semantic search across jobs |
| `GET` | `/api/v1/jobs/stats` | Aggregated job statistics |
| `POST` | `/api/v1/bookmarks` | Bookmark a job |
| `GET` | `/api/v1/bookmarks` | List bookmarked jobs |
| `POST` | `/api/v1/applications` | Track a job application |
| `PATCH` | `/api/v1/applications/{id}` | Update application status |
| `GET` | `/api/v1/recruiters` | List tracked recruiters |
| `GET` | `/api/v1/profile` | Get current user profile |
| `PATCH` | `/api/v1/preferences` | Update job preferences |
| `POST` | `/api/v1/scrape` | Trigger manual scrape (admin) |

### Authentication

All API endpoints (except `/health` and `/auth/*`) require a JWT bearer token:

```bash
# Get a token via Google OAuth, then:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/v1/jobs
```

---

## Scraper Sources

| Source | Type | Coverage |
|--------|------|----------|
| **LinkedIn** | Playwright (headless) | Global, all industries |
| **Naukri.com** | HTTP + BeautifulSoup | India-focused |
| **Indeed** | HTTP + BeautifulSoup | Global |
| **Glassdoor** | Playwright | Global + salary data |
| **Wellfound (AngelList)** | HTTP API | Startups |
| **RemoteOK** | JSON API | Remote-only |
| **Working Nomads** | RSS feed | Remote-only |
| **We Work Remotely** | RSS feed | Remote-only |

New scrapers can be added by implementing the `BaseScraper` interface in `backend/app/scrapers/`.

---

## AI Matching Engine

Every scraped job goes through a multi-stage AI pipeline:

### Stage 1: Embedding Generation
- Job title + description is converted to a 1536-dimensional vector using OpenAI's `text-embedding-3-small`
- Stored in PostgreSQL via pgvector
- Enables semantic similarity search

### Stage 2: Initial Filter
- Jobs are ranked by cosine similarity to your profile embedding
- Only the top candidates proceed to expensive GPT-4 analysis

### Stage 3: GPT-4 Scoring
For each high-potential job, GPT-4 analyzes:
- **Skills match** (40% weight) — required vs. your skill set
- **Experience level** (30% weight) — seniority alignment
- **Location / remote** (15% weight) — your preferences
- **Compensation** (15% weight) — salary range fit

Outputs:
- **Match score** (0-100)
- **Why relevant** — natural language explanation
- **Missing skills** — gap analysis
- **AI summary** — 2-sentence TL;DR of the role

### Stage 4: Digest Compilation
Jobs above your `MIN_MATCH_SCORE` threshold (default: 60) are included in the daily digest, sorted by score.

---

## Scheduler

The Celery Beat scheduler manages all recurring tasks:

| Task | Schedule | Description |
|------|----------|-------------|
| `scrape_all_sources` | Daily at `DAILY_SCRAPE_HOUR:DAILY_SCRAPE_MINUTE` | Full scrape of all sources |
| `send_daily_digest` | Daily at `DAILY_SCRAPE_HOUR+1` | Send email digest after scrape |
| `process_embeddings` | Every 30 minutes | Generate embeddings for new jobs |
| `cleanup_stale_jobs` | Weekly on Sunday | Mark jobs >30 days old as inactive |
| `send_telegram_alerts` | Every 6 hours | Push 90%+ match alerts |

---

## Development Guide

### Project Structure

```
opportunityiq/
├── backend/
│   ├── alembic/            # Database migrations
│   │   └── versions/       # Migration files
│   ├── app/
│   │   ├── ai/             # AI scoring and profile modules
│   │   ├── api/            # FastAPI route handlers
│   │   │   └── v1/         # API version 1 endpoints
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── scrapers/       # Source-specific scrapers
│   │   ├── services/       # Business logic layer
│   │   ├── templates/      # Jinja2 email templates
│   │   └── workers/        # Celery tasks
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── types/              # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
├── scripts/
│   ├── init_db.sh          # Database initialization
│   └── manual_scrape.sh    # Manual scrape trigger
├── .env.example            # Environment variable template
├── .gitignore
├── docker-compose.yml
├── Makefile
├── nginx.conf
└── README.md
```

### Running Locally (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Celery Worker:**
```bash
cd backend
celery -A app.workers.scraping_worker worker --loglevel=info
```

**Celery Beat:**
```bash
cd backend
celery -A app.workers.scheduler beat --loglevel=info
```

### Adding a New Scraper

1. Create `backend/app/scrapers/mysource.py`
2. Implement the `BaseScraper` interface:
   ```python
   from app.scrapers.base import BaseScraper, JobData

   class MySourceScraper(BaseScraper):
       source_name = "mysource"

       async def scrape(self) -> list[JobData]:
           # Your scraping logic here
           return [JobData(title="...", company="...", source_url="...")]
   ```
3. Register it in `app/workers/scraping_worker.py`

### Database Migrations

```bash
# Create a new migration after changing models
make migrate-create MSG="add_skill_tags_to_users"

# Apply all pending migrations
make migrate

# Roll back one step
make migrate-down

# View history
make migrate-history
```

---

## Deployment Guide

### Docker (VPS / Self-hosted)

1. Copy the repo to your server
2. Set up `.env` with production values (strong secrets, production URLs)
3. Update `nginx.conf` with your domain name and SSL certificates
4. Run:
   ```bash
   make dev-detached   # or: docker-compose up -d
   make migrate
   ```

### Frontend: Vercel

```bash
# Deploy frontend only to Vercel
cd frontend
vercel deploy

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend-domain.com
```

### Backend: Railway

1. Create a new Railway project
2. Add a PostgreSQL + Redis service
3. Deploy from the `./backend` directory
4. Set all environment variables from `.env.example`
5. Add a startup command: `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Backend: Render

1. Create a new Web Service pointing to `./backend`
2. Build command: `pip install -r requirements.txt && playwright install chromium --with-deps`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add a PostgreSQL database and Redis instance
5. Configure environment variables

---

## Troubleshooting

### Postgres won't start
```bash
# Check logs
docker-compose logs postgres

# Common fix: reset the volume
docker-compose down -v
docker-compose up postgres
```

### `alembic upgrade head` fails with "relation does not exist"
```bash
# Ensure pgvector extension is installed
docker-compose exec postgres psql -U postgres -d opportunityiq -c "CREATE EXTENSION IF NOT EXISTS vector;"
make migrate
```

### Celery worker can't connect to Redis
```bash
# Verify Redis is running
docker-compose ps redis
docker-compose exec redis redis-cli ping
# Expected: PONG

# Check REDIS_URL in .env
grep REDIS_URL .env
```

### No jobs appearing after scrape
1. Check Celery worker logs: `make logs-celery`
2. Verify your `OPENAI_API_KEY` is valid
3. Check that `SCRAPER_REQUEST_DELAY` is sufficient (some sites block fast scrapers)
4. Ensure the user profile/preferences are configured in the UI

### Email digest not sending
```bash
# Send a test digest
make digest

# Check logs
make logs-backend

# Test SMTP credentials manually
python3 -c "
import smtplib, os
with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
    s.login(os.environ['SMTP_USER'], os.environ['SMTP_PASSWORD'])
    print('SMTP login successful')
"
```

### Frontend build fails in Docker
- Ensure `output: 'standalone'` is set in `frontend/next.config.ts`
- Check that `node_modules` is not copied into the image (it's installed inside the container)

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Ensure linting passes: `make lint`
5. Open a pull request with a clear description

### Code Style
- **Python:** ruff + black formatting, type annotations required
- **TypeScript:** ESLint + Prettier, strict mode enabled
- **Commits:** Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)

---

## License

MIT License. See `LICENSE` for details.

---

*Built with FastAPI, Next.js, PostgreSQL + pgvector, and the OpenAI API.*

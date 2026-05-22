"""Initial schema - all tables

Revision ID: 001
Revises:
Create Date: 2025-05-22 00:00:00.000000

Creates the complete Job Intelligence Agent database schema including:
- users, jobs, hidden_jobs, bookmarks, applications, recruiters, search_histories
- pgvector extension for semantic job matching
- HNSW index for fast vector similarity search
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# ---------------------------------------------------------------------------
# Revision identifiers
# ---------------------------------------------------------------------------
revision: str = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -----------------------------------------------------------------------
    # Enable extensions
    # -----------------------------------------------------------------------
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # -----------------------------------------------------------------------
    # users
    # -----------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("picture", sa.Text(), nullable=True),
        sa.Column("google_id", sa.String(255), nullable=True, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("TRUE")),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default=sa.text("FALSE")),
        sa.Column(
            "preferences",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "notification_preferences",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text(
                '\'{"email_digest":true,"telegram":false,"digest_time":"08:00","min_score_threshold":60}\'::jsonb'
            ),
        ),
        sa.Column("telegram_chat_id", sa.String(100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])

    # -----------------------------------------------------------------------
    # jobs
    # -----------------------------------------------------------------------
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("company", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("remote_type", sa.String(50), nullable=True),
        sa.Column("salary_min", sa.Float(), nullable=True),
        sa.Column("salary_max", sa.Float(), nullable=True),
        sa.Column("salary_currency", sa.String(10), nullable=True, server_default=sa.text("'INR'")),
        sa.Column("salary_period", sa.String(20), nullable=True, server_default=sa.text("'annual'")),
        sa.Column("source_platform", sa.String(100), nullable=True),
        sa.Column("source_url", sa.Text(), nullable=True, unique=True),
        sa.Column("external_job_id", sa.String(255), nullable=True),
        sa.Column("recruiter_name", sa.String(255), nullable=True),
        sa.Column("recruiter_linkedin", sa.Text(), nullable=True),
        sa.Column("recruiter_email", sa.String(255), nullable=True),
        sa.Column("posted_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "scraped_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("TRUE")),
        sa.Column("is_filled", sa.Boolean(), nullable=False, server_default=sa.text("FALSE")),
        sa.Column("job_type", sa.String(100), nullable=True),
        sa.Column("seniority_level", sa.String(100), nullable=True),
        sa.Column("industry", sa.String(255), nullable=True),
        sa.Column("department", sa.String(255), nullable=True),
        sa.Column("match_score", sa.Float(), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("why_relevant", sa.Text(), nullable=True),
        sa.Column(
            "missing_skills",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "score_breakdown",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "tags",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "raw_data",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("content_hash", sa.String(64), nullable=True),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("application_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    # Add pgvector embedding column
    op.execute("ALTER TABLE jobs ADD COLUMN embedding vector(1536);")

    op.create_index("ix_jobs_id", "jobs", ["id"])
    op.create_index("ix_jobs_title", "jobs", ["title"])
    op.create_index("ix_jobs_company", "jobs", ["company"])
    op.create_index("ix_jobs_match_score", "jobs", ["match_score"])
    op.create_index("ix_jobs_is_active", "jobs", ["is_active"])
    op.create_index("ix_jobs_source_platform", "jobs", ["source_platform"])
    op.create_index("ix_jobs_seniority_level", "jobs", ["seniority_level"])
    op.create_index("ix_jobs_industry", "jobs", ["industry"])
    op.create_index("ix_jobs_location", "jobs", ["location"])
    op.create_index("ix_jobs_posted_date", "jobs", ["posted_date"])
    op.create_index("ix_jobs_content_hash", "jobs", ["content_hash"])
    op.create_index(
        "ix_jobs_match_score_active",
        "jobs",
        ["match_score", "is_active"],
    )
    # Full-text search index
    op.execute(
        "CREATE INDEX ix_jobs_description_fts ON jobs "
        "USING GIN (to_tsvector('english', "
        "COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(company, '')"
        "));"
    )
    # HNSW vector similarity index
    op.execute(
        "CREATE INDEX ix_jobs_embedding_hnsw ON jobs "
        "USING hnsw (embedding vector_cosine_ops) "
        "WITH (m = 16, ef_construction = 64);"
    )

    # -----------------------------------------------------------------------
    # hidden_jobs
    # -----------------------------------------------------------------------
    op.create_table(
        "hidden_jobs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "job_id",
            sa.Integer(),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint("user_id", "job_id", name="uq_hidden_jobs_user_job"),
    )
    op.create_index("ix_hidden_jobs_user_job", "hidden_jobs", ["user_id", "job_id"], unique=True)

    # -----------------------------------------------------------------------
    # bookmarks
    # -----------------------------------------------------------------------
    op.create_table(
        "bookmarks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "job_id",
            sa.Integer(),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint("user_id", "job_id", name="uq_bookmarks_user_job"),
    )
    op.create_index("ix_bookmarks_user_id", "bookmarks", ["user_id"])
    op.create_index("ix_bookmarks_job_id", "bookmarks", ["job_id"])
    op.create_index("ix_bookmarks_user_job", "bookmarks", ["user_id", "job_id"], unique=True)

    # -----------------------------------------------------------------------
    # applications (with status enum)
    # -----------------------------------------------------------------------
    op.execute(
        "CREATE TYPE applicationstatus AS ENUM "
        "('interested','applied','interviewing','offered','rejected','withdrawn','on_hold');"
    )
    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "job_id",
            sa.Integer(),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "interested", "applied", "interviewing", "offered",
                "rejected", "withdrawn", "on_hold",
                name="applicationstatus",
            ),
            nullable=False,
            server_default=sa.text("'interested'"),
        ),
        sa.Column("applied_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("next_action", sa.String(500), nullable=True),
        sa.Column("next_action_date", sa.Date(), nullable=True),
        sa.Column("interview_rounds", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("offer_amount", sa.String(100), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("referral_contact", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint("user_id", "job_id", name="uq_applications_user_job"),
    )
    op.create_index("ix_applications_user_id", "applications", ["user_id"])
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_status", "applications", ["status"])
    op.create_index("ix_applications_user_status", "applications", ["user_id", "status"])

    # -----------------------------------------------------------------------
    # recruiters
    # -----------------------------------------------------------------------
    op.create_table(
        "recruiters",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("linkedin_url", sa.Text(), nullable=True, unique=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column(
            "interaction_count",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column("last_interaction", sa.DateTime(timezone=True), nullable=True),
        sa.Column("first_interaction", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column(
            "source_job_id",
            sa.Integer(),
            sa.ForeignKey("jobs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("TRUE")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_recruiters_email", "recruiters", ["email"])
    op.create_index("ix_recruiters_company", "recruiters", ["company"])
    op.create_index("ix_recruiters_name", "recruiters", ["name"])

    # -----------------------------------------------------------------------
    # search_histories
    # -----------------------------------------------------------------------
    op.create_table(
        "search_histories",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("search_type", sa.String(50), nullable=False, server_default=sa.text("'semantic'")),
        sa.Column(
            "filters",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("result_count", sa.Integer(), nullable=True),
        sa.Column("is_saved", sa.Boolean(), nullable=False, server_default=sa.text("FALSE")),
        sa.Column("saved_name", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_search_histories_user_id", "search_histories", ["user_id"])
    op.create_index(
        "ix_search_histories_user_created",
        "search_histories",
        ["user_id", "created_at"],
    )
    op.create_index(
        "ix_search_histories_saved",
        "search_histories",
        ["user_id", "is_saved"],
    )


def downgrade() -> None:
    op.drop_table("search_histories")
    op.drop_table("recruiters")
    op.drop_table("applications")
    op.execute("DROP TYPE IF EXISTS applicationstatus;")
    op.drop_table("bookmarks")
    op.drop_table("hidden_jobs")
    op.drop_table("jobs")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS vector;")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")

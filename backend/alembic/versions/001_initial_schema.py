"""Initial schema - all tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

Creates the complete OpportunityIQ database schema including:
- users, jobs, bookmarks, applications, recruiters
- search_history, hidden_jobs, notifications, user_preferences
- pgvector extension for semantic job matching
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
    # Enable pgvector extension
    # Must be done before creating any vector columns.
    # -----------------------------------------------------------------------
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")  # For text search
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')  # For uuid_generate_v4()

    # -----------------------------------------------------------------------
    # users
    # -----------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("picture", sa.Text(), nullable=True),
        sa.Column("google_id", sa.String(255), nullable=True, unique=True),
        sa.Column(
            "preferences",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'{}'::jsonb"),
            comment="Arbitrary user preferences JSON blob",
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            onupdate=sa.text("NOW()"),
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("TRUE"),
        ),
        sa.Column("hashed_password", sa.String(255), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=True)

    # -----------------------------------------------------------------------
    # jobs
    # -----------------------------------------------------------------------
    op.create_table(
        "jobs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("company", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column(
            "remote_type",
            sa.String(50),
            nullable=True,
            comment="remote | hybrid | onsite",
        ),
        sa.Column("salary_min", sa.Integer(), nullable=True),
        sa.Column("salary_max", sa.Integer(), nullable=True),
        sa.Column("salary_currency", sa.String(10), nullable=True, server_default=sa.text("'USD'")),
        sa.Column("source_platform", sa.String(100), nullable=True),
        sa.Column("source_url", sa.Text(), nullable=False, unique=True),
        sa.Column("recruiter_name", sa.String(255), nullable=True),
        sa.Column("recruiter_linkedin", sa.Text(), nullable=True),
        sa.Column("recruiter_email", sa.String(255), nullable=True),
        sa.Column(
            "posted_date",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "scraped_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("TRUE"),
        ),
        sa.Column(
            "job_type",
            sa.String(50),
            nullable=True,
            comment="full-time | part-time | contract | internship | freelance",
        ),
        sa.Column(
            "seniority_level",
            sa.String(50),
            nullable=True,
            comment="entry | mid | senior | lead | principal | executive",
        ),
        sa.Column("industry", sa.String(255), nullable=True),
        sa.Column(
            "match_score",
            sa.Float(),
            nullable=True,
            comment="AI-computed relevance score 0-100",
        ),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("why_relevant", sa.Text(), nullable=True),
        sa.Column(
            "missing_skills",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
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
            server_default=sa.text("'{}'::jsonb"),
        ),
        # pgvector column - 1536 dimensions for text-embedding-3-small
        sa.Column(
            "embedding",
            sa.Text(),
            nullable=True,
            comment="Stored as text; cast to vector(1536) via raw SQL",
        ),
    )
    # Replace the text column with a real vector column using raw DDL
    op.execute("ALTER TABLE jobs DROP COLUMN embedding;")
    op.execute("ALTER TABLE jobs ADD COLUMN embedding vector(1536);")

    op.create_index("ix_jobs_source_url", "jobs", ["source_url"], unique=True)
    op.create_index("ix_jobs_company", "jobs", ["company"])
    op.create_index("ix_jobs_posted_date", "jobs", ["posted_date"])
    op.create_index("ix_jobs_match_score", "jobs", ["match_score"])
    op.create_index("ix_jobs_is_active", "jobs", ["is_active"])
    op.create_index("ix_jobs_scraped_at", "jobs", ["scraped_at"])
    # GIN index for full-text search on description
    op.execute(
        "CREATE INDEX ix_jobs_description_fts ON jobs "
        "USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));"
    )
    # HNSW index for approximate nearest-neighbour vector search
    op.execute(
        "CREATE INDEX ix_jobs_embedding_hnsw ON jobs "
        "USING hnsw (embedding vector_cosine_ops) "
        "WITH (m = 16, ef_construction = 64);"
    )

    # -----------------------------------------------------------------------
    # bookmarks
    # -----------------------------------------------------------------------
    op.create_table(
        "bookmarks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint("user_id", "job_id", name="uq_bookmarks_user_job"),
    )
    op.create_index("ix_bookmarks_user_id", "bookmarks", ["user_id"])
    op.create_index("ix_bookmarks_job_id", "bookmarks", ["job_id"])

    # -----------------------------------------------------------------------
    # applications
    # -----------------------------------------------------------------------
    op.create_table(
        "applications",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(50),
            nullable=False,
            server_default=sa.text("'applied'"),
            comment="applied | screening | interview | offer | rejected | withdrawn | accepted",
        ),
        sa.Column(
            "applied_date",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("next_action", sa.String(255), nullable=True),
        sa.Column(
            "next_action_date",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_applications_user_id", "applications", ["user_id"])
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_status", "applications", ["status"])

    # -----------------------------------------------------------------------
    # recruiters
    # -----------------------------------------------------------------------
    op.create_table(
        "recruiters",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("linkedin_url", sa.Text(), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column(
            "interaction_count",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "last_interaction",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "rating",
            sa.Integer(),
            nullable=True,
            comment="1-5 star rating",
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_recruiters_email", "recruiters", ["email"])
    op.create_index("ix_recruiters_linkedin_url", "recruiters", ["linkedin_url"])
    op.create_index("ix_recruiters_company", "recruiters", ["company"])

    # -----------------------------------------------------------------------
    # search_history
    # -----------------------------------------------------------------------
    op.create_table(
        "search_history",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column(
            "filters",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("result_count", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_search_history_user_id", "search_history", ["user_id"])
    op.create_index("ix_search_history_created_at", "search_history", ["created_at"])

    # -----------------------------------------------------------------------
    # hidden_jobs
    # -----------------------------------------------------------------------
    op.create_table(
        "hidden_jobs",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
        sa.Column(
            "job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
        sa.Column(
            "hidden_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_hidden_jobs_user_id", "hidden_jobs", ["user_id"])

    # -----------------------------------------------------------------------
    # notifications
    # -----------------------------------------------------------------------
    op.create_table(
        "notifications",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "type",
            sa.String(50),
            nullable=False,
            comment="daily_digest | new_match | application_reminder | system",
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "sent_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("FALSE"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"])
    op.create_index("ix_notifications_type", "notifications", ["type"])

    # -----------------------------------------------------------------------
    # user_preferences
    # -----------------------------------------------------------------------
    op.create_table(
        "user_preferences",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
        sa.Column(
            "min_match_score",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("60"),
            comment="Minimum AI match score to include job in digest",
        ),
        sa.Column(
            "preferred_locations",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "preferred_roles",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "excluded_companies",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "required_skills",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "notification_email",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("TRUE"),
        ),
        sa.Column(
            "notification_telegram",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("FALSE"),
        ),
        sa.Column(
            "digest_time",
            sa.String(5),
            nullable=False,
            server_default=sa.text("'08:00'"),
            comment="HH:MM format",
        ),
        sa.Column(
            "scoring_weights",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=sa.text(
                '\'{"skills": 0.4, "experience": 0.3, "location": 0.15, "salary": 0.15}\'::jsonb'
            ),
            comment="Relative weights used by the AI scoring engine",
        ),
        sa.Column(
            "salary_min_expectation",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "salary_max_expectation",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "remote_preference",
            sa.String(20),
            nullable=True,
            server_default=sa.text("'any'"),
            comment="any | remote | hybrid | onsite",
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )


def downgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_table("user_preferences")
    op.drop_table("notifications")
    op.drop_table("hidden_jobs")
    op.drop_table("search_history")
    op.drop_table("recruiters")
    op.drop_table("applications")
    op.drop_table("bookmarks")
    op.drop_table("jobs")
    op.drop_table("users")

    # Extensions
    op.execute("DROP EXTENSION IF EXISTS vector;")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp";')

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from app.models.user import User
from app.core.security import hash_password
from app.core.logging_config import logger


class UserCreate(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    google_id: Optional[str] = None
    password: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, Any]] = None
    telegram_chat_id: Optional[str] = None


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_google_id(self, google_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.google_id == google_id))
        return result.scalar_one_or_none()

    async def create_user(self, data: UserCreate) -> User:
        """Create a new user."""
        existing = await self.get_by_email(data.email)
        if existing:
            raise ValueError(f"User with email {data.email} already exists")

        user = User(
            email=data.email,
            name=data.name,
            picture=data.picture,
            google_id=data.google_id,
            hashed_password=hash_password(data.password) if data.password else None,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        logger.info(f"Created user: {user.email}")
        return user

    async def update_user(self, user_id: int, data: UserUpdate) -> Optional[User]:
        """Update user profile fields."""
        user = await self.get_by_id(user_id)
        if not user:
            return None

        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        user.updated_at = datetime.now(timezone.utc)

        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update_preferences(self, user_id: int, preferences: Dict[str, Any]) -> Optional[User]:
        """Merge new preferences with existing ones."""
        user = await self.get_by_id(user_id)
        if not user:
            return None

        existing_prefs = user.preferences or {}
        existing_prefs.update(preferences)
        user.preferences = existing_prefs
        user.updated_at = datetime.now(timezone.utc)
        self.db.add(user)
        await self.db.flush()
        return user

    async def update_notification_preferences(
        self, user_id: int, notification_prefs: Dict[str, Any]
    ) -> Optional[User]:
        """Update notification preferences."""
        user = await self.get_by_id(user_id)
        if not user:
            return None

        existing = user.notification_preferences or {}
        existing.update(notification_prefs)
        user.notification_preferences = existing
        user.updated_at = datetime.now(timezone.utc)
        self.db.add(user)
        await self.db.flush()
        return user

    async def deactivate_user(self, user_id: int) -> bool:
        """Soft-delete a user."""
        user = await self.get_by_id(user_id)
        if not user:
            return False
        user.is_active = False
        user.updated_at = datetime.now(timezone.utc)
        self.db.add(user)
        logger.info(f"Deactivated user: {user_id}")
        return True

    async def update_last_login(self, user_id: int):
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_login=datetime.now(timezone.utc))
        )

    async def get_all_active_users(self) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.is_active == True).order_by(User.created_at)
        )
        return result.scalars().all()

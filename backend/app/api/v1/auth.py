from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_google_auth_url,
    exchange_google_code,
    get_google_user_info,
    verify_google_id_token,
)
from app.models.user import User
from app.api.deps import get_current_user
from app.core.logging_config import logger

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    name: str
    picture: Optional[str] = None


class GoogleTokenRequest(BaseModel):
    id_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


async def get_or_create_user_from_google(db: AsyncSession, google_info: dict) -> User:
    """Upsert user based on Google account info."""
    email = google_info.get("email")
    google_id = google_info.get("sub")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        user.name = google_info.get("name", user.name)
        user.picture = google_info.get("picture", user.picture)
        user.google_id = google_id
        user.last_login = datetime.now(timezone.utc)
    else:
        user = User(
            email=email,
            name=google_info.get("name", email.split("@")[0]),
            picture=google_info.get("picture"),
            google_id=google_id,
            is_active=True,
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.flush()
    await db.refresh(user)
    return user


@router.get("/google/login")
async def google_login(state: Optional[str] = Query(default="")):
    """Redirect to Google OAuth consent screen."""
    auth_url = get_google_auth_url(state=state or "")
    return {"auth_url": auth_url}


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    state: Optional[str] = Query(default=""),
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback, exchange code for tokens."""
    try:
        token_data = await exchange_google_code(code)
        access_token_google = token_data.get("access_token")
        user_info = await get_google_user_info(access_token_google)

        user = await get_or_create_user_from_google(db, user_info)
        await db.commit()

        jwt_access = create_access_token({"sub": str(user.id)})
        jwt_refresh = create_refresh_token({"sub": str(user.id)})

        logger.info(f"User logged in via Google OAuth: {user.email}")
        return TokenResponse(
            access_token=jwt_access,
            refresh_token=jwt_refresh,
            user_id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth callback failed: {str(e)}",
        )


@router.post("/google/token", response_model=TokenResponse)
async def google_id_token_login(
    request: GoogleTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login via Google ID token (for mobile / SPA flows)."""
    user_info = await verify_google_id_token(request.id_token)
    user = await get_or_create_user_from_google(db, user_info)
    await db.commit()

    jwt_access = create_access_token({"sub": str(user.id)})
    jwt_refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=jwt_access,
        refresh_token=jwt_refresh,
        user_id=user.id,
        email=user.email,
        name=user.name,
        picture=user.picture,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    payload = verify_token(request.refresh_token, token_type="refresh")
    user_id = int(payload.get("sub"))

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access = create_access_token({"sub": str(user.id)})
    new_refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user_id=user.id,
        email=user.email,
        name=user.name,
        picture=user.picture,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout (stateless JWT — client should discard tokens)."""
    logger.info(f"User logged out: {current_user.email}")
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture,
        "is_active": current_user.is_active,
        "preferences": current_user.preferences,
        "notification_preferences": current_user.notification_preferences,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login,
    }

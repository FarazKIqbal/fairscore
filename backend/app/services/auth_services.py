import bcrypt
import hmac
import hashlib
import json
import os
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.db.supabase import supabase


# -----------------------------
# Password utils
# -----------------------------
def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    pw = password.encode("utf-8")[:72]
    return bcrypt.checkpw(pw, hashed.encode("utf-8"))


# -----------------------------
# Simple token utils (DB-only auth without Supabase Auth)
# -----------------------------
_TOKEN_SECRET = os.environ.get("TOKEN_SECRET")
_WEAK_TOKEN_SECRETS = {
    "",
    "dev-secret-change-me",
    "change-me",
    "changeme",
    "secret",
}


def _validate_token_secret(secret: str | None) -> str:
    if not secret or secret.strip().lower() in _WEAK_TOKEN_SECRETS or len(secret) < 32:
        raise RuntimeError(
            "TOKEN_SECRET must be a random secret of at least 32 characters."
        )
    return secret


_TOKEN_SECRET = _validate_token_secret(_TOKEN_SECRET)
_TOKEN_TTL_HOURS = 24

def _b64url_encode(data: bytes) -> str:
    import base64
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(data: str) -> bytes:
    import base64
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data)


def create_token(userid: str, role: str) -> str:
    """Create a simple HMAC-signed token (not full JWT, but compatible pattern)."""
    payload = {
        "uid": userid,
        "role": role,
        "exp": (datetime.now(timezone.utc) + timedelta(hours=_TOKEN_TTL_HOURS)).isoformat(),
    }
    body = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    sig = _b64url_encode(hmac.new(_TOKEN_SECRET.encode(), body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"


def verify_token(token: str):
    """Verify token and return (userid, role) or None."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        body, sig = parts

        expected_sig = _b64url_encode(hmac.new(_TOKEN_SECRET.encode(), body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected_sig):
            return None

        payload = json.loads(_b64url_decode(body))
        exp = datetime.fromisoformat(payload["exp"])
        if datetime.now(timezone.utc) > exp:
            return None

        return payload["uid"], payload["role"]
    except Exception:
        return None


# -----------------------------
# Register
# -----------------------------
def register_user(data):
    #password length validation
    if len(data.password) < 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 7 characters long"
        )

    email = data.email.lower().strip()

    # Check if user exists
    existing = supabase.table("users") \
        .select("id") \
        .eq("email", email) \
        .execute()

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    hashed = hash_password(data.password)

    res = supabase.table("users").insert({
        "name": data.name,
        "email": email,
        "password": hashed,
        "role": data.role
    }).execute()

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed"
        )

    user = res.data[0]
    token = create_token(user["id"], user["role"])
    return {
        "userid": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "token": token
    }


# -----------------------------
# Login
# -----------------------------
def login_user(data):
    email = data.email.lower().strip()

    res = supabase.table("users") \
        .select("*") \
        .eq("email", email) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    user = res.data

    if not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_token(user["id"], user["role"])

    return {
        "userid": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "token": token
    }

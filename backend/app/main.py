import lightgbm
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

# Load .env from the backend/ directory (one level up from app/)
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if not load_dotenv(_env_path):
    print(f"Warning: .env file not found at {_env_path}. Make sure to create one with the necessary environment variables.")

from app.db.supabase import supabase
from app.services.auth_services import verify_token

# Auth dependency
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate the Bearer token and return the user ID."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    result = verify_token(token)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    userid, role = result
    return userid

from app.routes.auth import router as auth_router
from app.routes.borrower import router as borrower_router
from app.routes.lender import router as lender_router

app = FastAPI(title="FairScore Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routes live under /api/v1 to match the frontend base URL
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(borrower_router)
api_router.include_router(lender_router)

app.include_router(api_router)

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
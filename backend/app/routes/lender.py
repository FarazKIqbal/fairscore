import logging

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.lender import (
    LenderDetailsSchema,
    LenderDetailsUpdateSchema,
    ApproveBorrowerSchema,
    SkipBorrowerSchema
)
from app.services.lender_services import (
    create_lender_details,
    get_lender_details,
    update_lender_details,
    get_loan_requests,
    approve_borrower,
    skip_borrower,
    get_approved_borrowers,
    get_borrower_review_insights,
    check_lender_onboarding,
)
from app.main import get_current_user

router = APIRouter(prefix="/lender", tags=["Lender"])
logger = logging.getLogger(__name__)


def verify_lender_access(lender_id: str, current_user_id: str = Depends(get_current_user)):
    """Verify that the requested lender_id matches the authenticated user."""
    if lender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return lender_id


@router.post("/details", status_code=status.HTTP_201_CREATED)
def lender_details_create(data: LenderDetailsSchema, current_user_id: str = Depends(get_current_user)):
    if data.lender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create lender details for another user"
        )
    try:
        return create_lender_details(data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create lender details: {str(e)}"
        )


@router.get("/details")
def lender_details_get(lender_id: str = Depends(verify_lender_access)):
    try:
        return get_lender_details(lender_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender details not found"
        )


@router.put("/details")
def lender_details_update(data: LenderDetailsUpdateSchema, current_user_id: str = Depends(get_current_user)):
    if data.lender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update lender details for another user"
        )
    try:
        return update_lender_details(data)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update lender details"
        )


@router.get("/loan-requests")
def loan_requests(lender_id: str = Depends(verify_lender_access)):
    try:
        requests = get_loan_requests(lender_id)
        if not requests:
            return []
        return requests
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch loan requests"
        )


@router.post("/approve")
def approve(data: ApproveBorrowerSchema, current_user_id: str = Depends(get_current_user)):
    if data.lender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve for another lender"
        )
    try:
        return approve_borrower(data.lender_id, data.user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as exc:
        logger.exception(
            "Failed to approve borrower %s for lender %s",
            data.user_id,
            data.lender_id,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to approve borrower: {str(exc)}"
        )


@router.post("/skip")
def skip(data: SkipBorrowerSchema, current_user_id: str = Depends(get_current_user)):
    if data.lender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to skip for another lender"
        )
    try:
        return skip_borrower(data.lender_id, data.user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to skip borrower"
        )


@router.get("/approved-borrowers")
def approved_borrowers(lender_id: str = Depends(verify_lender_access)):
    try:
        borrowers = get_approved_borrowers(lender_id)
        if not borrowers:
            return []
        return borrowers
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch approved borrowers"
        )


@router.get("/review-insights")
def review_insights(
    lender_id: str = Depends(verify_lender_access),
    borrower_id: str = Query(...)
):
    try:
        return get_borrower_review_insights(lender_id, borrower_id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch borrower review insights"
        )


@router.get("/onboarding-status")
def onboarding_status(lender_id: str):
    try:
        onboarded = check_lender_onboarding(lender_id)
        return {"onboarded": onboarded}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check onboarding status"
        )
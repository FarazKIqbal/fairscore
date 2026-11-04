from pydantic import BaseModel, Field, StringConstraints, model_validator
from typing import Annotated, Literal


UserIdStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=64)]
LenderTypeStr = Literal["individual", "financial_institution"]


# -----------------------------
# POST /lender/details
# -----------------------------
class LenderDetailsSchema(BaseModel):
    lender_id: UserIdStr = Field(alias="lenderId")
    type: LenderTypeStr
    capacity: float = Field(gt=0)
    loan_amount_from: float = Field(gt=0, alias="loanAmountFrom")
    loan_amount_to: float = Field(gt=0, alias="loanAmountTo")
    interest: float = Field(gt=0, le=100)

    @model_validator(mode="after")
    def validate_limits(self):
        if self.loan_amount_from >= self.loan_amount_to:
            raise ValueError('Loan range "From" must be less than "To".')
        if self.loan_amount_to > self.capacity:
            raise ValueError("Maximum loan amount cannot exceed lending capacity.")
        return self


class LenderDetailsUpdateSchema(BaseModel):
    lender_id: UserIdStr = Field(alias="lenderID")
    capacity: float = Field(gt=0)
    loan_amount_from: float = Field(gt=0, alias="loanAmountFrom")
    loan_amount_to: float = Field(gt=0, alias="loanAmountTo")
    interest: float = Field(gt=0, le=100)

    @model_validator(mode="after")
    def validate_limits(self):
        if self.loan_amount_from >= self.loan_amount_to:
            raise ValueError('Loan range "From" must be less than "To".')
        if self.loan_amount_to > self.capacity:
            raise ValueError("Maximum loan amount cannot exceed lending capacity.")
        return self

class ApproveBorrowerSchema(BaseModel):
    lender_id: UserIdStr = Field(alias="lenderId")
    user_id: UserIdStr = Field(alias="userId")

class SkipBorrowerSchema(BaseModel):
    lender_id: UserIdStr = Field(alias="lenderId")
    user_id: UserIdStr = Field(alias="userid")

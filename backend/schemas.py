from pydantic import BaseModel, Field
from typing import Literal

# ===== AUTH =====
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str

# ===== USERS =====
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: Literal["admin", "client"] = "client"

class UserOut(UserBase):
    id: int
    role: Literal["admin", "client"] = "client"
    is_admin: bool

    class Config:
        from_attributes = True

# ===== ACCOUNTS =====
class AccountCreate(BaseModel):
    user_id: int
    number: str
    initial_balance: float = 0.0

class AccountOut(BaseModel):
    id: int
    user_id: int
    number: str
    balance: float

    class Config:
        from_attributes = True

# ===== TRANSACTIONS =====
class DepositRequest(BaseModel):
    account_id: int
    amount: float = Field(gt=0)

class WithdrawRequest(BaseModel):
    account_id: int
    amount: float = Field(gt=0)

class TransactionOut(BaseModel):
    id: int
    account_id: int
    type: Literal["deposit", "withdraw"]
    amount: float

    class Config:
        from_attributes = True

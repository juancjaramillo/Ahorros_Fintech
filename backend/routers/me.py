from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.database import get_db
from backend.models import Account, Transaction, User
from backend.schemas import AccountOut, TransactionOut
from backend.security import get_current_client  

router = APIRouter(prefix="/api/me", tags=["me"])

@router.get("/accounts", response_model=List[AccountOut])
def my_accounts(db: Session = Depends(get_db), current_user: User = Depends(get_current_client)):
    q = select(Account).where(Account.user_id == current_user.id)
    return db.execute(q).scalars().all()

@router.get("/transactions", response_model=List[TransactionOut])
def my_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_client)):
    q = (
        select(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .where(Account.user_id == current_user.id)
        .order_by(Transaction.timestamp.desc())
    )
    return db.execute(q).scalars().all()


alias = APIRouter(prefix="/api", tags=["me"])
alias.add_api_route("/accounts/me", my_accounts, methods=["GET"], response_model=List[AccountOut])
alias.add_api_route("/transactions/me", my_transactions, methods=["GET"], response_model=List[TransactionOut])

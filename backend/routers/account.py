from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("", response_model=List[schemas.AccountOut], dependencies=[Depends(require_admin)])
def list_accounts(db: Session = Depends(get_db)):
    return crud.get_accounts(db)


@router.post("", response_model=schemas.AccountOut)
def create_account(data: schemas.AccountCreate, db: Session = Depends(get_db)):
    return crud.create_account(db, data=data)

@router.get("/me", response_model=List[schemas.AccountOut])
def my_accounts(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_accounts_by_user_id(db, current_user.id)


@router.post("/deposit", dependencies=[Depends(require_admin)])
def deposit_admin(data: schemas.DepositRequest, db: Session = Depends(get_db)):
    acc = crud.get_account(db, data.account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    crud.process_transaction(db, data.account_id, data.amount, "deposit")
    acc = crud.get_account(db, data.account_id)
    return {"balance": acc.balance}

@router.post("/withdraw", dependencies=[Depends(require_admin)])
def withdraw_admin(data: schemas.WithdrawRequest, db: Session = Depends(get_db)):
    acc = crud.get_account(db, data.account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    if acc.balance < data.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    crud.process_transaction(db, data.account_id, data.amount, "withdraw")
    acc = crud.get_account(db, data.account_id)
    return {"balance": acc.balance}

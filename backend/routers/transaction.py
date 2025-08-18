from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.post("/deposit", status_code=201)
def deposit(data: schemas.DepositRequest, db: Session = Depends(get_db)):
    acc = crud.get_account(db, data.account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    tx = crud.process_transaction(db, data.account_id, data.amount, "deposit")
    acc = crud.get_account(db, data.account_id)
  
    return {
        "id": getattr(tx, "id", None),
        "account_id": data.account_id,
        "type": "deposit",
        "amount": data.amount,
        "new_balance": acc.balance,
    }

@router.post("/withdraw")
def withdraw(data: schemas.WithdrawRequest, db: Session = Depends(get_db)):
    acc = crud.get_account(db, data.account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    if acc.balance < data.amount:
      
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    tx = crud.process_transaction(db, data.account_id, data.amount, "withdraw")
    acc = crud.get_account(db, data.account_id)
    return {
        "id": getattr(tx, "id", None),
        "account_id": data.account_id,
        "type": "withdraw",
        "amount": data.amount,
        "new_balance": acc.balance,
    }

@router.get("", response_model=List[schemas.TransactionOut], dependencies=[Depends(require_admin)])
def list_all(db: Session = Depends(get_db)):
    return crud.get_transactions(db)

@router.get("/me", response_model=List[schemas.TransactionOut])
def list_mine(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_transactions_for_user(db, current_user.id)


@router.get("/by-account/{account_id}", response_model=List[schemas.TransactionOut], dependencies=[Depends(require_admin)])
def list_by_account(account_id: int, db: Session = Depends(get_db)):
    return crud.get_transactions_by_account(db, account_id)

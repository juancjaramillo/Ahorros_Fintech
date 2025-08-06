from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import crud, schemas
from backend.database import get_db
from backend.security import get_current_user, require_admin

router = APIRouter(prefix="/transactions", tags=["Transactions"])

# Admin – todas
@router.get("/all", response_model=list[schemas.TransactionOut],
            dependencies=[Depends(require_admin)])
def list_all(db: Session = Depends(get_db)):
    return crud.get_transactions(db)

# Cliente – solo sus cuentas
@router.get("/me", response_model=list[schemas.TransactionOut])
def my_tx(user=Depends(get_current_user),
          db: Session = Depends(get_db)):
    my_ids = {a.id for a in crud.get_accounts_by_user_id(db, user.id)}
    return [tx for tx in crud.get_transactions(db) if tx.account_id in my_ids]

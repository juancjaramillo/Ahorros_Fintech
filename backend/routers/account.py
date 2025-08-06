from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import crud, schemas
from backend.database import get_db
from backend.security import get_current_user, require_admin

router = APIRouter(prefix="/accounts", tags=["Accounts"])

# ---------- CRUD cuentas ----------
@router.post("/", response_model=schemas.AccountOut,
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_account_endpoint(acct: schemas.AccountCreate,
                            db: Session = Depends(get_db)):
    return crud.create_account(db, acct)


@router.get("/", response_model=list[schemas.AccountOut])
def list_accounts(user=Depends(get_current_user),
                  user_id: int | None = None,
                  db: Session = Depends(get_db)):

    # ?user_id=...   (solo admin)
    if user_id is not None:
        if user.role != "admin":
            raise HTTPException(status.HTTP_403_FORBIDDEN,
                                "Solo admin puede ver otras cuentas")
        return crud.get_accounts_by_user_id(db, user_id)

    # sin query param
    return (crud.get_accounts(db) if user.role == "admin"
            else crud.get_accounts_by_user_id(db, user.id))


# ---------- Movimientos ----------
@router.post("/deposit", response_model=schemas.TransactionOut)
def deposit(tx: schemas.TransactionIn,
            user=Depends(get_current_user),
            db: Session = Depends(get_db)):
    if user.role != "admin" and crud.get_account(db, tx.account_id).user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Sin permiso")
    return crud.process_transaction(db, tx.account_id, tx.amount, "deposit")


@router.post("/withdraw", response_model=schemas.TransactionOut)
def withdraw(tx: schemas.TransactionIn,
             user=Depends(get_current_user),
             db: Session = Depends(get_db)):
    if user.role != "admin" and crud.get_account(db, tx.account_id).user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Sin permiso")

    result = crud.process_transaction(db, tx.account_id, tx.amount, "withdraw")
    if not result:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Fondos insuficientes")
    return result

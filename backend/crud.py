"""
backend/crud.py
Operaciones de BD centralizadas: cuentas, transacciones y usuarios.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from .models import User, Account, Transaction
from .schemas import AccountCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ──────────────── Helpers contraseña ────────────────
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ──────────────── Usuarios ──────────────────────────
def create_user(db: Session, username: str, password: str, role: str) -> User:
    user = User(
        username=username,
        hashed_password=get_password_hash(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = db.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.hashed_password):
        return user
    return None

# ──────────────── Cuentas ───────────────────────────
def get_accounts(db: Session) -> list[Account]:
    return db.query(Account).all()

def get_account(db: Session, account_id: int) -> Account | None:
    return db.query(Account).get(account_id)

def get_accounts_by_user_id(db: Session, user_id: int) -> list[Account]:
    return db.query(Account).filter(Account.user_id == user_id).all()

def create_account(db: Session, acct: AccountCreate) -> Account:
    new = Account(
        account_name=acct.account_name,
        balance=acct.balance,
        user_id=acct.user_id,
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

# ──────────────── Transacciones ─────────────────────
def get_transactions(db: Session) -> list[Transaction]:
    return db.query(Transaction).all()

def process_transaction(
    db: Session, account_id: int, amount: float, tx_type: str
) -> Transaction | None:
    acc = db.query(Account).get(account_id)
    if not acc:
        return None
    if tx_type == "withdraw" and acc.balance < amount:
        return None

    acc.balance += amount if tx_type == "deposit" else -amount
    tx = Transaction(
        account_id=account_id,
        amount=amount,
        type=tx_type,
        timestamp=datetime.utcnow(),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    db.refresh(acc)
    return tx

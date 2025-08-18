from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from .models import User, Account, Transaction
from .schemas import AccountCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, password: str, role: str) -> User:
    user = User(username=username, hashed_password=get_password_hash(password), role=role)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        existing = get_user_by_username(db, username)
        if existing:
            return existing
        raise


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(db, username)
    if user and verify_password(password, user.hashed_password):
        return user
    return None


def get_accounts(db: Session) -> list[Account]:
    return db.query(Account).all()


def get_account(db: Session, account_id: int) -> Account | None:
    return db.get(Account, account_id)


def get_accounts_by_user_id(db: Session, user_id: int) -> list[Account]:
    return db.query(Account).filter(Account.user_id == user_id).all()


def create_account(db: Session, data: AccountCreate) -> Account:
    acc = Account(user_id=data.user_id, number=data.number, balance=float(data.initial_balance or 0.0))
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


def get_transactions(db: Session) -> list[Transaction]:
    return db.query(Transaction).order_by(Transaction.timestamp.desc()).all()


def get_transactions_by_account(db: Session, account_id: int) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.account_id == account_id)
        .order_by(Transaction.timestamp.desc())
        .all()
    )


def get_transactions_for_user(db: Session, user_id: int) -> list[Transaction]:
    return (
        db.query(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .filter(Account.user_id == user_id)
        .order_by(Transaction.timestamp.desc())
        .all()
    )


def process_transaction(db: Session, account_id: int, amount: float, tx_type: str) -> Transaction | None:
    acc = db.get(Account, account_id)
    if not acc:
        return None
    if tx_type == "withdraw" and acc.balance < amount:
        return None
    acc.balance = acc.balance + amount if tx_type == "deposit" else acc.balance - amount
    tx = Transaction(account_id=account_id, amount=amount, type=tx_type, timestamp=datetime.utcnow())
    db.add(tx)
    db.add(acc)
    db.commit()
    db.refresh(tx)
    db.refresh(acc)
    return tx

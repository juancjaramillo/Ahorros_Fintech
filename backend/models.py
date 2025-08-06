from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, func
)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role            = Column(String, nullable=False)      # admin | client

    accounts = relationship("Account", back_populates="owner", cascade="all, delete")


class Account(Base):
    __tablename__ = "accounts"
    id           = Column(Integer, primary_key=True, index=True)
    account_name = Column(String, nullable=False)         # nombre descriptivo
    balance      = Column(Float, default=0.0)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner        = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account",
                                cascade="all, delete")


class Transaction(Base):
    __tablename__ = "transactions"
    id         = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount     = Column(Float, nullable=False)
    type       = Column(String, nullable=False)           # deposit | withdraw
    timestamp  = Column(DateTime(timezone=True), server_default=func.now())

    account    = relationship("Account", back_populates="transactions")

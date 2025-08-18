import os
import sys
from typing import Callable, Optional

import pytest
from fastapi import Depends, HTTPException, Request
from fastapi.testclient import TestClient
from jose import jwt, JWTError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# --- Rutas de import ---
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app
from backend.database import Base, get_db
from backend import crud, models
from backend.security import get_current_user, require_admin
from backend.config import SECRET_KEY, ALGORITHM  


engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _create_schema():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_current_user(
    request: Request,
    db: Session = Depends(override_get_db),
):
  
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def override_require_admin(
    current_user: models.User = Depends(override_get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user



app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[require_admin] = override_require_admin


# ---------- Fixtures ----------
@pytest.fixture(autouse=True)
def _db_schema_per_test():
    _create_schema()
    yield


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
   
    with TestClient(app) as c:
        yield c


# ---------- Helpers ----------
@pytest.fixture
def make_user(db_session) -> Callable[..., models.User]:
    def _make(
        username: str,
        plain_password: Optional[str] = None,
        role: Optional[str] = None,
        is_admin: Optional[bool] = None,
    ) -> models.User:
        if is_admin is True:
            role_final = "admin"
        elif role:
            role_final = role
        else:
            role_final = "client"

        password_final = plain_password or "secret123"

        existing = (
            db_session.query(models.User)
            .filter(models.User.username == username)
            .first()
        )
        if existing:
            return existing

        return crud.create_user(
            db_session, username=username, password=password_final, role=role_final
        )

    return _make


@pytest.fixture
def make_account(db_session, make_user) -> Callable[..., models.Account]:
    def _make(
        user_id: Optional[int] = None,
        number: Optional[str] = None,
        initial_balance: float = 0.0,
        username: Optional[str] = None,
    ) -> models.Account:
        if user_id is None:
            uname = username or "client_auto"
            user = make_user(username=uname, role="client", plain_password="secret123")
            user_id_real = user.id
        else:
            user_id_real = user_id

        number_final = number or f"ACC-{user_id_real:04d}"

        from backend.schemas import AccountCreate

        payload = AccountCreate(
            user_id=user_id_real,
            number=number_final,
            initial_balance=float(initial_balance),
        )
        return crud.create_account(db_session, payload)

    return _make

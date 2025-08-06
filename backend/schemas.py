# backend/schemas.py
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


# ------------------------------------------------------------------
#  ⚙️  Configuraciones comunes
# ------------------------------------------------------------------
_FROM_ORM = ConfigDict(from_attributes=True)         # reemplaza orm_mode
_JSON_DT  = {datetime: lambda d: d.isoformat()}      # encoder ISO-8601


# ------------------------------------------------------------------
#  Usuarios
# ------------------------------------------------------------------
class UserCreate(BaseModel):
    username: str
    password: str
    role: Literal["admin", "client"]


class UserOut(BaseModel):
    id: int
    username: str
    role: str

    model_config = _FROM_ORM


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ------------------------------------------------------------------
#  Cuentas
# ------------------------------------------------------------------
class AccountCreate(BaseModel):
    account_name: str
    balance: float
    user_id: int


class AccountOut(BaseModel):
    id: int
    account_name: str
    balance: float
    user_id: int

    model_config = _FROM_ORM


# ------------------------------------------------------------------
#  Transacciones
# ------------------------------------------------------------------
class TransactionIn(BaseModel):
    account_id: int
    amount: float               # positivo; el tipo lo define la ruta (/deposit /withdraw)


class TransactionOut(BaseModel):
    id: int
    account_id: int
    amount: float
    type: Literal["deposit", "withdraw"]
    timestamp: datetime         # ← ya no es str

    model_config = ConfigDict(
        **_FROM_ORM,            # hereda from_attributes
        json_encoders=_JSON_DT  # asegura string ISO-8601 al serializar
    )

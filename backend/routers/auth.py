from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas, security

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/auth/login", response_model=schemas.TokenOut)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = security.create_access_token(user.username)
    return {"access_token": token}

@router.post("/admin/login", response_model=schemas.TokenOut)
def admin_login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, data.username, data.password)
    if not user or user.role != "admin":
     
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = security.create_access_token(user.username)
    return {"access_token": token}

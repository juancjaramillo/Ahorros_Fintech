from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas, models
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("", response_model=List[schemas.UserOut], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    users: list[models.User] = db.query(models.User).all()
    return [{"id": u.id, "username": u.username, "role": u.role, "is_admin": (u.role == "admin")} for u in users]


@router.post("", response_model=schemas.UserOut)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = crud.create_user(db, data.username, data.password, role="client")
    return {"id": user.id, "username": user.username, "role": user.role, "is_admin": (user.role == "admin")}

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "is_admin": (current_user.role == "admin"),
    }


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db           # devuelve sesión con yield
from backend.models   import User
from backend.schemas  import UserCreate, UserOut
from backend.crud     import create_user, get_password_hash
from backend.security import require_admin    # asegura token y rol=admin

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_admin)]      # ← todas las rutas son solo-admin
)

# ──────────────────────────── HELPERS ─────────────────────────────
def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no existe",
        )
    return user


# ──────────────────────────── ENDPOINTS ───────────────────────────
@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    """Lista todos los usuarios (solo admin)."""
    return db.query(User).all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def add_user(data: UserCreate, db: Session = Depends(get_db)):
    """Crea un usuario nuevo (username único)."""
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe",
        )
    return create_user(db, data.username, data.password, data.role)


@router.put("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_user(user_id: int, data: UserCreate, db: Session = Depends(get_db)):
    """Actualiza username, password y rol del usuario."""
    user = _get_user_or_404(db, user_id)

    # Si cambia username, comprueba duplicado
    if data.username != user.username and \
       db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de usuario ya usado",
        )

    user.username        = data.username
    user.hashed_password = get_password_hash(data.password)
    user.role            = data.role
    db.commit()


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Elimina un usuario y todas sus cuentas (ON DELETE CASCADE si existe)."""
    user = _get_user_or_404(db, user_id)
    db.delete(user)
    db.commit()

"""
backend/seed.py
• Borra tablas, las recrea y carga datos de ejemplo SIN errores.
"""

from importlib import import_module, reload
import sys
from sqlalchemy.orm import Session
from backend.database import Base, engine, SessionLocal


# ───────────────────────── HELPERS ─────────────────────────
def clear_db() -> None:
    """Elimina tablas en disco y limpia metadata en RAM."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.clear()


def load_models():
    """
    Importa backend.models sobre una MetaData limpia y
    devuelve el módulo (User, Account, Transaction …).
    """
    if "backend.models" in sys.modules:
        return reload(sys.modules["backend.models"])
    return import_module("backend.models")


# ───────────────────────── SEED STEPS ──────────────────────
def seed_users(db: Session, m):
    from backend.crud import create_user                       # import tarde
    data = [
        ("admin",   "Admin123",  "admin"),
        ("client1", "Client123", "client"),
        ("client2", "Client123", "client"),
    ]
    for u, p, r in data:
        if not db.query(m.User).filter(m.User.username == u).first():
            create_user(db, u, p, r)
            print(f"✓ Usuario {u} creado")


def seed_demo(db: Session, m):
    from backend.crud import create_account, process_transaction
    from backend.schemas import AccountCreate

    client1 = db.query(m.User).filter(m.User.username == "client1").first()
    if not client1:
        return

    # ─ Cuentas client1 ──────────────────────────────────────
    if db.query(m.Account).filter(m.Account.user_id == client1.id).count() < 2:
        create_account(
            db,
            AccountCreate(
                account_name="Ahorros Inicial",
                balance=5_000,
                user_id=client1.id,
            ),
        )
        create_account(
            db,
            AccountCreate(
                account_name="Ahorros Extra",
                balance=10_000,
                user_id=client1.id,
            ),
        )
        print("✓ Cuentas de client1 creadas")

    # ─ Transacciones demo ───────────────────────────────────
    if db.query(m.Transaction).count() == 0:
        acc1 = (
            db.query(m.Account)
            .filter(m.Account.user_id == client1.id)
            .first()
        )
        process_transaction(db, acc1.id, 1_000, "deposit")
        process_transaction(db, acc1.id,   200, "withdraw")
        print("✓ Transacciones de ejemplo añadidas")


# ───────────────────────── MAIN ────────────────────────────
def seed() -> None:
    clear_db()                    # 1) borra todo
    models = load_models()        # 2) registra tablas una sola vez
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        seed_users(db, models)
        seed_demo(db,  models)
    finally:
        db.close()


if __name__ == "__main__":
    seed()

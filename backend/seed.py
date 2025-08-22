from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .crud import create_user, create_account, process_transaction
from .schemas import AccountCreate

def run_seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        admin   = create_user(db, "admin",   "admin123",  "admin")
        client1 = create_user(db, "client1", "client123", "client")
        client2 = create_user(db, "client2", "client123", "client")
        print("✓ Usuarios creados: admin, client1, client2")

        acc1 = create_account(db, AccountCreate(user_id=client1.id, number="0001", initial_balance=5000.0))
        acc2 = create_account(db, AccountCreate(user_id=client1.id, number="0002", initial_balance=10000.0))
        acc3 = create_account(db, AccountCreate(user_id=client2.id, number="0003", initial_balance=3000.0))
        print("✓ Cuentas creadas: 0001, 0002 (client1) y 0003 (client2)")

        process_transaction(db, acc1.id, 1000.0, "deposit")
        process_transaction(db, acc1.id,  200.0, "withdraw")
        process_transaction(db, acc2.id,  500.0, "deposit")
        process_transaction(db, acc3.id,  250.0, "deposit")
        process_transaction(db, acc3.id,  100.0, "withdraw")
        print("✓ Transacciones demo creadas")

        print("Seed OK")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()

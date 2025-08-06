# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─── imports propios ─────────────────────────────────────────────────────────
from backend.database import Base, engine
from backend.routers  import auth, account, transaction, user
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Sistema de Ahorros Fintech",
    version="1.0",
    description="API segura para manejo de cuentas de ahorro",
)

# ─── CORS: permite que el frontend (3000) hable con la API (8000) ────────────
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins     = origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)
# ─────────────────────────────────────────────────────────────────────────────

# crea tablas (si no existen) en la BD: C:\xampp82\htdocs\ahorro_app\ahorros.db
Base.metadata.create_all(bind=engine)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)        # /auth/…
app.include_router(user.router)        # /users/…  (solo admin)
app.include_router(account.router)     # /accounts/…
app.include_router(transaction.router) # /transactions/…

# ─────────────────────────────────────────────────────────────────────────────

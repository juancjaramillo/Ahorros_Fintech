from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, account, transaction, user

app = FastAPI(title="Ahorro API")

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crea tablas si no existen
Base.metadata.create_all(bind=engine)

# Healthcheck
@app.get("/healthz")
def healthz():
    return {"ok": True}

# Rutas
app.include_router(auth.router)
app.include_router(account.router)
app.include_router(transaction.router)
app.include_router(user.router)

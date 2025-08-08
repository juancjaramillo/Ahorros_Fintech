import os
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend.routers  import auth, account, transaction, user

app = FastAPI(
    title="Sistema de Ahorros Fintech",
    version="1.0",
    description="API segura para manejo de cuentas de ahorro",
    docs_url="/api/docs",              # <── importante
    openapi_url="/api/openapi.json",   # <── importante
    redoc_url=None,
)

ENV = os.getenv("ENV", "prod")
if ENV == "dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

Base.metadata.create_all(bind=engine)

api_router = APIRouter(prefix="/api")  # <── importante
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(account.router)
api_router.include_router(transaction.router)
app.include_router(api_router)

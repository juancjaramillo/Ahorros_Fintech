<<<<<<< HEAD
FROM python:3.12-slim AS backend

# Evitar archivos .pyc y asegurar logs sin buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo
=======
FROM python:3.12-slim
>>>>>>> 53dba3d (Initial commit: Backend (FastAPI + SQLite) + Frontend (React) + Docker + README)
WORKDIR /app

# Instalar dependencias del sistema si es necesario (compilación)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar cache
COPY backend/requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt
<<<<<<< HEAD

# Copiar solo el código del backend
COPY backend/ .

# Exponer puerto del backend
EXPOSE 8000

# Arrancar FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
=======
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
>>>>>>> 53dba3d (Initial commit: Backend (FastAPI + SQLite) + Frontend (React) + Docker + README)

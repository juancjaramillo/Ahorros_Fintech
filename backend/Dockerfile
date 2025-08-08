FROM python:3.12-slim

# Evitar .pyc y logs buferizados
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Paquetes del sistema (solo si alguna lib de Python compila)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# 1) Copiamos primero requirements para aprovechar caché
COPY backend/requirements.txt .

# 2) Instalamos dependencias
RUN pip install --no-cache-dir -r requirements.txt

# 3) Copiamos SOLO el código del backend (no todo el repo)
COPY backend/ .

# 4) Exponemos puerto y arrancamos Uvicorn
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# backend/Dockerfile  (versión corregida)
FROM python:3.12-slim

# 1) Directorio de trabajo DENTRO del contenedor
WORKDIR /app

# 2) Instala dependencias
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3) Copia el código FastAPI
COPY backend /app

# 4) Expone puerto interno
EXPOSE 8000

# 5) Comando de arranque  ❗️ OJO al módulo
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

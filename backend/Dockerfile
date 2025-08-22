
FROM python:3.12-slim

WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt


COPY backend /app/backend

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DATABASE_URL=sqlite:////data/ahorros.db


VOLUME /data
EXPOSE 8000


CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

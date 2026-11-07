FROM python:3.11-slim

# lightgbm links against the system OpenMP runtime at import time.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ backend/
COPY scripts/ scripts/

RUN useradd -m appuser && chown -R appuser /app
USER appuser

CMD ["sh", "-c", "python scripts/download_models.py && cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

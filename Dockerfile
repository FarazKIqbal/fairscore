# Build stage
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Production stage
FROM python:3.11-slim AS production

# Install system dependencies needed for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /app

# Copy Python requirements first for better caching
COPY requirements.txt backend/requirements.txt ./

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy scripts
COPY scripts/ ./scripts/

# Create necessary directories and set permissions
RUN mkdir -p /app/backend/dataset /app/backend/models && \
    chown -R appuser:appuser /app

USER appuser

# Expose ports
EXPOSE 8000 5173

# Command to run both services
CMD ["python", "scripts/bootstrap_and_run.py", "--backend-host", "0.0.0.0", "--frontend-host", "0.0.0.0"]
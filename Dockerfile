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

# Install Python dependencies (use layer caching)
COPY backend/requirements.txt ./requirements.txt
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy backend source after deps installed (better cache invalidation)
COPY backend/ ./backend/
COPY scripts/ ./scripts/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p /app/backend/dataset /app/backend/models && \
    chown -R appuser:appuser /app

USER appuser

# Expose ports
EXPOSE 8000 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["/opt/venv/bin/python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"] || exit 1

# Command to run both services
CMD ["/opt/venv/bin/python", "scripts/bootstrap_and_run.py", "--backend-host", "0.0.0.0", "--frontend-host", "0.0.0.0"]
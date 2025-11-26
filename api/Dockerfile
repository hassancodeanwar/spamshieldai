# Official lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ARG PORT=5000
ENV PORT=${PORT}

# Set working directory
WORKDIR /app

# Install system dependencies required to build some python packages (scikit-learn, pandas)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        gfortran \
        libopenblas-dev \
        liblapack-dev \
        libgomp1 \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python dependencies
COPY api/requirements-api.txt ./requirements-api.txt
RUN pip install --upgrade pip && pip install -r requirements-api.txt gunicorn

# Copy only the API code into /app (so app.py is at /app/app.py)
COPY api/ /app/

# Copy models (if present in repo root) into the container's /app/models
COPY models/ /app/models/

# Default models dir (for app.py to use fallback if not set as env)
ENV MODELS_DIR=/app/models

# Ensure the models folder exists (avoid failing silently) - optional
RUN mkdir -p /app/models || true

# Expose the port used by the app
EXPOSE ${PORT}

# Default command to run the Flask app with gunicorn using the provided entrypoint
ENV GUNICORN_WORKERS=2
ENV GUNICORN_TIMEOUT=30
COPY api/start.sh /start.sh
ENTRYPOINT ["/start.sh"]

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:${PORT}/api/health || exit 1

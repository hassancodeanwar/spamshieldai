#!/usr/bin/env sh
set -e

echo "Starting SpamShield API..."
echo "PORT=${PORT:-5000}"
echo "Python: $(python -V 2>&1)"
echo "Working dir: $(pwd)"
ls -la /app || true
ls -la /app/models || true

# Ensure models directory exists
MODELS_DIR=${MODELS_DIR:-/app/models}
echo "MODELS_DIR=${MODELS_DIR}"

# If models are not included in the image, attempt to download from MODEL_BASE_URL
if [ ! -f "${MODELS_DIR}/spam_classifier.pkl" ] || [ ! -f "${MODELS_DIR}/vectorizer.pkl" ]; then
  if [ -n "${MODEL_BASE_URL}" ]; then
    echo "Models not found; attempting to download from ${MODEL_BASE_URL}"
    mkdir -p "${MODELS_DIR}"
    for f in spam_classifier.pkl vectorizer.pkl; do
      echo "Downloading ${f}..."
      curl -fSL "${MODEL_BASE_URL}/${f}" -o "${MODELS_DIR}/${f}" || { echo "Failed to download ${f}; exiting"; exit 1; }
    done
  else
    echo "Model files not found and MODEL_BASE_URL not set. The API will serve errors for prediction requests until models are available."
  fi
fi

# Start gunicorn directly - let Railway handle healthchecks
exec gunicorn \
  --workers ${GUNICORN_WORKERS:-2} \
  --bind 0.0.0.0:${PORT:-5000} \
  --timeout ${GUNICORN_TIMEOUT:-120} \
  --log-level info \
  --access-logfile - \
  --error-logfile - \
  app:app

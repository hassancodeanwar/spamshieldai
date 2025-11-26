from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from pathlib import Path
import os

BASE_DIR = Path(os.path.dirname(__file__)).resolve()
# Allow overriding the models directory via env var (defaults to /app/models or ./models relative to app)
DEFAULT_MODELS_DIR = BASE_DIR / 'models'
MODELS_DIR = Path(os.environ.get('MODELS_DIR', str(DEFAULT_MODELS_DIR))).resolve()
# Fallback to a root /models if needed
FALLBACK_MODELS_DIR = Path('/models')

MODEL_PATH = (MODELS_DIR / 'spam_classifier.pkl') if (MODELS_DIR / 'spam_classifier.pkl').exists() else (FALLBACK_MODELS_DIR / 'spam_classifier.pkl')
VECT_PATH = (MODELS_DIR / 'vectorizer.pkl') if (MODELS_DIR / 'vectorizer.pkl').exists() else (FALLBACK_MODELS_DIR / 'vectorizer.pkl')

app = Flask(__name__)
# Enable CORS for all routes (safe for a public read-only prediction API)
CORS(app)

print(f"Using model path: {MODEL_PATH}")
print(f"Using vectorizer path: {VECT_PATH}")
try:
    model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
    vectorizer = joblib.load(VECT_PATH) if VECT_PATH.exists() else None
except Exception as e:
    model = None
    vectorizer = None
    print(f"Error loading model/vectorizer: {e}")

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model not loaded'}), 500
    data = request.get_json(force=True)
    message = data.get('message', '')
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    try:
        msg_vector = vectorizer.transform([message])
        pred = model.predict(msg_vector)[0]
        proba = model.predict_proba(msg_vector)[0]
        label = 'spam' if int(pred) == 1 else 'ham'
        confidence = proba[int(pred)] * 100
        return jsonify({
            'label': label,
            'confidence': round(confidence, 2),
            'input': message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Minimal health endpoints for Railway
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'spamshieldai-api'}), 200

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({'status': 'healthy', 'service': 'spamshieldai-api'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

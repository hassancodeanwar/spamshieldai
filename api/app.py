from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from pathlib import Path
import os

MODEL_PATH = Path(os.path.join(os.path.dirname(__file__), '..', 'models', 'spam_classifier.pkl')).resolve()
VECT_PATH = Path(os.path.join(os.path.dirname(__file__), '..', 'models', 'vectorizer.pkl')).resolve()

app = Flask(__name__)
# Enable CORS for all routes (safe for a public read-only prediction API)
CORS(app)

# Load model/vectorizer once at startup
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECT_PATH)
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

@app.route('/')
def health():
    return jsonify({'status': 'ok', 'api': 'SpamShield'})


@app.route('/api/health')
def api_health():
    # Keep a lightweight, always-available health endpoint for platform checks
    return jsonify({'status': 'ok', 'api': 'SpamShield'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

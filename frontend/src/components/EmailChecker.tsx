/// File: src/components/EmailChecker.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react';

interface AnalysisResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

const EmailChecker: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Prefer configured frontend env var VITE_API_URL if provided (best for production)
  // Vite exposes env vars as import.meta.env.VITE_*
  const VITE_API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || '';
  // Compute API URL dynamically as fallback (helpful for Codespaces / local dev)
  const API_URL = (() => {
    if (VITE_API_URL && VITE_API_URL.length > 0) {
      // If user provided a full endpoint (with /api/analyze) just use it directly
      return VITE_API_URL.endsWith('/api/analyze') ? VITE_API_URL : `${VITE_API_URL.replace(/\/$/, '')}/api/analyze`;
    }
    try {
      const host = window.location.host; // may include port or codespace token like ...-5175.app.github.dev
      // If running on GitHub.dev forwarded port (contains -517), swap the port suffix to 5000
      if (host.includes('-517')) {
        return `${window.location.protocol}//${host.replace('-5175', '-5000')}/api/analyze`;
      }
      // Local dev (vite) -> use localhost:5000
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api/analyze';
      }
      // Fallback: same hostname, port 5000
      return `${window.location.protocol}//${window.location.hostname}:5000/api/analyze`;
    } catch (e) {
      return 'http://localhost:5000/api/analyze';
    }
  })();
  const analyzeEmail = async () => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      // Debug: expose which API URL we're contacting (visible in browser console)
      console.log('Calling backend API:', API_URL);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${subject}\n${emailContent}` })
      });
      if (!res.ok) {
        throw new Error('API error');
      }
      const data = await res.json();
      setResult({
        isSpam: data.label === 'spam',
        score: data.confidence || 0,
        reasons: [
          `Prediction: ${data.label === 'spam' ? 'Likely SPAM' : 'Appears Legitimate'}`,
          `Confidence: ${data.confidence ? data.confidence.toFixed(1) + '%' : 'N/A'}`
        ]
      });
    } catch (err: any) {
      console.error('API request failed:', err);
      setResult({
        isSpam: false,
        score: 0,
        reasons: [err?.message || 'Error contacting backend API.']
      });
    }
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setEmailContent('');
    setSenderEmail('');
    setSubject('');
    setResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">
            Analyze Your Email
          </h2>
        </div>

        <div className="space-y-6">
          {/* Sender Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sender Email Address
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="sender@example.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line of the email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Content
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the email content here..."
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={analyzeEmail}
              disabled={!emailContent.trim() || isAnalyzing}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Email'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div
          className={`bg-white rounded-xl shadow-lg p-8 border-l-4 ${
            result.isSpam ? 'border-red-500' : 'border-green-500'
          }`}
        >
          <div className="flex items-start gap-4 mb-6">
            {result.isSpam ? (
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3
                className={`text-2xl font-bold mb-2 ${
                  result.isSpam ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {result.isSpam ? 'Likely SPAM' : 'Appears Legitimate'}
              </h3>
              <p className="text-slate-600">
                Spam confidence score:{' '}
                <span className="font-semibold">{result.score}%</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-3">
              Analysis Details:
            </h4>
            <ul className="space-y-2">
              {result.reasons.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-slate-700"
                >
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.isSpam && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Do not click any links, download
                attachments, or share personal information. Mark this email as
                spam and delete it immediately.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailChecker;

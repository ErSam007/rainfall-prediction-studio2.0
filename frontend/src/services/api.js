/**
 * API Service for Rainfall AI Backend Communication.
 * Communicates with FastAPI backend running on http://127.0.0.1:8000
 */

// Automatically use relative '/api' in production or when served by backend,
// or fallback to localhost:8000 during Vite local dev (port 5173)
const API_BASE = (typeof window !== 'undefined' && window.location.port === '5173')
  ? 'http://127.0.0.1:8000/api'
  : '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server responded with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch (e) {
      // Non-JSON response
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

export const api = {
  // 1. Health Check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await handleResponse(res);
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  // 2. Upload CSV or Excel file
  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse(res);
  },

  // 3. Load included Sample dataset
  async loadSampleDataset() {
    const res = await fetch(`${API_BASE}/load-sample`, {
      method: 'POST',
    });
    return await handleResponse(res);
  },

  // 4. Get Current Dataset Info
  async getDatasetInfo() {
    const res = await fetch(`${API_BASE}/dataset`);
    return await handleResponse(res);
  },

  // 5. Preprocess Dataset
  async preprocessDataset({ target_column, task_type, binary_threshold = 0.0 }) {
    const res = await fetch(`${API_BASE}/preprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_column, task_type, binary_threshold }),
    });
    return await handleResponse(res);
  },

  // 6. Train Models
  async trainModels(selected_model = null) {
    const res = await fetch(`${API_BASE}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_model }),
    });
    return await handleResponse(res);
  },

  // 7. Get Model Evaluation Results
  async getModels() {
    const res = await fetch(`${API_BASE}/models`);
    return await handleResponse(res);
  },

  // 8. Get Input Features for Prediction Form
  async getFeatures() {
    const res = await fetch(`${API_BASE}/features`);
    return await handleResponse(res);
  },

  // 9. Predict Rainfall
  async predictRainfall({ inputs, model_name = null }) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, model_name }),
    });
    return await handleResponse(res);
  },

  // 10. Get Visualization Summaries
  async getVisualizations(feature = null) {
    const url = feature
      ? `${API_BASE}/visualizations?feature=${encodeURIComponent(feature)}`
      : `${API_BASE}/visualizations`;
    const res = await fetch(url);
    return await handleResponse(res);
  },

  // 11. Reset Session
  async resetSession() {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    return await handleResponse(res);
  },

  // 12. Ask Generative AI Copilot
  async askGenAICopilot({ question, weather_data = {}, is_rain = false, probability = 15.0 }) {
    const res = await fetch(`${API_BASE}/genai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, weather_data, is_rain, probability }),
    });
    return await handleResponse(res);
  },

  // 13. MongoDB Status
  async getDatabaseStatus() {
    const res = await fetch(`${API_BASE}/database/status`);
    return await handleResponse(res);
  },

  // 14. Configure MongoDB URI
  async configureDatabase(uri, db_name = 'rainfall_prediction_db') {
    const res = await fetch(`${API_BASE}/database/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri, db_name }),
    });
    return await handleResponse(res);
  },

  // 15. Get Prediction History from MongoDB
  async getPredictionHistory(limit = 15) {
    const res = await fetch(`${API_BASE}/database/history?limit=${limit}`);
    return await handleResponse(res);
  },
};

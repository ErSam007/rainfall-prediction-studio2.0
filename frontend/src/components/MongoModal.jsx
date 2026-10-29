import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, RefreshCw, X, Server, Layers, Clock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function MongoModal({ isOpen, onClose }) {
  const [dbStatus, setDbStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [mongoUri, setMongoUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchDbData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPredictionHistory(20);
      if (res) {
        setHistory(res.history || []);
        setDbStatus(res.status || null);
      }
    } catch (err) {
      console.error('Failed to fetch DB status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDbData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectMongo = async (e) => {
    e.preventDefault();
    if (!mongoUri.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid MongoDB connection URI.' });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.configureDatabase(mongoUri.trim());
      setDbStatus(res);
      if (res && res.connected) {
        setFeedback({ type: 'success', message: 'Successfully connected to MongoDB!' });
        fetchDbData();
      } else {
        setFeedback({
          type: 'warning',
          message: res?.error || 'Could not connect to MongoDB server. Falling back to active memory cache.'
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to connect to MongoDB.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isConnected = dbStatus?.connected === true;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={22} color="#6ee7b7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>MongoDB Database Center</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                Real-time prediction storage & MongoDB Atlas synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: isConnected ? '#ecfdf5' : '#fffbeb',
            border: `1.5px solid ${isConnected ? '#10b981' : '#f59e0b'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isConnected ? (
                <CheckCircle size={28} color="#059669" />
              ) : (
                <AlertTriangle size={28} color="#d97706" />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: isConnected ? '#065f46' : '#92400e', fontSize: '0.98rem' }}>
                    {isConnected ? 'Connected to MongoDB Database' : 'MongoDB Standby Mode (Memory Fallback)'}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: isConnected ? '#10b981' : '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                    {isConnected ? 'LIVE' : 'STANDBY'}
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {isConnected
                    ? `Database: ${dbStatus?.database || 'rainfall_prediction_db'} | Collection: ${dbStatus?.collection || 'predictions'}`
                    : 'Predictions are cached safely. Connect MongoDB Atlas URI below to persist permanently.'}
                </p>
              </div>
            </div>

            <button
              onClick={fetchDbData}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              backgroundColor: feedback.type === 'success' ? '#d1fae5' : feedback.type === 'warning' ? '#fef3c7' : '#fee2e2',
              color: feedback.type === 'success' ? '#065f46' : feedback.type === 'warning' ? '#92400e' : '#991b1b',
              border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : feedback.type === 'warning' ? '#fde68a' : '#fecaca'}`
            }}>
              {feedback.message}
            </div>
          )}

          {/* Connect MongoDB Form */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} color="#059669" />
              <span>Connect Your MongoDB Atlas / Local Database</span>
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>
              Enter your connection string (e.g. <code>mongodb+srv://admin:pass@cluster0.mongodb.net/rainfall?retryWrites=true&w=majority</code> or <code>mongodb://localhost:27017</code>).
            </p>
            <form onSubmit={handleConnectMongo} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/rainfall_db"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSaving ? <RefreshCw size={15} className="spin-icon" /> : <ArrowRight size={15} />}
                <span>{isSaving ? 'Connecting...' : 'Connect DB'}</span>
              </button>
            </form>
          </div>

          {/* Predictions History Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#2563eb" />
                <span>Recent Saved Predictions ({history.length} records)</span>
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Auto-saved on every prediction
              </span>
            </div>

            {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '30px 20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1',
                color: '#64748b'
              }}>
                <Clock size={28} style={{ opacity: 0.5, marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>No prediction records yet.</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Run a prediction from the studio form and it will be saved here automatically.</p>
              </div>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Time</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Location</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Conditions</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Verdict</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Rain Prob.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((rec, idx) => {
                      const inp = rec.inputs || {};
                      const isRain = rec.verdict_type === 'rain' || rec.is_rain === true;
                      const dateStr = rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${idx+1}`;
                      const locName = rec.location || inp.Location || inp.location || 'Indian City';
                      const tempVal = inp.max_temp ?? inp.MaxTemp;
                      const humVal = inp.humidity_3pm ?? inp.Humidity3pm;
                      const rainProb = rec.probability ?? rec.confidence_percentage ?? (isRain ? 85.0 : 15.0);

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{dateStr}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{locName}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>
                            {tempVal !== undefined ? `${tempVal}°C` : '-'}, {humVal !== undefined ? `${humVal}% Hum` : '-'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: isRain ? '#dbeafe' : '#fef9c3',
                              color: isRain ? '#1d4ed8' : '#a16207'
                            }}>
                              {isRain ? '🌧 Rain' : '☀️ Sunny'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: isRain ? '#2563eb' : '#d97706' }}>
                            {rainProb}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            MongoDB integration active | Safe in-memory fallback enabled
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

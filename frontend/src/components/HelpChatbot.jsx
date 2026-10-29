import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Bot, User, CheckCircle2 } from 'lucide-react';

/**
 * HelpChatbot Component
 * A clean, lightweight floating chatbot positioned in the bottom corner
 * specifically providing interactive guidance on how to use the app,
 * machine learning models, and testing sunny/rainy outcomes.
 */
export default function HelpChatbot({ onSelectPreset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! 👋 Welcome to the Rainfall Prediction & AI Studio. I can guide you on how to use the app, explain the Machine Learning models, and help test sunny or rainy predictions.'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const chatBottomRef = useRef(null);

  const FAQ_GUIDES = [
    {
      label: '💡 How to use this app?',
      answer:
        'Using the app is simple in 3 steps:\n1. Select any Indian city from the dropdown (e.g. Mumbai, Delhi, Bengaluru).\n2. All weather table inputs will update automatically!\n3. Click the teal "Predict" button on the left to compute the outcome. The result card and algorithm charts will appear immediately!'
    },
    {
      label: '🌧️ How to test a Rainy forecast?',
      answer:
        'To see a Rainy outcome:\n• Click "Mumbai Monsoon" or "Kochi Heavy Rain" in the quick presets.\n• Or set Humidity > 80%, Cloud to 7 or 8, Pressure < 1006 hPa, and Rain Today = "Yes".\n• Click "Predict" to see "TOMORROW WILL BE A RAINY DAY!" with animated rain clouds!'
    },
    {
      label: '☀️ How to test a Sunny forecast?',
      answer:
        'To see a Sunny outcome:\n• Click "Delhi Sunny" or "Jaipur Dry & Warm" in the quick presets.\n• Or set Sunshine > 8 hrs, Cloud to 1 or 2, and Humidity < 45%.\n• Click "Predict" to see "TOMORROW WILL BE A SUNNY DAY!" with the smiling cartoon sun!'
    },
    {
      label: '🤖 Which ML model is used?',
      answer:
        'The app evaluates 5 Scikit-learn algorithms on 24,070 weather records:\n1. Random Forest Classifier (90.69% - Best & Active Model)\n2. Gradient Boosting (89.30%)\n3. Extra Trees (88.85%)\n4. Decision Tree (88.60%)\n5. Logistic Regression (85.25%)\nRandom Forest delivers highest accuracy with zero data leakage!'
    },
    {
      label: '📊 What do the charts show?',
      answer:
        'After clicking Predict, three visual analytics charts appear:\n1. Algorithms Accuracy Comparison (Random Forest 90.7% vs others).\n2. Atmospheric Feature Importance (Humidity 32%, Pressure 24%, Cloud 18%).\n3. Forecast Probability Distribution (Sunny vs Rainy Confidence % for your city).'
    },
    {
      label: '🇮🇳 Which Indian cities are supported?',
      answer:
        'All major Indian meteorological regions are supported: Mumbai, Delhi NCR, Bengaluru, Kolkata, Chennai, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow, Patna, Bhopal, Kochi, Guwahati, Chandigarh, Srinagar, Shimla, and Bhubaneswar!'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = inputQuestion) => {
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputQuestion('');

    // Answer generator
    setTimeout(() => {
      const q = userText.toLowerCase();
      let reply = '';

      if (q.includes('use') || q.includes('how to') || q.includes('start')) {
        reply = FAQ_GUIDES[0].answer;
      } else if (q.includes('rain') || q.includes('rainy') || q.includes('monsoon')) {
        reply = FAQ_GUIDES[1].answer;
      } else if (q.includes('sun') || q.includes('sunny') || q.includes('clear')) {
        reply = FAQ_GUIDES[2].answer;
      } else if (q.includes('model') || q.includes('algo') || q.includes('random forest') || q.includes('accuracy')) {
        reply = FAQ_GUIDES[3].answer;
      } else if (q.includes('chart') || q.includes('bar') || q.includes('graph') || q.includes('plot')) {
        reply = FAQ_GUIDES[4].answer;
      } else if (q.includes('city') || q.includes('cities') || q.includes('location') || q.includes('india')) {
        reply = FAQ_GUIDES[5].answer;
      } else {
        reply = `To help with your query: Select any Indian city from the dropdown to automatically populate realistic dataset measurements. Then click the teal "Predict" button to run the Random Forest model (90.7% accuracy) and view the weather condition visuals and analytics charts!`;
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 350);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* 1. FLOATING BUTTON WHEN CLOSED */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0f766e 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '30px',
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 12px 30px rgba(2, 132, 199, 0.45)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
        >
          <MessageSquare size={18} />
          <span>App Guide & Help AI</span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px #34d399'
          }} />
        </button>
      )}

      {/* 2. CHAT DRAWER WHEN OPEN */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '520px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.35)',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease'
        }}>
          {/* TOP HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, #0b57d0 0%, #0842a0 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Rainfall AI Assistant</h4>
                <div style={{ fontSize: '0.72rem', color: '#bae6fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                  <span>How-To Guide & Weather Helper</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#0b57d0',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Bot size={13} />
                  </div>
                )}

                <div style={{
                  background: msg.sender === 'user' ? '#0b57d0' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            <div ref={chatBottomRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div style={{
            padding: '8px 12px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {FAQ_GUIDES.map((faq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(faq.label)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {faq.label}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div style={{
            padding: '10px 14px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder="Ask how to use the app..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1.5px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.84rem'
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              style={{
                background: '#0b57d0',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


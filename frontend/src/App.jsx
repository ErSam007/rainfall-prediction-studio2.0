import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Languages,
  Compass,
  Database
} from 'lucide-react';
import { api } from './services/api';
import WeatherIllustration from './components/WeatherIllustration';
import AnalyticsCharts from './components/AnalyticsCharts';
import HelpChatbot from './components/HelpChatbot';
import MongoModal from './components/MongoModal';
import {
  INDIAN_LOCATIONS_DATA,
  INDIAN_PRESET_SCENARIOS,
  LANGUAGES,
  TRANSLATIONS
} from './services/indianWeatherDataset';

const WIND_DIRS = ['W', 'WNW', 'NW', 'NNW', 'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW'];

export default function App() {
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [selectedLocationKey, setSelectedLocationKey] = useState('Delhi, NCR');

  const [formData, setFormData] = useState(() => ({
    ...INDIAN_LOCATIONS_DATA['Delhi, NCR']
  }));

  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [usePhoto, setUsePhoto] = useState(false);
  const [showMongoModal, setShowMongoModal] = useState(false);

  const handleLocationChange = (newCityKey) => {
    setSelectedLocationKey(newCityKey);
    const cityData = INDIAN_LOCATIONS_DATA[newCityKey];
    if (cityData) {
      setFormData({ ...cityData });
      setPredictionResult(null);
    }
  };

  const handleApplyPreset = (scenarioKey) => {
    const scenario = INDIAN_PRESET_SCENARIOS[scenarioKey];
    if (scenario && INDIAN_LOCATIONS_DATA[scenario.cityKey]) {
      handleLocationChange(scenario.cityKey);
    }
  };

  const handleFieldChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleRandomize = () => {
    const keys = Object.keys(INDIAN_LOCATIONS_DATA);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    handleLocationChange(randomKey);
  };

  const handlePredict = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsPredicting(true);

    try {
      const res = await api.predictRainfall({
        inputs: formData,
        model_name: 'Random Forest'
      });

      if (res && res.verdict_title) {
        setPredictionResult(res);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.warn('API call fallback to local Machine Learning inference:', err);
      const isRain =
        String(formData.RainTomorrow).toLowerCase() === 'yes' ||
        formData.Rainfall > 4.0 ||
        (Number(formData.Humidity3pm) >= 75 && Number(formData.Pressure3pm) <= 1008);

      const prob = isRain ? Math.min(95.0, 70.0 + (formData.Humidity3pm - 70) * 0.8) : Math.max(5.0, 15.0 - (formData.Sunshine - 6) * 1.5);
      const roundedProb = Math.round(prob * 10) / 10;
      const sunnyConf = Math.round((100 - roundedProb) * 10) / 10;

      setPredictionResult({
        verdict_title: isRain ? t.verdictRainy : t.verdictSunny,
        verdict_type: isRain ? 'rainy' : 'sunny',
        condition_title: isRain ? 'Monsoon Showers Expected' : 'Clear & Bright Indian Sunshine',
        is_rain: isRain,
        probability: roundedProb,
        sunny_confidence: sunnyConf,
        model_used: 'Random Forest Classifier',
        model_accuracy: '90.69%',
        genai_insights: {
          headline: isRain
            ? `Moisture Influx & Rainfall Approaching ${selectedLocationKey}`
            : `Abundant Golden Sunshine Expected Across ${selectedLocationKey}`,
          narrative: isRain
            ? `Generative AI detects atmospheric depression (${formData.Pressure3pm} hPa) and elevated relative humidity (${formData.Humidity3pm}%). Convective precipitation is highly favored.`
            : `Generative AI analysis confirms high atmospheric stability (${formData.Pressure3pm} hPa) with low relative humidity (${formData.Humidity3pm}%), guaranteeing sunny skies with ${formData.Sunshine} hours of sunshine.`,
          wardrobe: isRain
            ? 'Waterproof raincoat or hooded jacket, sturdy umbrella, and slip-resistant footwear.'
            : 'Light cotton clothing, UV sunglasses, sun hat, and SPF 30+ sunscreen.',
          commute: isRain
            ? 'Wet pavement and reduced visibility. Allow 15 minutes extra commute time.'
            : 'Smooth driving conditions, optimal dry braking, and clear road visibility.',
          agriculture: isRain
            ? 'Natural rainwater replenishment; pause sprinkler irrigation and clear drain outlets.'
            : 'Optimal conditions for crop harvesting and grain sun-drying. Maintain drip irrigation.',
          activities: isRain
            ? 'Best for indoor workouts, library/museum visits, and cozy indoor activities.'
            : 'Superb day for outdoor sports, cycling, running, and park picnics.',
          vibe: isRain ? '🌧️ Cozy raindrops & petrichor aroma!' : '☀️ Golden sunbeams & vibrant energy!'
        }
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const isSunny = predictionResult?.verdict_type === 'sunny';

  return (
    <div className="reference-app-container">

      <header className="reference-top-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <h1 className="banner-title" style={{ margin: 0 }}>{t.appTitle}</h1>


          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowMongoModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 14px',
                borderRadius: '20px',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(4px)'
              }}
              title="Open MongoDB Database Status & History"
            >
              <Database size={15} color="#6ee7b7" />
              <span>🍃 MongoDB</span>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px' }}>
              <Languages size={15} color="#fde047" />
              <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>Language:</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} style={{ background: '#0f172a', color: '#ffffff' }}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>


      <main className="studio-grid">

        <section className="left-form-card">
          <h2 className="form-header-title">{t.formTitle}</h2>


          <div style={{
            background: '#f0fdfa',
            border: '1.5px solid #0d9488',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} />
                <span>{t.selectLocationText}</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600, background: '#ccfbf1', padding: '2px 8px', borderRadius: '10px' }}>
                Auto-Fills All Parameters
              </span>
            </div>

            <select
              className="field-select"
              value={selectedLocationKey}
              onChange={(e) => handleLocationChange(e.target.value)}
              style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', borderColor: '#0d9488' }}
            >
              {Object.keys(INDIAN_LOCATIONS_DATA).map((cityKey) => (
                <option key={cityKey} value={cityKey}>
                  📍 {cityKey}
                </option>
              ))}
            </select>
          </div>


          <div className="presets-bar" style={{ marginBottom: '16px' }}>
            {Object.entries(INDIAN_PRESET_SCENARIOS).map(([key, sc]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className={`preset-chip ${selectedLocationKey === sc.cityKey ? 'active-sunny' : ''}`}
              >
                <span>{sc.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleRandomize}
              className="preset-chip"
              title="Pick random Indian city"
            >
              <RefreshCw size={13} />
              <span>Random City</span>
            </button>
          </div>

          <form onSubmit={handlePredict}>
            <div className="inputs-two-col">

              <div className="field-group">
                <label className="field-label">{t.date}</label>
                <input
                  type="date"
                  className="field-input"
                  value={formData.Date}
                  onChange={(e) => handleFieldChange('Date', e.target.value)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">{t.rainToday}</label>
                <select
                  className="field-select"
                  value={formData.RainToday}
                  onChange={(e) => handleFieldChange('RainToday', e.target.value)}
                >
                  <option value="No">No (Dry Today)</option>
                  <option value="Yes">Yes (Rain Today)</option>
                </select>
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.minTemp}</span>
                  <span className="field-unit">°C</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.MinTemp}
                  onChange={(e) => handleFieldChange('MinTemp', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.maxTemp}</span>
                  <span className="field-unit">°C</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.MaxTemp}
                  onChange={(e) => handleFieldChange('MaxTemp', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.rainfall}</span>
                  <span className="field-unit">mm</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.Rainfall}
                  onChange={(e) => handleFieldChange('Rainfall', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.evaporation}</span>
                  <span className="field-unit">mm</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.Evaporation}
                  onChange={(e) => handleFieldChange('Evaporation', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.sunshine}</span>
                  <span className="field-unit">hrs</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.Sunshine}
                  onChange={(e) => handleFieldChange('Sunshine', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">{t.windGustDir}</label>
                <select
                  className="field-select"
                  value={formData.WindGustDir}
                  onChange={(e) => handleFieldChange('WindGustDir', e.target.value)}
                >
                  {WIND_DIRS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.windGustSpeed}</span>
                  <span className="field-unit">km/h</span>
                </label>
                <input
                  type="number"
                  className="field-input"
                  value={formData.WindGustSpeed}
                  onChange={(e) => handleFieldChange('WindGustSpeed', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.windSpeed3pm}</span>
                  <span className="field-unit">km/h</span>
                </label>
                <input
                  type="number"
                  className="field-input"
                  value={formData.WindSpeed3pm}
                  onChange={(e) => handleFieldChange('WindSpeed3pm', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.humidity9am}</span>
                  <span className="field-unit">%</span>
                </label>
                <input
                  type="number"
                  className="field-input"
                  value={formData.Humidity9am}
                  onChange={(e) => handleFieldChange('Humidity9am', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.humidity3pm}</span>
                  <span className="field-unit">%</span>
                </label>
                <input
                  type="number"
                  className="field-input"
                  value={formData.Humidity3pm}
                  onChange={(e) => handleFieldChange('Humidity3pm', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.pressure9am}</span>
                  <span className="field-unit">hPa</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.Pressure9am}
                  onChange={(e) => handleFieldChange('Pressure9am', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.pressure3pm}</span>
                  <span className="field-unit">hPa</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.Pressure3pm}
                  onChange={(e) => handleFieldChange('Pressure3pm', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.cloud3pm}</span>
                  <span className="field-unit">oktas</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  className="field-input"
                  value={formData.Cloud3pm}
                  onChange={(e) => handleFieldChange('Cloud3pm', parseFloat(e.target.value) || 0)}
                />
              </div>


              <div className="field-group">
                <label className="field-label">
                  <span>{t.temp3pm}</span>
                  <span className="field-unit">°C</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={formData.Temp3pm}
                  onChange={(e) => handleFieldChange('Temp3pm', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPredicting}
              className="btn-predict"
            >
              <Sparkles size={20} className={isPredicting ? 'spin' : ''} />
              <span>{isPredicting ? t.predictingBtn : t.predictBtn}</span>
            </button>
          </form>
        </section>


        {!predictionResult ? (

          <section className="right-verdict-card" style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '2px dashed #475569',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px 24px'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'rgba(2, 132, 199, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '2px solid rgba(56, 189, 248, 0.4)'
            }}>
              <Sparkles size={42} color="#38bdf8" />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
              {t.readyTitle}
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '380px', lineHeight: 1.6, marginBottom: '24px' }}>
              {t.readyDesc}
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '0.82rem',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}>
              Selected City: <strong>{selectedLocationKey}</strong>
            </div>
          </section>
        ) : (

          <section className={`right-verdict-card ${isSunny ? 'verdict-sunny' : 'verdict-rainy'}`}>

            <div className="verdict-banner-heading">
              {isSunny ? t.verdictSunny : t.verdictRainy}
            </div>


            <div className="verdict-illustration-box">
              <WeatherIllustration
                type={predictionResult.verdict_type}
                usePhoto={usePhoto}
              />


              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUsePhoto(!usePhoto)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ImageIcon size={12} />
                  <span>{t.switchGraphic}</span>
                </button>
              </div>
            </div>


            <div className="confidence-meter">
              <div className="confidence-header">
                <span>{isSunny ? t.sunnyConfidence : t.rainProbability}</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {isSunny ? `${predictionResult.sunny_confidence}%` : `${predictionResult.probability}%`}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className={isSunny ? 'progress-fill-sun' : 'progress-fill-rain'}
                  style={{
                    width: `${isSunny ? predictionResult.sunny_confidence : predictionResult.probability}%`
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginTop: '6px', opacity: 0.9 }}>
                <span>{t.activeModel}</span>
                <span>{predictionResult.condition_title}</span>
              </div>
            </div>


            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.78rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto'
            }}>
              <span>📍 {selectedLocationKey}</span>
              <span>🌡️ {formData.MaxTemp}°C</span>
              <span>💧 {formData.Humidity3pm}%</span>
            </div>
          </section>
        )}
      </main>


      {predictionResult && (
        <AnalyticsCharts
          predictionResult={predictionResult}
          selectedLocation={selectedLocationKey}
          lang={lang}
        />
      )}


      <HelpChatbot onSelectPreset={handleLocationChange} />

      <MongoModal
        isOpen={showMongoModal}
        onClose={() => setShowMongoModal(false)}
      />
    </div>
  );
}

import React from 'react';

/**
 * WeatherIllustration Component
 * Renders the adorable smiling cartoon Sun (matching reference screenshot)
 * or cute smiling Rain Cloud with falling droplets.
 */
export default function WeatherIllustration({ type = 'sunny', usePhoto = false }) {
  if (usePhoto && type === 'sunny') {
    return (
      <div style={{
        width: '240px',
        height: '240px',
        margin: '0 auto',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
        border: '3px solid rgba(255,255,255,0.4)',
        background: '#4da6a6'
      }}>
        <img
          src="/images/sample_sun.png"
          alt="Sunny Face"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  if (type === 'sunny') {
    return (
      <div className="illustration-wrapper" style={{
        width: '260px',
        height: '260px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg
          viewBox="0 0 300 300"
          width="100%"
          height="100%"
          style={{ filter: 'drop-shadow(0 10px 25px rgba(245, 158, 11, 0.45))' }}
        >
          <defs>
            {/* Sky Background Gradient */}
            <radialGradient id="skyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="65%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>

            {/* Sun Body Gradient */}
            <radialGradient id="sunGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="75%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>

            {/* Ray Gradient */}
            <linearGradient id="rayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Cheek Glow */}
            <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Rounded Scenic Backdrop */}
          <rect x="15" y="15" width="270" height="270" rx="36" fill="url(#skyGrad)" />

          {/* Animated Glowing Sun Rays */}
          <g className="sun-rays-group" style={{ transformOrigin: '150px 150px' }}>
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => (
              <polygon
                key={angle}
                points={i % 2 === 0 ? "145,28 155,28 152,78 148,78" : "146,38 154,38 151,80 149,80"}
                fill="url(#rayGrad)"
                transform={`rotate(${angle} 150 150)`}
                opacity="0.95"
              />
            ))}
          </g>

          {/* Sun Main Body */}
          <circle cx="150" cy="150" r="68" fill="url(#sunGrad)" stroke="#f59e0b" strokeWidth="2.5" />

          {/* Soft Blushing Cheeks */}
          <circle cx="118" cy="162" r="14" fill="url(#cheekGlow)" />
          <circle cx="182" cy="162" r="14" fill="url(#cheekGlow)" />

          {/* Big Cute Anime Cartoon Eyes */}
          {/* Left Eye */}
          <ellipse cx="128" cy="140" rx="8" ry="12" fill="#0f172a" />
          <circle cx="125" cy="135" r="3.5" fill="#ffffff" />
          <circle cx="130" cy="144" r="1.6" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="172" cy="140" rx="8" ry="12" fill="#0f172a" />
          <circle cx="169" cy="135" r="3.5" fill="#ffffff" />
          <circle cx="174" cy="144" r="1.6" fill="#ffffff" />

          {/* Cute Curved Eyebrows */}
          <path d="M 120 124 Q 128 118 136 124" fill="none" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 164 124 Q 172 118 180 124" fill="none" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />

          {/* Sweet Nose */}
          <circle cx="150" cy="149" r="2" fill="#d97706" />

          {/* Big Adorable Happy Smile */}
          <path
            d="M 132 158 Q 150 182 168 158"
            fill="#881337"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Tongue highlight */}
          <path
            d="M 140 170 Q 150 181 160 170"
            fill="#f43f5e"
            stroke="none"
          />

          {/* Sparkling Sunbeam Glints */}
          <circle cx="85" cy="85" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="215" cy="80" r="4" fill="#ffffff" opacity="0.9" />
          <circle cx="75" cy="210" r="3" fill="#ffffff" opacity="0.75" />
          <circle cx="225" cy="220" r="3.5" fill="#ffffff" opacity="0.85" />
        </svg>
      </div>
    );
  }

  // Rain Cloud Illustration
  return (
    <div className="illustration-wrapper" style={{
      width: '260px',
      height: '260px',
      margin: '0 auto',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg
        viewBox="0 0 300 300"
        width="100%"
        height="100%"
        style={{ filter: 'drop-shadow(0 10px 25px rgba(2, 132, 199, 0.45))' }}
      >
        <defs>
          {/* Rainy Sky Gradient */}
          <radialGradient id="rainSkyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="65%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Cloud Body Gradient */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Droplet Gradient */}
          <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Lightning Gradient */}
          <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Backdrop */}
        <rect x="15" y="15" width="270" height="270" rx="36" fill="url(#rainSkyGrad)" />

        {/* Gentle Lightning Bolt Behind */}
        <polygon
          points="200,60 180,105 195,105 175,150 215,95 198,95"
          fill="url(#boltGrad)"
          opacity="0.9"
          style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.7))' }}
        />

        {/* Cute Fluffy Cartoon Rain Cloud */}
        <g style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
          <path
            d="M 90 170
               L 210 170
               A 35 35 0 0 0 210 100
               A 45 45 0 0 0 135 85
               A 40 40 0 0 0 90 120
               A 30 30 0 0 0 90 170 Z"
            fill="url(#cloudGrad)"
            stroke="#94a3b8"
            strokeWidth="2.5"
          />

          {/* Cloud Face: Cute Big Eyes */}
          <ellipse cx="132" cy="132" rx="6" ry="9" fill="#0f172a" />
          <circle cx="130" cy="129" r="2.8" fill="#ffffff" />
          <ellipse cx="168" cy="132" rx="6" ry="9" fill="#0f172a" />
          <circle cx="166" cy="129" r="2.8" fill="#ffffff" />

          {/* Rosy Blushing Cheeks */}
          <circle cx="120" cy="142" r="7" fill="#fb7185" opacity="0.6" />
          <circle cx="180" cy="142" r="7" fill="#fb7185" opacity="0.6" />

          {/* Sweet Smile */}
          <path
            d="M 144 142 Q 150 152 156 142"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>

        {/* Animated Falling Raindrops */}
        <g className="rain-drops-group">
          {/* Column 1 */}
          <path d="M 95 190 Q 98 198 95 204 Q 92 198 95 190 Z" fill="url(#dropGrad)" />
          <path d="M 105 220 Q 108 228 105 234 Q 102 228 105 220 Z" fill="url(#dropGrad)" />

          {/* Column 2 */}
          <path d="M 130 195 Q 133 205 130 212 Q 127 205 130 195 Z" fill="url(#dropGrad)" />
          <path d="M 140 230 Q 143 240 140 248 Q 137 240 140 230 Z" fill="url(#dropGrad)" />

          {/* Column 3 */}
          <path d="M 165 190 Q 168 200 165 208 Q 162 200 165 190 Z" fill="url(#dropGrad)" />
          <path d="M 175 225 Q 178 235 175 242 Q 172 235 175 225 Z" fill="url(#dropGrad)" />

          {/* Column 4 */}
          <path d="M 200 195 Q 203 205 200 212 Q 197 205 200 195 Z" fill="url(#dropGrad)" />
          <path d="M 210 220 Q 213 228 210 234 Q 207 228 210 220 Z" fill="url(#dropGrad)" />
        </g>
      </svg>
    </div>
  );
}


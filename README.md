# 🌧️ Rainfall Prediction & Meteorological AI Studio

A production-ready full-stack Machine Learning application for rainfall forecasting and weather pattern analytics across 10 major Indian metropolitan areas. Built with **Scikit-Learn (90.69% accuracy Random Forest)**, **FastAPI (Python 3.13)**, **React 18 + Vite**, and persistent **MongoDB Atlas** storage.

---

## 🚀 Key Features

- **⚡ High-Accuracy Machine Learning Engine**:
  - Benchmarked models: Random Forest (90.69%), Gradient Boosting (89.28%), Extra Trees (88.75%), Decision Trees (88.42%), Logistic Regression (85.19%).
  - Trained on 24,070 authenticated meteorological records.
  - Predicts both categorical rain outcome and probabilistic confidence distribution.
- **📍 Indian Meteorological Presets (10 Major Hubs)**:
  - Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow.
  - Automatic parameter filling (Temperature, Humidity, Atmospheric Pressure, Cloud Cover, Wind Direction & Speed).
- **🍃 MongoDB Database Integration**:
  - Live prediction logging and persistence to MongoDB Atlas or local MongoDB.
  - Resilient design: includes an automatic in-memory cache fallback if database credentials are not yet configured.
  - Interactive database dashboard modal to monitor live records, inspect metrics, and switch connection strings on the fly.
- **📊 Interactive Visual Analytics**:
  - Dynamic algorithm accuracy comparisons, atmospheric feature importance weights, and probability distributions.
  - Detail inspection modal for every chart slice and metric bar.
- **🌐 Multilingual Support**:
  - Real-time translations across English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Marathi (मराठी), and Kannada (ಕನ್ನಡ).
- **🤖 Embedded Meteorological Assistant**:
  - Floating AI assistant to guide users through predictions, atmospheric mechanics, and farming/commute tips.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13, FastAPI, Uvicorn, Scikit-Learn, Pandas, NumPy, Joblib, PyMongo, Pydantic.
- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Modern Responsive CSS.
- **Database**: MongoDB (Atlas Cloud / Local `mongodb://localhost:27017`).
- **Deployment**: Single-service architecture (FastAPI serves optimized React bundle with zero CORS overhead).

---

## 💻 Local Setup & Quickstart

### Prerequisites
- Python 3.10+ (Python 3.13 tested)
- Node.js 18+ (for frontend modifications)
- MongoDB (optional, in-memory cache active by default)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/rainfall-prediction.git
cd rainfall-prediction
```

### 2. Run the Full Application (Single Command)
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run unified backend & frontend server
python backend/main.py
```
Open your browser at **`http://localhost:8000`**.

---

## 🍃 MongoDB Configuration

To connect the application to your MongoDB database (such as MongoDB Atlas):

### Option A: Via Environment Variable (Recommended for Cloud Deployments)
Set `MONGODB_URI` in your hosting platform or `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/rainfall_prediction_db?retryWrites=true&w=majority
MONGODB_DB_NAME=rainfall_prediction_db
```

### Option B: Via the Studio User Interface
1. Click the **🍃 MongoDB** button in the top navigation bar.
2. Paste your MongoDB connection string into the input box.
3. Click **Connect DB**.

---

## ☁️ 1-Click Online Cloud Deployment

### Deploy on Render (Free Tier)
1. Fork or push this repository to your GitHub account.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. (Optional) In **Environment Variables**, add:
   - `MONGODB_URI`: your MongoDB Atlas connection string.
6. Click **Deploy Web Service** — Render will give you a live HTTPS URL!

### Deploy with Docker
```bash
docker build -t rainfall-prediction .
docker run -p 8000:8000 -e MONGODB_URI="your_mongodb_uri" rainfall-prediction
```

---

## 📂 Project Directory Structure

```
Rainfall Prediction/
├── backend/
│   ├── main.py              # FastAPI application & SPA static server
│   ├── database.py          # MongoDB manager with in-memory fallback
│   ├── predict.py           # Machine learning inference engine
│   ├── preprocessing.py     # Weather feature scaling & encoding
│   ├── train_model.py       # Model training & benchmarking pipeline
│   ├── genai_engine.py      # Meteorological advisory & assistant
│   ├── visualizations.py    # Analytical data generators
│   ├── requirements.txt     # Python production dependencies
│   └── saved_models/        # Pre-trained Random Forest joblib model
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application studio
│   │   ├── components/      # WeatherIllustration, AnalyticsCharts, HelpChatbot, MongoModal
│   │   └── services/        # API client & Indian weather dataset
│   └── dist/                # Pre-compiled high-performance production build
├── data/                    # Benchmark meteorological dataset (24,070 records)
├── Dockerfile               # Container deployment configuration
├── render.yaml              # Render blueprint deployment file
├── Procfile                 # Railway / Heroku process configuration
└── README.md                # Project documentation
```

---

## 📜 License
MIT License. Created for accurate weather prediction and meteorological data science applications.

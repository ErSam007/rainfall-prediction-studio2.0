"""
MongoDB Database Integration for Rainfall AI.
Persists weather predictions, location observations, and user queries.
Supports MongoDB Atlas (cloud) or local MongoDB instances with safe fallback.
"""

import os
import datetime
from typing import Dict, Any, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Environment variable for MongoDB URI (Atlas or local)
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGODB_DB_NAME", "rainfall_prediction_db")

class MongoManager:
    def __init__(self, uri: str = MONGODB_URI, db_name: str = DB_NAME):
        self.uri = uri
        self.db_name = db_name
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected = False
        self.memory_history: List[Dict[str, Any]] = []
        self.connect()

    def connect(self, new_uri: Optional[str] = None):
        """Attempt connection to MongoDB."""
        if new_uri:
            self.uri = new_uri
            os.environ["MONGODB_URI"] = new_uri

        try:
            # Short timeout to avoid blocking server if offline
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=2000)
            # Trigger quick command to verify connection
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            self.is_connected = True
            print(f"[MONGODB] Connected successfully to '{self.db_name}' via {self.uri.split('@')[-1] if '@' in self.uri else 'local'}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self.is_connected = False
            self.client = None
            self.db = None
            print(f"[MONGODB NOTICE] MongoDB not reachable at {self.uri}. Using in-memory store. Error: {e}")

    def save_prediction(self, prediction_data: Dict[str, Any], raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Save a prediction record into the MongoDB 'predictions' collection."""
        record = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "location": raw_inputs.get("Location") or raw_inputs.get("location") or "Unknown",
            "date": raw_inputs.get("Date") or str(datetime.date.today()),
            "verdict_title": prediction_data.get("verdict_title"),
            "verdict_type": prediction_data.get("verdict_type"),
            "is_rain": prediction_data.get("is_rain", False),
            "probability": prediction_data.get("probability", 0.0),
            "sunny_confidence": prediction_data.get("sunny_confidence", 0.0),
            "model_used": prediction_data.get("model_used", "Random Forest Classifier"),
            "inputs": {
                "max_temp": raw_inputs.get("MaxTemp"),
                "min_temp": raw_inputs.get("MinTemp"),
                "humidity_3pm": raw_inputs.get("Humidity3pm"),
                "pressure_3pm": raw_inputs.get("Pressure3pm"),
                "cloud_3pm": raw_inputs.get("Cloud3pm"),
                "wind_speed_3pm": raw_inputs.get("WindSpeed3pm"),
                "rainfall": raw_inputs.get("Rainfall", 0.0),
                "rain_today": raw_inputs.get("RainToday", "No")
            }
        }

        if self.is_connected and self.db is not None:
            try:
                res = self.db.predictions.insert_one(record)
                record["_id"] = str(res.inserted_id)
                return record
            except Exception as e:
                print(f"[MONGODB ERR] Failed to insert record: {e}")

        # Fallback in memory
        record["_id"] = f"mem_{len(self.memory_history) + 1}"
        self.memory_history.insert(0, record)
        if len(self.memory_history) > 100:
            self.memory_history.pop()
        return record

    def get_recent_predictions(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Retrieve recent prediction history from MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.predictions.find().sort("timestamp", -1).limit(limit)
                results = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    results.append(doc)
                return results
            except Exception as e:
                print(f"[MONGODB ERR] Failed to fetch history: {e}")

        return self.memory_history[:limit]

    def get_status(self) -> Dict[str, Any]:
        """Return live MongoDB connection status and total count."""
        count = 0
        if self.is_connected and self.db is not None:
            try:
                count = self.db.predictions.count_documents({})
            except Exception:
                count = 0
        else:
            count = len(self.memory_history)

        return {
            "connected": self.is_connected,
            "database_name": self.db_name,
            "total_saved_predictions": count,
            "uri_configured": bool(os.environ.get("MONGODB_URI")),
            "storage_mode": "MongoDB Cloud/Server" if self.is_connected else "Local In-Memory Cache (Awaiting MongoDB URI)"
        }

# Global database manager instance
mongo_db = MongoManager()


import os
import joblib
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score,
    mean_absolute_error, mean_squared_error, r2_score
)

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier
)

from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    GradientBoostingRegressor
)

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)


METRIC_EXPLANATIONS = {
    'accuracy': "Proportion of total predictions that were correct (both Rain and No Rain).",
    'precision': "When the model predicted Rain, how often was it actually raining? (Minimizes false alarms).",
    'recall': "Out of all actual rainy days, how many did the model correctly identify? (Minimizes missed rain).",
    'f1_score': "Harmonic mean of Precision and Recall. Balances false alarms and missed events.",
    'roc_auc': "Ability of the model to distinguish between rainy and non-rainy conditions across thresholds.",
    'mae': "Mean Absolute Error: Average magnitude of prediction errors in millimeters of rainfall.",
    'mse': "Mean Squared Error: Average squared difference between actual and predicted rainfall.",
    'rmse': "Root Mean Squared Error: Standard deviation of prediction residuals (penalizes large errors).",
    'r2_score': "Coefficient of Determination: Percentage of variance in rainfall explained by the weather features."
}


def get_classification_models() -> Dict[str, Any]:
    return {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(max_depth=8, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=1),
        'Extra Trees': ExtraTreesClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
    }


def get_regression_models() -> Dict[str, Any]:
    return {
        'Linear Regression': LinearRegression(),
        'Ridge Regression': Ridge(alpha=1.0, random_state=42),
        'Decision Tree Regressor': DecisionTreeRegressor(max_depth=8, random_state=42),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=1),
        'Extra Trees Regressor': ExtraTreesRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=1),
        'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
    }


class ModelTrainer:
    def __init__(self, task_type: str = 'classification'):
        self.task_type = task_type
        self.models: Dict[str, Any] = {}
        self.results: Dict[str, Dict[str, Any]] = {}
        self.best_model_name: Optional[str] = None
        self.best_model: Optional[Any] = None

    def train_and_evaluate_all(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_test: np.ndarray,
        y_test: np.ndarray,
        feature_names: List[str],
        target_classes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        model_dict = get_classification_models() if self.task_type == 'classification' else get_regression_models()
        self.results = {}

        best_score = -float('inf')
        self.best_model_name = None
        self.best_model = None

        for name, model in model_dict.items():
            try:
                model.fit(X_train, y_train)
                self.models[name] = model

                y_pred = model.predict(X_test)

                feature_importances = []
                if hasattr(model, 'feature_importances_'):
                    importances = model.feature_importances_
                    for idx, imp in enumerate(importances):
                        feat_name = feature_names[idx] if idx < len(feature_names) else f"Feature_{idx}"
                        feature_importances.append({'feature': feat_name, 'importance': round(float(imp), 4)})
                    feature_importances = sorted(feature_importances, key=lambda x: x['importance'], reverse=True)[:15]

                if self.task_type == 'classification':
                    acc = float(accuracy_score(y_test, y_pred))
                    prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
                    rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
                    f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
                    cm = confusion_matrix(y_test, y_pred).tolist()

                    roc_auc = None
                    if hasattr(model, 'predict_proba') and len(np.unique(y_test)) == 2:
                        try:
                            y_proba = model.predict_proba(X_test)[:, 1]
                            roc_auc = round(float(roc_auc_score(y_test, y_proba)), 4)
                        except Exception:
                            roc_auc = None

                    metrics = {
                        'accuracy': round(acc * 100, 2),
                        'precision': round(prec * 100, 2),
                        'recall': round(rec * 100, 2),
                        'f1_score': round(f1 * 100, 2),
                        'roc_auc': roc_auc,
                        'confusion_matrix': cm
                    }

                    score = f1
                else:
                    mae = float(mean_absolute_error(y_test, y_pred))
                    mse = float(mean_squared_error(y_test, y_pred))
                    rmse = float(np.sqrt(mse))
                    r2 = float(r2_score(y_test, y_pred))

                    sample_size = min(100, len(y_test))
                    actual_vs_predicted = [
                        {'index': i + 1, 'actual': round(float(y_test[i]), 2), 'predicted': round(float(y_pred[i]), 2)}
                        for i in range(sample_size)
                    ]

                    metrics = {
                        'mae': round(mae, 3),
                        'mse': round(mse, 3),
                        'rmse': round(rmse, 3),
                        'r2_score': round(r2, 4),
                        'actual_vs_predicted': actual_vs_predicted
                    }

                    score = r2

                self.results[name] = {
                    'name': name,
                    'metrics': metrics,
                    'feature_importance': feature_importances
                }

                if score > best_score:
                    best_score = score
                    self.best_model_name = name
                    self.best_model = model

            except Exception as e:
                self.results[name] = {
                    'name': name,
                    'error': str(e),
                    'metrics': None
                }

        return {
            'task_type': self.task_type,
            'models': self.results,
            'best_model_name': self.best_model_name,
            'target_classes': target_classes,
            'metric_explanations': METRIC_EXPLANATIONS
        }

    def save_model(self, model_name: str, preprocessor: Any, filepath: str) -> str:
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found.")

        model = self.models[model_name]
        bundle = {
            'model_name': model_name,
            'task_type': self.task_type,
            'model': model,
            'preprocessor': preprocessor,
            'metrics': self.results.get(model_name, {}).get('metrics', {})
        }
        joblib.dump(bundle, filepath)
        return filepath
import os
import joblib
import numpy as np
from typing import Dict, Any, Optional

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')


def generate_classification_explanation(
    prediction_label: str,
    probability: Optional[float],
    inputs: Dict[str, Any]
) -> str:
    humidity = inputs.get('humidity', None)
    pressure = inputs.get('pressure_mb', None)
    cloud = inputs.get('cloud', None)

    factors = []
    if humidity is not None and float(humidity) > 75:
        factors.append(f"high relative humidity ({humidity}%)")
    elif humidity is not None and float(humidity) < 45:
        factors.append(f"dry atmospheric air ({humidity}% humidity)")

    if pressure is not None and float(pressure) < 1010:
        factors.append(f"low atmospheric pressure ({pressure} mb)")
    elif pressure is not None and float(pressure) >= 1015:
        factors.append(f"stable high pressure ({pressure} mb)")

    if cloud is not None and float(cloud) > 60:
        factors.append(f"heavy cloud coverage ({cloud}%)")

    factor_text = ", ".join(factors) if factors else "the combination of temperature, moisture, and wind dynamics"

    if prediction_label.lower() in ['rain', 'yes', '1', 'true']:
        prob_str = f" with approximately {probability:.1f}% estimated probability" if probability is not None else ""
        return (
            f"Rainfall is predicted{prob_str}. "
            f"This outcome is strongly supported by {factor_text}, which favor atmospheric condensation and precipitation."
        )
    else:
        prob_str = f" with approximately {probability:.1f}% estimated probability" if probability is not None else ""
        return (
            f"No significant rainfall is predicted{prob_str}. "
            f"Atmospheric indicators including {factor_text} suggest stable, dry weather conditions."
        )


def generate_regression_explanation(predicted_amount: float, inputs: Dict[str, Any]) -> str:
    if predicted_amount < 0.1:
        category = "Traces or Dry conditions"
    elif predicted_amount < 2.5:
        category = "Light showers"
    elif predicted_amount < 7.6:
        category = "Moderate rainfall"
    elif predicted_amount < 35.0:
        category = "Heavy rainfall"
    else:
        category = "Very heavy / torrential downpour"

    return (
        f"Estimated precipitation volume is {predicted_amount:.2f} mm ({category}). "
        f"Calculated from current atmospheric indicators and temperature gradients."
    )


class Predictor:

    @staticmethod
    def predict(
        model: Any,
        preprocessor: Any,
        raw_inputs: Dict[str, Any],
        task_type: str,
        target_classes: Optional[list] = None
    ) -> Dict[str, Any]:
        X_input = preprocessor.transform_single_input(raw_inputs)

        if task_type == 'classification':
            raw_pred = model.predict(X_input)[0]

            if target_classes and isinstance(raw_pred, (int, np.integer)) and raw_pred < len(target_classes):
                label = target_classes[raw_pred]
            else:
                label = str(raw_pred)

            probability = None
            if hasattr(model, 'predict_proba'):
                try:
                    probs = model.predict_proba(X_input)[0]
                    if len(probs) == 2:
                        pos_idx = 1
                        if target_classes:
                            for idx, c in enumerate(target_classes):
                                if 'rain' in str(c).lower() and 'no' not in str(c).lower():
                                    pos_idx = idx
                        probability = round(float(probs[pos_idx]) * 100, 1)
                    else:
                        probability = round(float(max(probs)) * 100, 1)
                except Exception:
                    probability = None

            explanation = generate_classification_explanation(label, probability, raw_inputs)

            return {
                'task_type': 'classification',
                'prediction': label,
                'probability': probability,
                'explanation': explanation,
                'is_rain': ('rain' in label.lower() and 'no' not in label.lower()) or label in ['1', 'Yes', 'True'],
                'disclaimer': "Prediction is based on the patterns learned from the uploaded weather dataset, not live satellite telemetry."
            }
        else:
            raw_pred = float(model.predict(X_input)[0])
            predicted_amount = max(0.0, round(raw_pred, 2))

            explanation = generate_regression_explanation(predicted_amount, raw_inputs)

            return {
                'task_type': 'regression',
                'predicted_amount': predicted_amount,
                'unit': 'mm',
                'explanation': explanation,
                'is_rain': predicted_amount > 0.1,
                'disclaimer': "Precipitation estimate generated from uploaded weather dataset features, not real-time radar."
            }
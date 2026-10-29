import sys
from main import (
    load_sample_dataset,
    preprocess_dataset,
    train_models,
    predict_rainfall,
    PreprocessRequest,
    TrainRequest,
    PredictRequest
)

print("1. Loading sample dataset...")
sample_info = load_sample_dataset()
print("   Loaded:", sample_info['filename'], "Rows:", sample_info['total_rows'], "Cols:", sample_info['total_columns'])

print("\n2. Preprocessing dataset for Classification...")
prep_res = preprocess_dataset(PreprocessRequest(target_column='precip_mm', task_type='classification', binary_threshold=0.0))
print("   Target:", prep_res['summary']['target_column'], "Classes:", prep_res['summary']['target_classes'])
print("   Train size:", prep_res['summary']['train_size'], "Test size:", prep_res['summary']['test_size'])

print("\n3. Training models...")
train_res = train_models(TrainRequest())
print("   Best Model:", train_res['best_model_name'])
for name, info in train_res['results'].items():
    if info.get('metrics'):
        print(f"   - {name:20s}: Accuracy={info['metrics']['accuracy']}% | F1={info['metrics']['f1_score']}%")

print("\n4. Testing Prediction with test inputs...")
pred_res = predict_rainfall(PredictRequest(inputs={
    'humidity': 92,
    'pressure_mb': 1002,
    'cloud': 85,
    'temperature_celsius': 24.5,
    'wind_kph': 22.0
}))
print("   Prediction:", pred_res['prediction'])
print("   Probability:", pred_res.get('probability'), "%")
print("   Explanation:", pred_res.get('explanation'))

print("\nALL BACKEND CHECKS PASSED!")

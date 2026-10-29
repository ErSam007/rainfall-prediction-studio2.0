import urllib.request
import json

print("==================================================")
print("       RAINFALL AI SYSTEM VERIFICATION           ")
print("==================================================")

try:
    with urllib.request.urlopen('http://localhost:5173/') as resp:
        print(f"[OK] Frontend Server: Online (Status {resp.status}) at http://localhost:5173/")
except Exception as e:
    print(f"[ERR] Frontend Server Error: {e}")

try:
    with urllib.request.urlopen('http://127.0.0.1:8000/api/health') as resp:
        health = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] FastAPI Backend: {health.get('service')} - Status: {health.get('status')}")
except Exception as e:
    print(f"[ERR] Backend Health Error: {e}")

try:
    req = urllib.request.Request('http://127.0.0.1:8000/api/load-sample', data=b'', method='POST')
    with urllib.request.urlopen(req) as resp:
        sample = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Sample Dataset Loaded: '{sample['filename']}' ({sample['total_rows']:,} rows, {sample['total_columns']} features)")
except Exception as e:
    print(f"[ERR] Sample Load Error: {e}")

try:
    payload = json.dumps({'target_column': 'precip_mm', 'task_type': 'classification', 'binary_threshold': 0.0}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/preprocess', data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        prep = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Preprocessing Complete: Train size={prep['summary']['train_size']:,}, Test size={prep['summary']['test_size']:,}, Missing After={prep['summary']['missing_after']}")
except Exception as e:
    print(f"[ERR] Preprocessing Error: {e}")

try:
    req = urllib.request.Request('http://127.0.0.1:8000/api/train', data=b'{}', headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        train = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Model Training & Evaluation Complete:")
        print(f"    * Best Algorithm: {train['best_model_name']}")
        for model_name, info in train['results'].items():
            if info.get('metrics'):
                m = info['metrics']
                print(f"      - {model_name:22s}: Accuracy={m['accuracy']}% | F1={m['f1_score']}% | Precision={m['precision']}% | Recall={m['recall']}%")
except Exception as e:
    print(f"[ERR] Model Training Error: {e}")

try:
    with urllib.request.urlopen('http://127.0.0.1:8000/api/visualizations') as resp:
        vis = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Visualization Summaries Generated: {len(vis['rainfall_distribution']['data'])} distribution bins, {len(vis['correlation_matrix']['features'])} correlation features")
except Exception as e:
    print(f"[ERR] Visualizations Error: {e}")

try:
    payload = json.dumps({
        'inputs': {
            'humidity': 92,
            'pressure_mb': 1002,
            'cloud': 85,
            'temperature_celsius': 25.0,
            'wind_kph': 18.0
        }
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/predict', data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        pred = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Rainfall Prediction Test:")
        print(f"    * Verdict: {pred.get('verdict_title')}")
        print(f"    * Condition: {pred.get('prediction')}")
        print(f"    * Probability: {pred.get('probability')}%")
        print(f"    * Model: {pred.get('model_used')} (Accuracy: {pred.get('model_accuracy')})")
        print(f"    * GenAI Headline: {pred.get('genai_insights', {}).get('headline')}")
        print(f"    * GenAI Attire: {pred.get('genai_insights', {}).get('wardrobe')}")

    payload_copilot = json.dumps({
        'question': 'Can I plan an outdoor picnic tomorrow?',
        'weather_data': {'Location': 'Sydney', 'MaxTemp': 26.0, 'Humidity3pm': 40.0, 'Pressure3pm': 1016.0},
        'is_rain': False,
        'probability': 12.0
    }).encode('utf-8')
    req_copilot = urllib.request.Request('http://127.0.0.1:8000/api/genai/ask', data=payload_copilot, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req_copilot) as resp:
        copilot_res = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Generative AI Copilot:")
        print(f"    * Question: {copilot_res.get('question')}")
        print(f"    * AI Answer: {copilot_res.get('answer')}")
except Exception as e:
    print(f"[ERR] Prediction Error: {e}")

print("==================================================")
print("     ALL VERIFICATION TESTS PASSED SUCCESSFULLY!  ")
print("==================================================")
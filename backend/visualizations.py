import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional


def get_missing_values_chart_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    data = []
    total_rows = len(df)
    for col in df.columns:
        missing_count = int(df[col].isnull().sum())
        data.append({
            'column': col,
            'missingCount': missing_count,
            'missingPercent': round((missing_count / total_rows) * 100, 2) if total_rows > 0 else 0
        })
    return sorted(data, key=lambda x: x['missingCount'], reverse=True)


def get_rainfall_distribution(df: pd.DataFrame, target_col: str, task_type: str) -> Dict[str, Any]:
    series = df[target_col].dropna()
    if task_type == 'classification':
        counts = series.value_counts().to_dict()
        chart_data = [{'label': str(k), 'count': int(v)} for k, v in counts.items()]
        return {'type': 'categorical', 'data': chart_data}
    else:
        numeric_series = pd.to_numeric(series, errors='coerce').dropna()
        if len(numeric_series) == 0:
            return {'type': 'numeric', 'data': []}
            
        bins = [0, 0.1, 1.0, 5.0, 10.0, 25.0, 50.0, float('inf')]
        labels = ['0 mm (Dry)', '0.1-1 mm (Light)', '1-5 mm (Moderate)', '5-10 mm (Substantial)', '10-25 mm (Heavy)', '25-50 mm (Very Heavy)', '>50 mm (Extreme)']
        binned = pd.cut(numeric_series, bins=bins, labels=labels, right=False)
        counts = binned.value_counts(sort=False).to_dict()
        chart_data = [{'range': str(k), 'count': int(v)} for k, v in counts.items()]
        return {'type': 'binned', 'data': chart_data}


def get_feature_correlation_matrix(df: pd.DataFrame, numeric_cols: List[str], max_features: int = 10) -> Dict[str, Any]:
    valid_cols = [c for c in numeric_cols if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
    if len(valid_cols) < 2:
        return {'features': [], 'matrix': []}
        
    subset = df[valid_cols[:max_features]].dropna()
    corr = subset.corr().round(2)
    features = list(corr.columns)
    
    matrix = []
    for row_feat in features:
        row_dict = {'feature': row_feat}
        for col_feat in features:
            val = corr.loc[row_feat, col_feat]
            row_dict[col_feat] = float(val) if not np.isnan(val) else 0.0
        matrix.append(row_dict)
        
    return {'features': features, 'matrix': matrix}


def get_feature_distributions(df: pd.DataFrame, numeric_cols: List[str]) -> List[Dict[str, Any]]:
    results = []
    selected_cols = numeric_cols[:6]
    
    for col in selected_cols:
        series = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(series) < 10:
            continue
            
        counts, bin_edges = np.histogram(series, bins=8)
        bins_data = []
        for i in range(len(counts)):
            bin_label = f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}"
            bins_data.append({
                'bin': bin_label,
                'count': int(counts[i]),
                'mid': round(float((bin_edges[i] + bin_edges[i+1]) / 2), 1)
            })
            
        results.append({
            'feature': col,
            'mean': round(float(series.mean()), 2),
            'std': round(float(series.std()), 2),
            'min': round(float(series.min()), 2),
            'max': round(float(series.max()), 2),
            'bins': bins_data
        })
        
    return results


def get_rainfall_vs_feature(df: pd.DataFrame, target_col: str, feature_col: str, max_points: int = 150) -> List[Dict[str, Any]]:
    if feature_col not in df.columns or target_col not in df.columns:
        return []
        
    clean_df = df[[feature_col, target_col]].dropna()
    clean_df[feature_col] = pd.to_numeric(clean_df[feature_col], errors='coerce')
    clean_df = clean_df.dropna()
    
    if len(clean_df) > max_points:
        sampled = clean_df.sample(max_points, random_state=42)
    else:
        sampled = clean_df
        
    result = []
    for _, row in sampled.iterrows():
        result.append({
            'feature_value': round(float(row[feature_col]), 2),
            'rainfall': round(float(row[target_col]), 2) if pd.api.types.is_numeric_dtype(clean_df[target_col]) else str(row[target_col])
        })
    return sorted(result, key=lambda x: x['feature_value'])
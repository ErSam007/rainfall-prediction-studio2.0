import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder

COMMON_TARGET_NAMES = [
    'raintomorrow', 'rainfall', 'raintoday', 'precip_mm', 'precipitation',
    'rain', 'rainfall_amount', 'rainfall_status', 'target'
]

COLUMNS_TO_DROP_KEYWORDS = [
    'epoch', 'timestamp', 'date', 'id', 'unnamed', 'row_id', 'index'
]


def detect_target_column(columns: List[str]) -> Optional[str]:
    lower_map = {col.lower().strip().replace(' ', '_'): col for col in columns}

    for target in COMMON_TARGET_NAMES:
        if target in lower_map:
            return lower_map[target]

    for col_lower, original_col in lower_map.items():
        if 'rain' in col_lower or 'precip' in col_lower:
            return original_col

    return None


def detect_task_type(series: pd.Series) -> str:
    if series.dtype == 'object' or series.dtype == 'bool' or series.dtype.name == 'category':
        return 'classification'

    unique_vals = series.dropna().unique()
    num_unique = len(unique_vals)

    if num_unique <= 2:
        return 'classification'

    return 'regression'


def compute_iqr_outliers(df: pd.DataFrame, numerical_cols: List[str]) -> Dict[str, Any]:
    outlier_summary = {}
    for col in numerical_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue

        q1 = float(np.percentile(series, 25))
        q3 = float(np.percentile(series, 75))
        iqr = q3 - q1
        median = float(np.median(series))
        lower_bound = float(q1 - 1.5 * iqr)
        upper_bound = float(q3 + 1.5 * iqr)
        min_val = float(series.min())
        max_val = float(series.max())

        outliers = series[(series < lower_bound) | (series > upper_bound)]
        outlier_count = int(len(outliers))
        outlier_percent = round((outlier_count / len(series)) * 100, 2)

        outlier_summary[col] = {
            'min': round(min_val, 2),
            'q1': round(q1, 2),
            'median': round(median, 2),
            'q3': round(q3, 2),
            'max': round(max_val, 2),
            'lower_bound': round(lower_bound, 2),
            'upper_bound': round(upper_bound, 2),
            'iqr': round(iqr, 2),
            'outlier_count': outlier_count,
            'outlier_percentage': outlier_percent
        }
    return outlier_summary


class DataPreprocessor:
    def __init__(self):
        self.target_column: Optional[str] = None
        self.task_type: Optional[str] = None
        self.numeric_features: List[str] = []
        self.categorical_features: List[str] = []
        self.dropped_columns: List[str] = []
        self.feature_names_out: List[str] = []
        self.pipeline: Optional[ColumnTransformer] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self.target_classes_: Optional[List[str]] = None
        self.preprocessing_summary: Dict[str, Any] = {}

    def prepare_data(
        self,
        df: pd.DataFrame,
        target_column: Optional[str] = None,
        task_type: Optional[str] = None,
        binary_threshold: Optional[float] = None
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
        raw_rows = len(df)
        missing_before = int(df.isnull().sum().sum())

        df_cleaned = df.drop_duplicates().copy()
        duplicates_removed = raw_rows - len(df_cleaned)

        if not target_column or target_column not in df_cleaned.columns:
            detected = detect_target_column(list(df_cleaned.columns))
            if not detected:
                raise ValueError("Could not automatically identify rainfall target column. Please select one manually.")
            self.target_column = detected
        else:
            self.target_column = target_column

        raw_target = df_cleaned[self.target_column]
        if not task_type:
            self.task_type = detect_task_type(raw_target)
        else:
            self.task_type = task_type.lower()

        y_series = raw_target.copy()
        if self.task_type == 'classification':
            if y_series.dtype in ['float64', 'int64', 'float32', 'int32'] and len(y_series.dropna().unique()) > 2:
                thresh = binary_threshold if binary_threshold is not None else 0.0
                y_series = (y_series > thresh).map({True: 'Rain', False: 'No Rain'})
            else:
                y_series = y_series.astype(str).str.strip().str.title()

            valid_mask = y_series.notnull() & (y_series != 'Nan') & (y_series != 'None')
            df_cleaned = df_cleaned[valid_mask].copy()
            y_series = y_series[valid_mask]

            self.label_encoder = LabelEncoder()
            y = self.label_encoder.fit_transform(y_series)
            self.target_classes_ = [str(cls) for cls in self.label_encoder.classes_]
        else:
            df_cleaned = df_cleaned[df_cleaned[self.target_column].notnull()].copy()
            y_series = pd.to_numeric(df_cleaned[self.target_column], errors='coerce')
            valid_mask = y_series.notnull()
            df_cleaned = df_cleaned[valid_mask].copy()
            y = y_series[valid_mask].values.astype(np.float64)
            self.target_classes_ = None

        X_df = df_cleaned.drop(columns=[self.target_column])

        cols_to_drop = []
        for col in X_df.columns:
            col_l = col.lower().strip()
            if any(kw in col_l for kw in COLUMNS_TO_DROP_KEYWORDS):
                cols_to_drop.append(col)
            elif self.target_column.lower() in ['precip_mm', 'precipitation'] and 'precip' in col_l:
                cols_to_drop.append(col)

        if cols_to_drop:
            self.dropped_columns = cols_to_drop
            X_df = X_df.drop(columns=cols_to_drop)

        self.numeric_features = []
        self.categorical_features = []

        for col in X_df.columns:
            if pd.api.types.is_numeric_dtype(X_df[col]):
                self.numeric_features.append(col)
            else:
                self.categorical_features.append(col)

        outlier_summary = compute_iqr_outliers(X_df, self.numeric_features)

        stratify = y if (self.task_type == 'classification' and len(np.unique(y)) > 1) else None
        X_train_df, X_test_df, y_train, y_test = train_test_split(
            X_df, y, test_size=0.2, random_state=42, stratify=stratify
        )

        transformers = []
        if self.numeric_features:
            num_pipeline = Pipeline([
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', StandardScaler())
            ])
            transformers.append(('num', num_pipeline, self.numeric_features))

        if self.categorical_features:
            cat_pipeline = Pipeline([
                ('imputer', SimpleImputer(strategy='most_frequent')),
                ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
            ])
            transformers.append(('cat', cat_pipeline, self.categorical_features))

        self.pipeline = ColumnTransformer(transformers=transformers, remainder='drop')

        X_train = self.pipeline.fit_transform(X_train_df)
        X_test = self.pipeline.transform(X_test_df)

        feature_names = []
        if self.numeric_features:
            feature_names.extend(self.numeric_features)
        if self.categorical_features and 'cat' in self.pipeline.named_transformers_:
            try:
                onehot_cols = self.pipeline.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(self.categorical_features)
                feature_names.extend(list(onehot_cols))
            except Exception:
                feature_names.extend(self.categorical_features)
        self.feature_names_out = feature_names

        missing_after = 0

        self.preprocessing_summary = {
            'original_rows': raw_rows,
            'clean_rows': len(df_cleaned),
            'duplicates_removed': duplicates_removed,
            'missing_before': missing_before,
            'missing_after': missing_after,
            'target_column': self.target_column,
            'task_type': self.task_type,
            'target_classes': self.target_classes_,
            'features_selected_count': len(self.feature_names_out),
            'raw_features_count': len(X_df.columns),
            'numeric_features': self.numeric_features,
            'categorical_features': self.categorical_features,
            'dropped_columns': self.dropped_columns,
            'train_size': int(X_train.shape[0]),
            'test_size': int(X_test.shape[0]),
            'outlier_summary': outlier_summary
        }

        return X_train, X_test, y_train, y_test, self.preprocessing_summary

    def transform_single_input(self, input_dict: Dict[str, Any]) -> np.ndarray:
        if self.pipeline is None:
            raise ValueError("Preprocessor pipeline has not been fitted yet.")

        input_df = pd.DataFrame([input_dict])

        for col in self.numeric_features:
            if col not in input_df.columns:
                input_df[col] = np.nan
            else:
                input_df[col] = pd.to_numeric(input_df[col], errors='coerce')

        for col in self.categorical_features:
            if col not in input_df.columns:
                input_df[col] = np.nan
            else:
                input_df[col] = str(input_df[col])

        transformed = self.pipeline.transform(input_df)
        return transformed
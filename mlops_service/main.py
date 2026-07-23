from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import scipy.stats as stats
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error

app = FastAPI(title="AskDeepakAI MLOps Service")

class TrainRequest(BaseModel):
    data: List[Dict[str, Any]]
    target: str

class PredictRequest(BaseModel):
    features: List[Dict[str, Any]]

class DriftRequest(BaseModel):
    reference_data: List[Dict[str, Any]]
    current_data: List[Dict[str, Any]]

# Global model store for demo purposes
model_store = {}

@app.post("/api/train")
def train_model(request: TrainRequest):
    if not request.data:
        raise HTTPException(status_code=400, detail="No data provided")
    
    df = pd.DataFrame(request.data)
    if request.target not in df.columns:
        raise HTTPException(status_code=400, detail="Target variable not found in data")
        
    y = df[request.target]
    X = df.drop(columns=[request.target])
    
    # Simple auto-detect categorical encoding
    X = pd.get_dummies(X)
    
    # Determine task type
    if pd.api.types.is_numeric_dtype(y) and y.nunique() > 10:
        task = "regression"
        model = RandomForestRegressor(n_estimators=100)
    else:
        task = "classification"
        model = RandomForestClassifier(n_estimators=100)
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model.fit(X_train, y_train)
    
    # Save model
    joblib.dump(model, "model_artifact.joblib")
    
    # Dummy accuracy parsing
    if task == "classification":
        score = accuracy_score(y_test, model.predict(X_test))
        metric = "Accuracy"
    else:
        score = mean_squared_error(y_test, model.predict(X_test))
        metric = "MSE"
        
    return {"status": "Model trained successfully", "task": task, metric: score}


@app.post("/api/predict")
def predict_model(request: PredictRequest):
    try:
        model = joblib.load("model_artifact.joblib")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found. Train first.")
        
    df = pd.DataFrame(request.features)
    df = pd.get_dummies(df)
    
    predictions = model.predict(df)
    return {"predictions": predictions.tolist()}

@app.post("/api/drift-metrics")
def drift_metrics(request: DriftRequest):
    """
    Computes data drift using the Kolmogorov-Smirnov test mapping per feature.
    """
    if not request.current_data or not request.reference_data:
         raise HTTPException(status_code=400, detail="Data payload missing")
         
    df_ref = pd.DataFrame(request.reference_data)
    df_cur = pd.DataFrame(request.current_data)
    
    drift_report = {}
    
    for col in df_cur.columns:
        if col in df_ref.columns and pd.api.types.is_numeric_dtype(df_ref[col]):
            stat, p_value = stats.ks_2samp(df_ref[col].dropna(), df_cur[col].dropna())
            drift_report[col] = {
                 "ks_stat": stat,
                 "p_value": p_value,
                 "drift_detected": bool(p_value < 0.05)
            }
            
    return {"drift_status": drift_report}

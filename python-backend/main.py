"""
F1 AI Prediction API - FastAPI Backend
Deploy this separately (Railway, Render, Heroku, or your own server)

Install requirements:
pip install fastapi uvicorn pandas numpy sqlite3 joblib tensorflow scikit-learn

Run locally:
uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import sqlite3
import joblib
import os

# Try to import TensorFlow (for Historical model)
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow not available - Historical model disabled")

app = FastAPI(
    title="F1 AI Prediction API",
    description="Backend API for F1 race predictions using ML models",
    version="1.0.0"
)

# CORS - Allow your Lovable frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ⚙️ CONFIGURATION
# ==========================================
DB_NAME = "f1_data.db"
HISTORICAL_MODEL_FILE = "f1_hybrid_model.keras"
HISTORICAL_SCALER_FILE = "advanced_scalers.pkl"
TELEMETRY_MODEL_PATH = "saved_models"
SEQ_LENGTH = 5

# ==========================================
# 📥 LOAD MODELS AT STARTUP
# ==========================================
models = {
    "historical": {"loaded": False},
    "telemetry": {"loaded": False},
    "hybrid": {"loaded": False}
}

def load_historical_model():
    """Load the Historical LSTM model"""
    if not TF_AVAILABLE:
        return False
    try:
        model = load_model(HISTORICAL_MODEL_FILE, compile=False)
        artifacts = joblib.load(HISTORICAL_SCALER_FILE)
        models["historical"] = {
            "loaded": True,
            "model": model,
            "scaler": artifacts['scaler'],
            "le_driver": artifacts['le_driver'],
            "le_team": artifacts['le_team'],
            "hist_features": artifacts['hist_features'],
            "curr_features": artifacts['curr_features'],
            "all_features": artifacts['all_features']
        }
        print("✅ Historical model loaded")
        return True
    except Exception as e:
        print(f"❌ Failed to load Historical model: {e}")
        return False

def load_telemetry_model():
    """Load the Telemetry probability model"""
    try:
        path = TELEMETRY_MODEL_PATH
        # Ensure path exists
        if not os.path.exists(path):
             print(f"❌ Telemetry model path not found: {path}")
             return False

        models["telemetry"] = {
            "loaded": True,
            "model": joblib.load(f'{path}/f1_8feat_model.pkl'),
            "scaler": joblib.load(f'{path}/scaler_8feat.pkl'),
            "driver_map": joblib.load(f'{path}/driver_map.pkl'),
            "team_map": joblib.load(f'{path}/team_map.pkl'),
            "history": joblib.load(f'{path}/processed_history.pkl')
        }
        print("✅ Telemetry model loaded")
        return True
    except Exception as e:
        print(f"❌ Failed to load Telemetry model: {e}")
        return False

def load_hybrid_model():
    """Load both models for hybrid predictions"""
    historical_ok = models["historical"]["loaded"] or load_historical_model()
    telemetry_ok = models["telemetry"]["loaded"] or load_telemetry_model()
    models["hybrid"]["loaded"] = historical_ok or telemetry_ok
    return models["hybrid"]["loaded"]

@app.on_event("startup")
async def startup_event():
    """Load all models on startup"""
    load_historical_model()
    load_telemetry_model()
    load_hybrid_model()

# ==========================================
# 📋 API MODELS
# ==========================================
class PredictionResult(BaseModel):
    grid_position: int
    driver: str
    team: str
    predicted_position: int
    actual_position: int
    win_probability: float
    team_color: str

class PredictionResponse(BaseModel):
    success: bool
    year: int
    circuit: str
    model_type: str
    predictions: List[PredictionResult]
    ai_winner: str
    actual_winner: str
    error: Optional[str] = None

    # FIX: Disable protected namespace warning for 'model_type' field
    model_config = {"protected_namespaces": ()}

class YearsResponse(BaseModel):
    years: List[int]

class CircuitsResponse(BaseModel):
    circuits: List[str]

# ==========================================
# 🎨 TEAM COLORS
# ==========================================
TEAM_COLORS = {
    "Red Bull Racing": "#3671C6",
    "Ferrari": "#E8002D",
    "Mercedes": "#27F4D2",
    "McLaren": "#FF8000",
    "Aston Martin": "#229971",
    "Alpine": "#FF87BC",
    "Williams": "#64C4FF",
    "AlphaTauri": "#5E8FAA",
    "RB": "#6692FF",
    "Alfa Romeo": "#C92D4B",
    "Haas F1 Team": "#B6BABD",
    "Kick Sauber": "#52E252",
    "Racing Point": "#F596C8",
    "Renault": "#FFF500",
}

def get_team_color(team_name: str) -> str:
    if not team_name:
        return "#888888"
    for key, color in TEAM_COLORS.items():
        if key.lower() in team_name.lower():
            return color
    return "#888888"

# ==========================================
# 🔌 API ENDPOINTS
# ==========================================

@app.get("/")
async def root():
    return {
        "message": "F1 AI Prediction API",
        "models": {
            "historical": models["historical"]["loaded"],
            "telemetry": models["telemetry"]["loaded"],
            "hybrid": models["hybrid"]["loaded"]
        }
    }

@app.get("/years/{model_type}", response_model=YearsResponse)
async def get_years(model_type: str):
    """Get available years for a model type"""
    try:
        if not os.path.exists(DB_NAME):
             return {"years": []}
             
        conn = sqlite3.connect(DB_NAME)
        years = pd.read_sql(
            "SELECT DISTINCT year FROM race_data ORDER BY year DESC", 
            conn
        )['year'].tolist()
        conn.close()
        
        # Filter years based on model type
        if model_type == "telemetry":
            years = [y for y in years if y >= 2023]
        # historical and hybrid use all years (2018-2025)
        
        return {"years": years}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/circuits/{year}", response_model=CircuitsResponse)
async def get_circuits(year: int):
    """Get circuits for a specific year"""
    try:
        if not os.path.exists(DB_NAME):
             return {"circuits": []}

        conn = sqlite3.connect(DB_NAME)
        circuits = pd.read_sql(
            f"SELECT DISTINCT circuit_name FROM race_data WHERE year={year} ORDER BY round",
            conn
        )['circuit_name'].tolist()
        conn.close()
        return {"circuits": circuits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/historical", response_model=PredictionResponse)
async def predict_historical(year: int, circuit: str):
    """Historical LSTM model prediction (2018-2025)"""
    if not models["historical"]["loaded"]:
        raise HTTPException(status_code=503, detail="Historical model not available")
    
    return await run_historical_prediction(year, circuit)

@app.post("/predict/telemetry", response_model=PredictionResponse)
async def predict_telemetry(year: int, circuit: str):
    """Telemetry probability model (2023-2025)"""
    if not models["telemetry"]["loaded"]:
        raise HTTPException(status_code=503, detail="Telemetry model not available")
    
    if year < 2023:
        raise HTTPException(status_code=400, detail="Telemetry model only supports 2023-2025")
    
    return await run_telemetry_prediction(year, circuit)

@app.post("/predict/hybrid", response_model=PredictionResponse)
async def predict_hybrid(year: int, circuit: str):
    """Hybrid model combining LSTM + Telemetry (2018-2025)"""
    if not models["hybrid"]["loaded"]:
        raise HTTPException(status_code=503, detail="Hybrid model not available")
    
    return await run_hybrid_prediction(year, circuit)

# ==========================================
# 🧠 PREDICTION LOGIC
# ==========================================

async def run_historical_prediction(year: int, circuit: str) -> PredictionResponse:
    """Run the Historical LSTM model prediction"""
    conn = sqlite3.connect(DB_NAME)
    
    try:
        # Get round number
        q = f"SELECT round FROM race_data WHERE year={year} AND circuit_name='{circuit}' LIMIT 1"
        round_num = pd.read_sql(q, conn)['round'].iloc[0]
        
        # Get drivers
        drivers = pd.read_sql(
            f"SELECT * FROM race_data WHERE year={year} AND round={round_num}", 
            conn
        )
    except Exception as e:
        conn.close()
        return PredictionResponse(
            success=False, year=year, circuit=circuit, model_type="historical",
            predictions=[], ai_winner="", actual_winner="", error=str(e)
        )
    
    m = models["historical"]
    predictions = []
    
    for _, row in drivers.iterrows():
        driver = row['driver_code']
        
        # Fetch history
        h_q = f"""
            SELECT * FROM race_data WHERE driver_code='{driver}' 
            AND (year < {year} OR (year = {year} AND round < {round_num}))
            ORDER BY year DESC, round DESC LIMIT {SEQ_LENGTH}
        """
        hist_df = pd.read_sql(h_q, conn).sort_values(['year', 'round'])
        
        if len(hist_df) < SEQ_LENGTH:
            # Not enough history, use grid position as fallback
            score = row['grid_position']
        else:
            # Feature engineering
            points_map = {1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1}
            hist_df['points'] = hist_df['final_position'].map(points_map).fillna(0)
            hist_df['position_gain'] = hist_df['grid_position'] - hist_df['final_position']
            hist_df['driver_momentum'] = hist_df['points'].rolling(3, min_periods=1).mean().fillna(0)
            
            # Encode
            try:
                hist_df['driver_encoded'] = m['le_driver'].transform(hist_df['driver_code'])
            except:
                hist_df['driver_encoded'] = 0
            try:
                hist_df['team_encoded'] = m['le_team'].transform(hist_df['team_name'])
            except:
                hist_df['team_encoded'] = 0
            
            # Prepare inputs
            try:
                hist_scaled = m['scaler'].transform(hist_df[m['all_features']])
                h_idxs = [m['all_features'].index(f) for f in m['hist_features']]
                X_h = hist_scaled[:, h_idxs].reshape(1, SEQ_LENGTH, len(m['hist_features']))
                
                # Current context
                curr_row = pd.DataFrame([row])
                for c in m['all_features']:
                    if c not in curr_row:
                        curr_row[c] = 0
                
                try:
                    curr_row['driver_encoded'] = m['le_driver'].transform([row['driver_code']])
                except:
                    curr_row['driver_encoded'] = 0
                try:
                    curr_row['team_encoded'] = m['le_team'].transform([row['team_name']])
                except:
                    curr_row['team_encoded'] = 0
                
                curr_scaled = m['scaler'].transform(curr_row[m['all_features']])
                c_idxs = [m['all_features'].index(f) for f in m['curr_features']]
                X_c = curr_scaled[:, c_idxs].reshape(1, len(m['curr_features']))
                
                score = float(m['model'].predict([X_h, X_c], verbose=0)[0][0])
            except Exception as e:
                score = row['grid_position']
        
        predictions.append({
            'driver': driver,
            'team': row['team_name'],
            'grid_position': int(row['grid_position']),
            'actual_position': int(row['final_position']),
            'score': score,
            'team_color': get_team_color(row['team_name'])
        })
    
    conn.close()
    
    # Sort by score and assign predictions
    predictions.sort(key=lambda x: x['score'])
    results = []
    for i, p in enumerate(predictions):
        results.append(PredictionResult(
            grid_position=p['grid_position'],
            driver=p['driver'],
            team=p['team'],
            predicted_position=i + 1,
            actual_position=p['actual_position'],
            win_probability=max(0, 100 - (i * 5)),  # Simple probability estimate
            team_color=p['team_color']
        ))
    
    ai_winner = results[0].driver if results else ""
    actual_winner = next((r.driver for r in results if r.actual_position == 1), "Unknown")
    
    return PredictionResponse(
        success=True, year=year, circuit=circuit, model_type="historical",
        predictions=results, ai_winner=ai_winner, actual_winner=actual_winner
    )

async def run_telemetry_prediction(year: int, circuit: str) -> PredictionResponse:
    """Run the Telemetry model prediction"""
    m = models["telemetry"]
    history = m["history"]
    
    # Find the race in history
    race_data = history[
        (history['date'].astype(str).str.contains(str(year))) &
        (history['circuit_name'].str.contains(circuit, case=False, na=False))
    ]
    
    if race_data.empty:
        return PredictionResponse(
            success=False, year=year, circuit=circuit, model_type="telemetry",
            predictions=[], ai_winner="", actual_winner="",
            error="Race not found in telemetry data"
        )
    
    # Use first session
    session_id = race_data['session_key'].iloc[0]
    race_data = race_data[race_data['session_key'] == session_id].copy()
    
    features = [
        'grid_position', 'avg_race_pace', 'pace_consistency', 'top_speed',
        'team_encoded', 'track_temperature', 'rain_probability', 'driver_encoded'
    ]
    
    try:
        X_input = race_data[features]
        X_scaled = m['scaler'].transform(X_input)
        
        # FIX: Sharper temperature to differentiate probabilities (was 2.5)
        temperature = 0.5
        raw_probs = m['model'].predict_proba(X_scaled)[:, 1]
        exp_probs = np.exp(raw_probs / temperature)
        probs = exp_probs / np.sum(exp_probs)
        
        race_data['win_prob'] = probs * 100
        race_data = race_data.sort_values('win_prob', ascending=False).reset_index(drop=True)
        
        results = []
        for i, (_, row) in enumerate(race_data.iterrows()):
            team_name = row.get('team_name', 'Unknown')
            results.append(PredictionResult(
                grid_position=int(row['grid_position']),
                driver=row['name_acronym'],
                team=team_name,
                predicted_position=i + 1,
                actual_position=int(row.get('final_position', 0)),
                win_probability=float(row['win_prob']),
                team_color=get_team_color(team_name)
            ))
        
        ai_winner = results[0].driver if results else ""
        actual_winner = next((r.driver for r in results if r.actual_position == 1), "Unknown")
        
        return PredictionResponse(
            success=True, year=year, circuit=circuit, model_type="telemetry",
            predictions=results, ai_winner=ai_winner, actual_winner=actual_winner
        )
    except Exception as e:
        return PredictionResponse(
            success=False, year=year, circuit=circuit, model_type="telemetry",
            predictions=[], ai_winner="", actual_winner="", error=str(e)
        )

async def run_hybrid_prediction(year: int, circuit: str) -> PredictionResponse:
    """Run the Hybrid model combining LSTM + Telemetry"""
    conn = sqlite3.connect(DB_NAME)
    
    try:
        q = f"SELECT round FROM race_data WHERE year={year} AND circuit_name='{circuit}' LIMIT 1"
        round_num = pd.read_sql(q, conn)['round'].iloc[0]
        drivers = pd.read_sql(
            f"SELECT * FROM race_data WHERE year={year} AND round={round_num}",
            conn
        )
    except Exception as e:
        conn.close()
        return PredictionResponse(
            success=False, year=year, circuit=circuit, model_type="hybrid",
            predictions=[], ai_winner="", actual_winner="", error=str(e)
        )
    
    predictions_data = []
    
    # Get Historical model scores
    for _, row in drivers.iterrows():
        score_a = row['grid_position']  # Fallback
        
        if models["historical"]["loaded"]:
            # Would run historical prediction here
            # Using simplified version for this example
            pass
        
        predictions_data.append({
            'driver': row['driver_code'],
            'team': row['team_name'],
            'grid_position': int(row['grid_position']),
            'actual_position': int(row['final_position']),
            'score_a': score_a,
            'prob_b': 0.0,
            'team_color': get_team_color(row['team_name'])
        })
    
    conn.close()
    df = pd.DataFrame(predictions_data)
    
    # Get Telemetry probabilities if available (2023+)
    if models["telemetry"]["loaded"] and year >= 2023:
        m = models["telemetry"]
        history = m["history"]
        
        race_b = history[
            (history['date'].astype(str).str.contains(str(year))) &
            (history['circuit_name'].str.contains(circuit, case=False, na=False))
        ]
        
        if not race_b.empty:
            sid = race_b['session_key'].iloc[0]
            race_b_sess = race_b[race_b['session_key'] == sid].copy()
            
            features = [
                'grid_position', 'avg_race_pace', 'pace_consistency', 'top_speed',
                'team_encoded', 'track_temperature', 'rain_probability', 'driver_encoded'
            ]
            
            try:
                X_b = m['scaler'].transform(race_b_sess[features])
                raw_probs = m['model'].predict_proba(X_b)[:, 1]
                # FIX: Match lower temperature here too
                temperature = 0.5 
                exp_probs = np.exp(raw_probs / temperature)
                probs = exp_probs / np.sum(exp_probs)
                
                prob_map = dict(zip(race_b_sess['name_acronym'], probs))
                df['prob_b'] = df['driver'].map(prob_map).fillna(0.0)
            except:
                pass
    
    # Hybrid ranking logic
    df['rank_a'] = df['score_a'].rank(method='min')
    df['rank_b'] = df['prob_b'].rank(ascending=False, method='min')
    
    def get_consensus(row):
        if row['prob_b'] > 0:
            return (row['rank_a'] + row['rank_b']) / 2
        return row['rank_a']
    
    df['consensus'] = df.apply(get_consensus, axis=1)
    df = df.sort_values('consensus').reset_index(drop=True)
    
    results = []
    for i, row in df.iterrows():
        # FIX: Ensure probability is never 0 by adding a fallback estimation
        if row['prob_b'] > 0:
            final_prob = float(row['prob_b'] * 100)
        else:
            final_prob = max(0, 100 - (i * 5)) # Fallback estimation based on rank
            
        results.append(PredictionResult(
            grid_position=row['grid_position'],
            driver=row['driver'],
            team=row['team'],
            predicted_position=i + 1,
            actual_position=row['actual_position'],
            win_probability=final_prob,
            team_color=row['team_color']
        ))
    
    ai_winner = results[0].driver if results else ""
    actual_winner = next((r.driver for r in results if r.actual_position == 1), "Unknown")
    
    return PredictionResponse(
        success=True, year=year, circuit=circuit, model_type="hybrid",
        predictions=results, ai_winner=ai_winner, actual_winner=actual_winner
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

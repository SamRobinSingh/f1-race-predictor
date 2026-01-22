"""
F1 Race Visualization API - FastF1 Backend
Provides real-time race simulation data with telemetry

Install requirements:
pip install fastapi uvicorn fastf1 ollama pandas numpy

Run locally:
uvicorn race_visualization_api:app --reload --port 8001
"""

import pandas as pd
import numpy as np
import fastf1
import ollama
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any

# --- CONFIGURATION ---
CACHE_DIR = 'cache'
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
fastf1.Cache.enable_cache(CACHE_DIR)

app = FastAPI(title="F1 Pro Max API", version="1.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY STORE ---
# In a production app, use Redis. For now, a global dict suffices.
race_cache = {}

# --- PYDANTIC MODELS (Data Contracts) ---
class RaceRequest(BaseModel):
    year: int
    circuit: str

class CommentaryRequest(BaseModel):
    time_val: float
    leader_name: str
    leader_team: str
    leader_compound: str
    leader_speed: int
    chaser_name: str
    gap: float # Distance gap

class RaceResponse(BaseModel):
    event_name: str
    track_map: Dict[str, List[float]] # {'x': [], 'y': []}
    timeline: List[float]
    drivers: Dict[str, Any] # Dictionary of driver data

# --- HELPER FUNCTIONS ---
def process_race_data(year, circuit):
    """
    Loads data from FastF1, interpolates it, and prepares it for JSON response.
    """
    cache_key = f"{year}_{circuit}"
    if cache_key in race_cache:
        return race_cache[cache_key]

    try:
        session = fastf1.get_session(year, circuit, 'R')
        session.load(telemetry=True, weather=False, messages=False)
        
        if session.laps.empty:
            raise ValueError("No lap data found.")

        # Robust Start Time Detection
        try:
            fastest_lap = session.laps.pick_fastest()
            winner_tel = fastest_lap.get_telemetry()
        except:
            winner_tel = session.laps.iloc[0].get_telemetry()

        try:
            # Find when speed > 20kph
            start_frame = winner_tel[winner_tel['Speed'] > 20].index[0]
            start_time = winner_tel.loc[start_frame, 'Time'].total_seconds()
        except:
            start_time = 0 
        
        # Timeline Creation
        max_duration = session.laps['Time'].max().total_seconds()
        duration = max_duration - start_time
        # Reduced frequency to 0.5s to keep JSON payload manageable for HTTP
        time_grid = np.arange(0, duration, 0.5) 
        
        processed_drivers = {}
        
        for drv in session.drivers:
            try:
                laps = session.laps.pick_driver(drv)
                tel = laps.get_telemetry()
                if tel.empty: continue
                
                tel['Seconds'] = tel['Time'].dt.total_seconds() - start_time
                
                # Interpolate (Convert to list immediately for JSON serialization)
                # We replace NaN with None because JSON standard doesn't support NaN
                x = np.interp(time_grid, tel['Seconds'], tel['X'], left=np.nan, right=np.nan)
                y = np.interp(time_grid, tel['Seconds'], tel['Y'], left=np.nan, right=np.nan)
                speed = np.interp(time_grid, tel['Seconds'], tel['Speed'], left=0, right=0)
                
                d_info = session.get_driver(drv)
                team_color = f"#{d_info['TeamColor']}" if d_info['TeamColor'] else "#888888"
                try: compound = str(laps.iloc[0]['Compound'])
                except: compound = "UNKNOWN"
                
                # Sanitize Data for JSON (Handle NaNs)
                x = [None if np.isnan(v) else v for v in x]
                y = [None if np.isnan(v) else v for v in y]
                speed = [int(v) for v in speed]

                processed_drivers[drv] = {
                    'x': x, 'y': y, 'speed': speed,
                    'color': team_color, 
                    'name': d_info['Abbreviation'],
                    'team': d_info['TeamName'], 
                    'compound': compound
                }
            except Exception as e:
                continue

        # Track Map
        try:
            fastest_tel = session.laps.pick_fastest().get_telemetry()
            track_x = fastest_tel['X'].to_list()
            track_y = fastest_tel['Y'].to_list()
        except:
            first_drv = list(processed_drivers.values())[0]
            track_x = first_drv['x']
            track_y = first_drv['y']

        result = {
            "event_name": str(session.event['EventName']),
            "track_map": {"x": track_x, "y": track_y},
            "timeline": time_grid.tolist(),
            "drivers": processed_drivers
        }
        
        # Save to memory cache
        race_cache[cache_key] = result
        return result

    except Exception as e:
        print(f"Error processing data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- API ENDPOINTS ---

@app.get("/")
def health_check():
    return {"status": "F1 Pro Max API Online"}

@app.post("/load_race", response_model=RaceResponse)
async def load_race(req: RaceRequest):
    """
    Triggers FastF1 data loading. This is a heavy operation.
    Returns the full simulation dataset.
    """
    print(f"Loading race: {req.year} {req.circuit}")
    data = process_race_data(req.year, req.circuit)
    return data

@app.post("/commentary")
async def get_commentary(req: CommentaryRequest):
    """
    Stateless commentary generation. 
    The frontend calculates the state (who is leading) and sends it here.
    """
    gap_status = "close" if req.gap < 500 else "comfortable"
    
    prompt = f"""
    Act as a professional F1 Commentator (Crofty style).
    Context:
    - Race Time: {int(req.time_val)}s
    - Leader: {req.leader_name} ({req.leader_team}) on {req.leader_compound} tyres.
    - P2: {req.chaser_name} is {gap_status} behind.
    - Speed Leader: {req.leader_speed} km/h.
    
    Task: Write ONE dramatic sentence analyzing the situation.
    """
    
    try:
        # Using synchronous ollama call (blocking). 
        # For high traffic, use `ollama.AsyncClient`
        res = ollama.chat(model='llama3.2', messages=[{'role':'user','content':prompt}])
        return {"commentary": res['message']['content']}
    except Exception as e:
        return {"commentary": "Commentary system offline..."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

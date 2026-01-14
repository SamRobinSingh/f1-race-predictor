# F1 AI Prediction API

FastAPI backend for the F1 race prediction models.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Place your model files in this folder:**
   - `f1_data.db` - SQLite database with race data
   - `f1_hybrid_model.keras` - Historical LSTM model
   - `advanced_scalers.pkl` - Historical model scalers
   - `saved_models/` folder containing:
     - `f1_8feat_model.pkl`
     - `scaler_8feat.pkl`
     - `driver_map.pkl`
     - `team_map.pkl`
     - `processed_history.pkl`

3. **Run the server:**
```bash
uvicorn main:app --reload --port 8000
```

4. **Test the API:**
   - Open http://localhost:8000/docs for Swagger UI
   - Check model status: http://localhost:8000/

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Check API status and loaded models |
| `/years/{model_type}` | GET | Get available years for a model |
| `/circuits/{year}` | GET | Get circuits for a year |
| `/predict/historical` | POST | Historical LSTM prediction (2018-2025) |
| `/predict/telemetry` | POST | Telemetry prediction (2023-2025) |
| `/predict/hybrid` | POST | Hybrid combined prediction (2018-2025) |

## Deployment Options

### Railway
1. Push to GitHub
2. Connect Railway to your repo
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Render
1. Create new Web Service
2. Connect to repo
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Connect to Frontend

Once deployed, update the frontend API URL in your Lovable project.

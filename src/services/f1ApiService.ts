/**
 * F1 API Service
 * 
 * Connects to your Python FastAPI backend - NO mock data fallback.
 * Deploy your Python backend and set VITE_F1_API_URL env variable.
 */

import { PredictionResult, teamColors } from "@/data/f1MockData";

// ⚠️ UPDATE THIS URL with your deployed Python backend
const API_BASE_URL = import.meta.env.VITE_F1_API_URL || "http://localhost:8000";

export type ModelType = "hybrid" | "telemetry" | "historical";

interface ApiPredictionResult {
  grid_position: number;
  driver: string;
  team: string;
  predicted_position: number;
  actual_position: number;
  win_probability: number;
  team_color: string;
}

interface ApiPredictionResponse {
  success: boolean;
  year: number;
  circuit: string;
  model_type: string;
  predictions: ApiPredictionResult[];
  ai_winner: string;
  actual_winner: string;
  error?: string;
}

interface ApiYearsResponse {
  years: number[];
}

interface ApiCircuitsResponse {
  circuits: string[];
}

interface ApiHealthResponse {
  status: string;
  models: {
    historical: boolean;
    telemetry: boolean;
    hybrid: boolean;
  };
}

export interface ConnectionStatus {
  connected: boolean;
  checking: boolean;
  error: string | null;
  models: {
    historical: boolean;
    telemetry: boolean;
    hybrid: boolean;
  };
}

class F1ApiService {
  private baseUrl: string;
  private connectionStatus: ConnectionStatus = {
    connected: false,
    checking: true,
    error: null,
    models: { historical: false, telemetry: false, hybrid: false }
  };
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.checkConnection();
  }

  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.connectionStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.statusListeners.forEach(l => l(this.connectionStatus));
  }

  async checkConnection(): Promise<ConnectionStatus> {
    this.connectionStatus = { ...this.connectionStatus, checking: true };
    this.notifyListeners();

    try {
      const response = await fetch(`${this.baseUrl}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) 
      });
      
      if (response.ok) {
        const data: ApiHealthResponse = await response.json();
        this.connectionStatus = {
          connected: true,
          checking: false,
          error: null,
          models: data.models || { historical: false, telemetry: false, hybrid: false }
        };
        console.log("✅ F1 API connected:", this.baseUrl);
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Connection failed";
      this.connectionStatus = {
        connected: false,
        checking: false,
        error: `Cannot connect to ${this.baseUrl}: ${errorMsg}`,
        models: { historical: false, telemetry: false, hybrid: false }
      };
      console.error("❌ F1 API connection failed:", this.connectionStatus.error);
    }

    this.notifyListeners();
    return this.connectionStatus;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  async getYears(modelType: ModelType): Promise<number[]> {
    if (!this.connectionStatus.connected) {
      throw new Error("API not connected");
    }

    const response = await fetch(`${this.baseUrl}/years/${modelType}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch years: ${response.status}`);
    }
    const data: ApiYearsResponse = await response.json();
    return data.years;
  }

  async getCircuits(year: number): Promise<string[]> {
    if (!this.connectionStatus.connected) {
      throw new Error("API not connected");
    }

    const response = await fetch(`${this.baseUrl}/circuits/${year}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch circuits: ${response.status}`);
    }
    const data: ApiCircuitsResponse = await response.json();
    return data.circuits;
  }

  async predict(
    modelType: ModelType, 
    year: number, 
    circuit: string
  ): Promise<PredictionResult[]> {
    if (!this.connectionStatus.connected) {
      throw new Error("API not connected");
    }

    const response = await fetch(
      `${this.baseUrl}/predict/${modelType}?year=${year}&circuit=${encodeURIComponent(circuit)}`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error(`Prediction failed: ${response.status}`);
    }

    const data: ApiPredictionResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Prediction failed");
    }

    // Transform API response to match frontend format
    return data.predictions.map((p) => ({
      gridPosition: p.grid_position,
      driver: p.driver,
      team: p.team,
      prediction: p.predicted_position,
      actual: p.actual_position,
      winningProb: p.win_probability > 0 ? `${p.win_probability.toFixed(1)}%` : "-",
      teamColor: p.team_color || teamColors[p.team as keyof typeof teamColors] || "#888888"
    }));
  }

  setApiUrl(url: string): void {
    this.baseUrl = url;
    console.log("API URL updated to:", url);
    this.checkConnection();
  }

  getApiUrl(): string {
    return this.baseUrl;
  }
}

export const f1ApiService = new F1ApiService();

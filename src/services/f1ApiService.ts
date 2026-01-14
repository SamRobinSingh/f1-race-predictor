/**
 * F1 API Service
 * 
 * This service connects to your Python FastAPI backend.
 * Update API_BASE_URL with your deployed backend URL.
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

class F1ApiService {
  private baseUrl: string;
  private useMockData: boolean = true; // Toggle this when backend is ready

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Check if API is available
    this.checkApiAvailability();
  }

  private async checkApiAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) 
      });
      if (response.ok) {
        this.useMockData = false;
        console.log("✅ F1 API connected:", this.baseUrl);
      }
    } catch (error) {
      console.log("⚠️ F1 API not available, using mock data");
      this.useMockData = true;
    }
  }

  async getYears(modelType: ModelType): Promise<number[]> {
    if (this.useMockData) {
      return this.getMockYears(modelType);
    }

    try {
      const response = await fetch(`${this.baseUrl}/years/${modelType}`);
      const data: ApiYearsResponse = await response.json();
      return data.years;
    } catch (error) {
      console.error("API Error:", error);
      return this.getMockYears(modelType);
    }
  }

  async getCircuits(year: number): Promise<string[]> {
    if (this.useMockData) {
      return this.getMockCircuits(year);
    }

    try {
      const response = await fetch(`${this.baseUrl}/circuits/${year}`);
      const data: ApiCircuitsResponse = await response.json();
      return data.circuits;
    } catch (error) {
      console.error("API Error:", error);
      return this.getMockCircuits(year);
    }
  }

  async predict(
    modelType: ModelType, 
    year: number, 
    circuit: string
  ): Promise<PredictionResult[]> {
    if (this.useMockData) {
      return this.getMockPredictions(year, circuit);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/predict/${modelType}?year=${year}&circuit=${encodeURIComponent(circuit)}`,
        { method: 'POST' }
      );
      
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
    } catch (error) {
      console.error("API Error:", error);
      return this.getMockPredictions(year, circuit);
    }
  }

  // Mock data fallbacks
  private getMockYears(modelType: ModelType): number[] {
    if (modelType === "telemetry") {
      return [2025, 2024, 2023];
    }
    return [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
  }

  private getMockCircuits(year: number): string[] {
    const circuits: Record<number, string[]> = {
      2025: ["Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Australian Grand Prix", "Japanese Grand Prix", "Chinese Grand Prix", "Miami Grand Prix"],
      2024: ["Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Australian Grand Prix", "Japanese Grand Prix", "Chinese Grand Prix", "Miami Grand Prix", "Monaco Grand Prix", "Spanish Grand Prix", "Canadian Grand Prix", "British Grand Prix"],
      2023: ["Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Australian Grand Prix", "Azerbaijan Grand Prix", "Miami Grand Prix", "Monaco Grand Prix", "Spanish Grand Prix", "Canadian Grand Prix", "Austrian Grand Prix", "British Grand Prix"],
      2022: ["Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Australian Grand Prix", "Italian Grand Prix", "Miami Grand Prix", "Spanish Grand Prix", "Monaco Grand Prix", "Azerbaijan Grand Prix", "Canadian Grand Prix", "British Grand Prix"],
      2021: ["Bahrain Grand Prix", "Italian Grand Prix", "Portuguese Grand Prix", "Spanish Grand Prix", "Monaco Grand Prix", "Azerbaijan Grand Prix", "French Grand Prix", "Styrian Grand Prix", "Austrian Grand Prix", "British Grand Prix"],
      2020: ["Austrian Grand Prix", "Styrian Grand Prix", "Hungarian Grand Prix", "British Grand Prix", "70th Anniversary Grand Prix", "Spanish Grand Prix", "Belgian Grand Prix", "Italian Grand Prix", "Tuscan Grand Prix", "Russian Grand Prix"],
      2019: ["Australian Grand Prix", "Bahrain Grand Prix", "Chinese Grand Prix", "Azerbaijan Grand Prix", "Spanish Grand Prix", "Monaco Grand Prix", "Canadian Grand Prix", "French Grand Prix", "Austrian Grand Prix", "British Grand Prix"],
      2018: ["Australian Grand Prix", "Bahrain Grand Prix", "Chinese Grand Prix", "Azerbaijan Grand Prix", "Spanish Grand Prix", "Monaco Grand Prix", "Canadian Grand Prix", "French Grand Prix", "Austrian Grand Prix", "British Grand Prix"]
    };
    return circuits[year] || circuits[2024];
  }

  private getMockPredictions(year: number, circuit: string): PredictionResult[] {
    const drivers = [
      { driver: "VER", team: "Red Bull Racing", base: 1 },
      { driver: "NOR", team: "McLaren", base: 2 },
      { driver: "LEC", team: "Ferrari", base: 3 },
      { driver: "SAI", team: "Ferrari", base: 4 },
      { driver: "PIA", team: "McLaren", base: 5 },
      { driver: "HAM", team: "Mercedes", base: 6 },
      { driver: "RUS", team: "Mercedes", base: 7 },
      { driver: "PER", team: "Red Bull Racing", base: 8 },
      { driver: "ALO", team: "Aston Martin", base: 9 },
      { driver: "STR", team: "Aston Martin", base: 10 },
      { driver: "GAS", team: "Alpine", base: 11 },
      { driver: "OCO", team: "Alpine", base: 12 },
      { driver: "TSU", team: "RB", base: 13 },
      { driver: "RIC", team: "RB", base: 14 },
      { driver: "ALB", team: "Williams", base: 15 },
      { driver: "SAR", team: "Williams", base: 16 },
      { driver: "MAG", team: "Haas", base: 17 },
      { driver: "HUL", team: "Haas", base: 18 },
      { driver: "BOT", team: "Kick Sauber", base: 19 },
      { driver: "ZHO", team: "Kick Sauber", base: 20 },
    ];

    // Add variance based on circuit
    const circuitHash = circuit.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    
    return drivers.map((d, index) => {
      const variance = ((circuitHash + index) % 5) - 2;
      const predictedPos = Math.max(1, Math.min(20, d.base + variance));
      const actualVariance = ((circuitHash * 2 + index) % 7) - 3;
      const actualPos = Math.max(1, Math.min(20, d.base + actualVariance));
      
      const maxProb = 35;
      const winProb = Math.max(0.1, maxProb - (predictedPos - 1) * 1.8 + Math.random() * 2);

      return {
        gridPosition: index + 1,
        driver: d.driver,
        team: d.team,
        prediction: predictedPos,
        actual: actualPos,
        winningProb: predictedPos <= 3 ? `${winProb.toFixed(1)}%` : predictedPos <= 10 ? `${(winProb * 0.3).toFixed(1)}%` : "-",
        teamColor: teamColors[d.team as keyof typeof teamColors] || "#888888"
      };
    }).sort((a, b) => a.prediction - b.prediction);
  }

  isUsingMockData(): boolean {
    return this.useMockData;
  }

  setApiUrl(url: string): void {
    this.baseUrl = url;
    this.useMockData = false;
    console.log("API URL updated to:", url);
  }
}

export const f1ApiService = new F1ApiService();

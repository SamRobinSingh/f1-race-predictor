/**
 * Race Visualization API Service
 * Connects to FastF1-based backend for race simulation data
 */

const API_BASE_URL = import.meta.env.VITE_F1_API_URL || "http://localhost:8000";

export interface DriverData {
  x: (number | null)[];
  y: (number | null)[];
  speed: number[];
  color: string;
  name: string;
  team: string;
  compound: string;
}

export interface RaceData {
  event_name: string;
  track_map: {
    x: (number | null)[];
    y: (number | null)[];
  };
  timeline: number[];
  drivers: Record<string, DriverData>;
}

export interface CommentaryRequest {
  time_val: number;
  leader_name: string;
  leader_team: string;
  leader_compound: string;
  leader_speed: number;
  chaser_name: string;
  gap: number;
}

class RaceVisualizationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setApiUrl(url: string): void {
    this.baseUrl = url;
  }

  async loadRace(year: number, circuit: string): Promise<RaceData> {
    const response = await fetch(`${this.baseUrl}/load_race`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, circuit })
    });

    if (!response.ok) {
      throw new Error(`Failed to load race: ${response.status}`);
    }

    return response.json();
  }

  async getCommentary(request: CommentaryRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/commentary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        return "Commentary unavailable...";
      }

      const data = await response.json();
      return data.commentary;
    } catch {
      return "Commentary system offline...";
    }
  }
}

export const raceVisualizationService = new RaceVisualizationService();

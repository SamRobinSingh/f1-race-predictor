// Mock F1 data for demonstration
export const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

export const circuits: Record<number, string[]> = {
  2025: [
    "Bahrain International Circuit",
    "Jeddah Corniche Circuit",
    "Albert Park Circuit",
    "Suzuka Circuit",
    "Shanghai International Circuit",
    "Miami International Autodrome",
    "Imola Circuit",
    "Monaco Circuit",
    "Circuit de Barcelona-Catalunya",
    "Circuit Gilles Villeneuve",
    "Red Bull Ring",
    "Silverstone Circuit",
    "Hungaroring",
    "Spa-Francorchamps",
    "Zandvoort Circuit",
    "Monza Circuit",
    "Marina Bay Street Circuit",
    "Circuit of the Americas",
    "Autodromo Hermanos Rodriguez",
    "Interlagos Circuit",
    "Las Vegas Strip Circuit",
    "Yas Marina Circuit",
  ],
  2024: [
    "Bahrain International Circuit",
    "Jeddah Corniche Circuit",
    "Albert Park Circuit",
    "Suzuka Circuit",
    "Shanghai International Circuit",
    "Miami International Autodrome",
    "Imola Circuit",
    "Monaco Circuit",
    "Circuit Gilles Villeneuve",
    "Circuit de Barcelona-Catalunya",
    "Red Bull Ring",
    "Silverstone Circuit",
    "Hungaroring",
    "Spa-Francorchamps",
    "Zandvoort Circuit",
    "Monza Circuit",
    "Marina Bay Street Circuit",
    "Circuit of the Americas",
    "Autodromo Hermanos Rodriguez",
    "Interlagos Circuit",
    "Las Vegas Strip Circuit",
    "Yas Marina Circuit",
  ],
  2023: [
    "Bahrain International Circuit",
    "Jeddah Corniche Circuit",
    "Albert Park Circuit",
    "Miami International Autodrome",
    "Monaco Circuit",
    "Circuit de Barcelona-Catalunya",
    "Circuit Gilles Villeneuve",
    "Red Bull Ring",
    "Silverstone Circuit",
    "Hungaroring",
    "Spa-Francorchamps",
    "Zandvoort Circuit",
    "Monza Circuit",
    "Marina Bay Street Circuit",
    "Suzuka Circuit",
    "Qatar International Circuit",
    "Circuit of the Americas",
    "Autodromo Hermanos Rodriguez",
    "Interlagos Circuit",
    "Las Vegas Strip Circuit",
    "Yas Marina Circuit",
  ],
  2022: [
    "Bahrain International Circuit",
    "Jeddah Corniche Circuit",
    "Albert Park Circuit",
    "Imola Circuit",
    "Miami International Autodrome",
    "Circuit de Barcelona-Catalunya",
    "Monaco Circuit",
    "Baku City Circuit",
    "Circuit Gilles Villeneuve",
    "Silverstone Circuit",
    "Red Bull Ring",
    "Circuit Paul Ricard",
    "Hungaroring",
    "Spa-Francorchamps",
    "Zandvoort Circuit",
    "Monza Circuit",
    "Marina Bay Street Circuit",
    "Suzuka Circuit",
    "Circuit of the Americas",
    "Autodromo Hermanos Rodriguez",
    "Interlagos Circuit",
    "Yas Marina Circuit",
  ],
  2021: ["Bahrain International Circuit", "Imola Circuit", "Portimao Circuit", "Circuit de Barcelona-Catalunya"],
  2020: ["Red Bull Ring", "Silverstone Circuit", "Hungaroring", "Circuit de Barcelona-Catalunya"],
  2019: ["Albert Park Circuit", "Bahrain International Circuit", "Shanghai International Circuit", "Baku City Circuit"],
  2018: ["Albert Park Circuit", "Bahrain International Circuit", "Shanghai International Circuit", "Baku City Circuit"],
};

export interface PredictionResult {
  gridPosition: number;
  driver: string;
  team: string;
  prediction: number;
  actual: number;
  winningProb: string;
  teamColor: string;
}

export interface TeamColors {
  [key: string]: string;
}

export const teamColors: TeamColors = {
  "Red Bull Racing": "#3671C6",
  "Ferrari": "#E80020",
  "Mercedes": "#27F4D2",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine": "#FF87BC",
  "Williams": "#64C4FF",
  "AlphaTauri": "#5E8FAA",
  "RB": "#6692FF",
  "Alfa Romeo": "#C92D4B",
  "Haas": "#B6BABD",
  "Kick Sauber": "#52E252",
};

// Generate mock prediction data based on year and circuit
export const generatePredictions = (year: number, circuit: string): PredictionResult[] => {
  const drivers2024 = [
    { driver: "VER", team: "Red Bull Racing", base: 1 },
    { driver: "PER", team: "Red Bull Racing", base: 4 },
    { driver: "LEC", team: "Ferrari", base: 3 },
    { driver: "SAI", team: "Ferrari", base: 5 },
    { driver: "HAM", team: "Mercedes", base: 6 },
    { driver: "RUS", team: "Mercedes", base: 7 },
    { driver: "NOR", team: "McLaren", base: 2 },
    { driver: "PIA", team: "McLaren", base: 8 },
    { driver: "ALO", team: "Aston Martin", base: 9 },
    { driver: "STR", team: "Aston Martin", base: 14 },
    { driver: "GAS", team: "Alpine", base: 11 },
    { driver: "OCO", team: "Alpine", base: 12 },
    { driver: "ALB", team: "Williams", base: 13 },
    { driver: "SAR", team: "Williams", base: 18 },
    { driver: "TSU", team: "RB", base: 10 },
    { driver: "RIC", team: "RB", base: 15 },
    { driver: "BOT", team: "Kick Sauber", base: 16 },
    { driver: "ZHO", team: "Kick Sauber", base: 17 },
    { driver: "MAG", team: "Haas", base: 19 },
    { driver: "HUL", team: "Haas", base: 20 },
  ];

  // Create some variance based on circuit name hash
  const circuitHash = circuit.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  return drivers2024
    .map((d, idx) => {
      const variance = ((circuitHash + idx * 7) % 5) - 2;
      const gridPos = Math.max(1, Math.min(20, d.base + variance));
      const prediction = Math.max(1, Math.min(20, d.base + ((circuitHash + idx * 3) % 3) - 1));
      const actual = Math.max(1, Math.min(20, prediction + ((circuitHash + idx * 11) % 5) - 2));
      
      // Calculate winning probability (higher for better predicted positions)
      const probBase = Math.max(0, 100 - (prediction - 1) * 10);
      const prob = prediction <= 3 ? `${(probBase * (0.8 + Math.random() * 0.4)).toFixed(1)}%` : 
                   prediction <= 10 ? `${(probBase * 0.3).toFixed(1)}%` : "-";
      
      return {
        gridPosition: gridPos,
        driver: d.driver,
        team: d.team,
        prediction,
        actual,
        winningProb: prob,
        teamColor: teamColors[d.team] || "#666666",
      };
    })
    .sort((a, b) => a.prediction - b.prediction);
};

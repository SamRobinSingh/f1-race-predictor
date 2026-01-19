import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, History, Layers, Info, AlertTriangle, WifiOff } from "lucide-react";
import RaceSelector from "@/components/RaceSelector";
import WinnerCards from "@/components/WinnerCards";
import TopThreePodium from "@/components/TopThreePodium";
import PredictionTable from "@/components/PredictionTable";
import { ApiConnectionStatus } from "@/components/ApiConnectionStatus";
import { PredictionResult } from "@/data/f1MockData";
import { f1ApiService, ConnectionStatus, ModelType } from "@/services/f1ApiService";

interface ModelConfig {
  type: ModelType;
  title: string;
  subtitle: string;
  icon: typeof Layers;
  yearRange: [number, number];
  description: string;
  features: string[];
  color: string;
}

const modelConfigs: Record<ModelType, ModelConfig> = {
  hybrid: {
    type: "hybrid",
    title: "Hybrid Oracle",
    subtitle: "LSTM + Telemetry Combined Analysis",
    icon: Layers,
    yearRange: [2018, 2025],
    description:
      "Our most accurate predictor combining historical patterns with real-time telemetry data for comprehensive race predictions.",
    features: [
      "LSTM Neural Network",
      "Telemetry Analysis",
      "Historical Patterns",
      "Weather Integration",
    ],
    color: "hsl(var(--f1-red))",
  },
  telemetry: {
    type: "telemetry",
    title: "Telemetry Model",
    subtitle: "Real-time Telemetry Analysis",
    icon: Zap,
    yearRange: [2023, 2025],
    description:
      "Specialized model analyzing live car telemetry data including speed, tire performance, and race pace for probability-based predictions.",
    features: [
      "Live Telemetry",
      "Tire Analysis",
      "Race Pace",
      "Win Probability",
    ],
    color: "hsl(var(--f1-gold))",
  },
  historical: {
    type: "historical",
    title: "Historical Model",
    subtitle: "LSTM Pattern Recognition",
    icon: History,
    yearRange: [2018, 2025],
    description:
      "Deep learning model trained on 7+ seasons of F1 data, recognizing driver and team performance patterns across different circuits.",
    features: [
      "7+ Seasons Data",
      "Driver Momentum",
      "Team Performance",
      "Circuit History",
    ],
    color: "hsl(var(--accent))",
  },
};

interface PredictorPageProps {
  modelType: ModelType;
}

export function PredictorPage({ modelType }: PredictorPageProps) {
  const config = modelConfigs[modelType];
  const Icon = config.icon;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    f1ApiService.getConnectionStatus()
  );
  const [years, setYears] = useState<number[]>([]);
  const [circuits, setCircuits] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to connection status changes
  useEffect(() => {
    return f1ApiService.onStatusChange(setConnectionStatus);
  }, []);

  // Fetch years when connected
  useEffect(() => {
    if (connectionStatus.connected) {
      f1ApiService
        .getYears(modelType)
        .then(setYears)
        .catch((err) => setError(err.message));
    }
  }, [connectionStatus.connected, modelType]);

  // Fetch circuits when year changes
  useEffect(() => {
    if (connectionStatus.connected && selectedYear) {
      f1ApiService
        .getCircuits(selectedYear)
        .then(setCircuits)
        .catch((err) => setError(err.message));
    }
  }, [connectionStatus.connected, selectedYear]);

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    setSelectedCircuit(null);
    setPredictions(null);
    setError(null);
  }, []);

  const handleCircuitChange = useCallback((circuit: string) => {
    setSelectedCircuit(circuit);
    setPredictions(null);
    setError(null);
  }, []);

  const handlePredict = useCallback(async () => {
    if (!selectedYear || !selectedCircuit) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await f1ApiService.predict(modelType, selectedYear, selectedCircuit);
      setPredictions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
      setPredictions(null);
    } finally {
      setIsLoading(false);
    }
  }, [modelType, selectedYear, selectedCircuit]);

  const aiWinner = predictions?.[0];
  const actualWinner = predictions?.find((p) => p.actual === 1);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Model Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${config.color} 0%, transparent 50%)`,
          }}
        />

        <div className="relative p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-8 h-8" style={{ color: config.color }} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-racing text-2xl tracking-wide text-foreground">
                  {config.title}
                </h1>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                  }}
                >
                  {config.yearRange[0]} - {config.yearRange[1]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {config.subtitle}
              </p>
              <p className="text-sm text-muted-foreground/80 max-w-2xl">
                {config.description}
              </p>
            </div>

            {/* API Status + Features */}
            <div className="flex flex-col gap-3">
              <ApiConnectionStatus />
              <div className="flex flex-wrap gap-2 md:max-w-xs">
                {config.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Not Connected State */}
      {!connectionStatus.connected && !connectionStatus.checking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center"
        >
          <WifiOff className="w-16 h-16 mx-auto mb-4 text-red-400/60" />
          <h3 className="font-racing text-xl text-red-400 mb-2">
            Python Backend Not Connected
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Deploy your Python FastAPI backend and configure the connection using
            the settings button above.
          </p>
          <div className="p-4 rounded-lg bg-background/50 border border-border/50 max-w-lg mx-auto text-left">
            <h4 className="text-sm font-medium mb-2">Quick Start:</h4>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
{`cd python-backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000`}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Checking Connection */}
      {connectionStatus.checking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Connecting to Python backend...</p>
        </motion.div>
      )}

      {/* Connected - Show Race Selector */}
      {connectionStatus.connected && (
        <>
          <RaceSelector
            years={years}
            circuits={circuits}
            selectedYear={selectedYear}
            selectedCircuit={selectedCircuit}
            onYearChange={handleYearChange}
            onCircuitChange={handleCircuitChange}
            onPredict={handlePredict}
            isLoading={isLoading}
          />

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-yellow-400">{error}</p>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {predictions && aiWinner && actualWinner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <WinnerCards
                  aiWinner={aiWinner.driver}
                  aiWinnerTeam={aiWinner.team}
                  actualWinner={actualWinner.driver}
                  actualWinnerTeam={actualWinner.team}
                />

                <TopThreePodium predictions={predictions} />

                <PredictionTable
                  data={predictions}
                  year={selectedYear!}
                  circuit={selectedCircuit!}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!predictions && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Icon className="w-10 h-10" style={{ color: config.color }} />
              </div>
              <h3 className="font-racing text-xl text-muted-foreground mb-2">
                Select Race Details
              </h3>
              <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                Choose a season year ({config.yearRange[0]}-{config.yearRange[1]}) and
                circuit to generate predictions using the {config.title}.
              </p>

              <div className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground/60 bg-secondary/50 px-4 py-2 rounded-full">
                <Info className="w-3 h-3" />
                <span>
                  {modelType === "telemetry"
                    ? "Uses real-time car telemetry for win probability"
                    : modelType === "historical"
                    ? "Analyzes historical patterns & driver momentum"
                    : "Combines both models for best accuracy"}
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

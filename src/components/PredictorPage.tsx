import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, History, Layers, Info } from "lucide-react";
import RaceSelector from "@/components/RaceSelector";
import WinnerCards from "@/components/WinnerCards";
import PredictionTable from "@/components/PredictionTable";
import {
  years as allYears,
  circuits as circuitData,
  generatePredictions,
  PredictionResult,
} from "@/data/f1MockData";

export type ModelType = "hybrid" | "telemetry" | "historical";

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

  // Filter years based on model's year range
  const years = allYears.filter(
    (y) => y >= config.yearRange[0] && y <= config.yearRange[1]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const availableCircuits = selectedYear ? circuitData[selectedYear] || [] : [];

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    setSelectedCircuit(null);
    setPredictions(null);
  }, []);

  const handleCircuitChange = useCallback((circuit: string) => {
    setSelectedCircuit(circuit);
    setPredictions(null);
  }, []);

  const handlePredict = useCallback(() => {
    if (!selectedYear || !selectedCircuit) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const results = generatePredictions(selectedYear, selectedCircuit);
      setPredictions(results);
      setIsLoading(false);
    }, 1500);
  }, [selectedYear, selectedCircuit]);

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

            {/* Features */}
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
      </motion.div>

      {/* Race Selector */}
      <RaceSelector
        years={years}
        circuits={availableCircuits}
        selectedYear={selectedYear}
        selectedCircuit={selectedCircuit}
        onYearChange={handleYearChange}
        onCircuitChange={handleCircuitChange}
        onPredict={handlePredict}
        isLoading={isLoading}
      />

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

            <PredictionTable
              data={predictions}
              year={selectedYear!}
              circuit={selectedCircuit!}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!predictions && !isLoading && (
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

          {/* Model info hint */}
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
    </div>
  );
}

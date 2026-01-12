import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RaceSelector from "@/components/RaceSelector";
import WinnerCards from "@/components/WinnerCards";
import PredictionTable from "@/components/PredictionTable";
import { circuits as circuitData, generatePredictions, PredictionResult } from "@/data/f1MockData";

interface PredictionPageProps {
  modelName: string;
  modelDescription: string;
  years: number[];
  icon: React.ReactNode;
}

const PredictionPage = ({ modelName, modelDescription, years, icon }: PredictionPageProps) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
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
  const actualWinner = predictions?.find(p => p.actual === 1);

  return (
    <div className="space-y-8">
      {/* Model Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border card-shadow"
      >
        <div className="p-3 rounded-xl racing-gradient racing-shadow">
          {icon}
        </div>
        <div>
          <h1 className="font-racing text-2xl md:text-3xl font-bold tracking-wide">
            {modelName}
          </h1>
          <p className="text-sm text-muted-foreground">{modelDescription}</p>
        </div>
      </motion.div>

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

      <AnimatePresence mode="wait">
        {predictions && aiWinner && actualWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
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

      {/* Empty state */}
      {!predictions && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-5xl">🏎️</span>
          </div>
          <h3 className="font-racing text-xl text-muted-foreground mb-2">
            Select Race Details
          </h3>
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
            Choose a season year and circuit to generate AI-powered race predictions 
            using the {modelName}.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PredictionPage;

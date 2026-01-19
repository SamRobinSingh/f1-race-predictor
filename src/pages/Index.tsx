import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import F1Header from "@/components/F1Header";
import RaceSelector from "@/components/RaceSelector";
import WinnerCards from "@/components/WinnerCards";
import PredictionTable from "@/components/PredictionTable";
import { years, circuits as circuitData, generatePredictions, PredictionResult } from "@/data/f1MockData";

const Index = () => {
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[128px] opacity-20 racing-gradient" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-accent" />
      </div>

      {/* Carbon texture overlay */}
      <div className="fixed inset-0 carbon-texture opacity-30 pointer-events-none" />

      <div className="relative z-10">
        <F1Header />

        <main className="container mx-auto px-4 py-8 space-y-8">
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
                using our hybrid LSTM and telemetry analysis models.
              </p>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <span className="font-racing tracking-wide">F1 ORACLE</span>
              <span>Powered by LSTM Neural Network & Telemetry Analysis</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

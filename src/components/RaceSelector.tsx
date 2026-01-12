import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Gauge, MapPin, Zap } from "lucide-react";

interface RaceSelectorProps {
  years: number[];
  circuits: string[];
  selectedYear: number | null;
  selectedCircuit: string | null;
  onYearChange: (year: number) => void;
  onCircuitChange: (circuit: string) => void;
  onPredict: () => void;
  isLoading: boolean;
}

const RaceSelector = ({
  years,
  circuits,
  selectedYear,
  selectedCircuit,
  onYearChange,
  onCircuitChange,
  onPredict,
  isLoading,
}: RaceSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-card border-glow rounded-2xl p-6 md:p-8 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg racing-gradient">
            <Gauge className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="font-racing text-xl md:text-2xl font-semibold tracking-wide">
            Race Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Year Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Season Year
            </label>
            <Select
              value={selectedYear?.toString()}
              onValueChange={(value) => onYearChange(parseInt(value))}
            >
              <SelectTrigger className="h-14 bg-secondary border-border hover:border-primary/50 transition-colors text-lg font-racing">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className="font-racing text-lg hover:bg-primary/10 focus:bg-primary/10"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Circuit Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Circuit
            </label>
            <Select
              value={selectedCircuit || ""}
              onValueChange={onCircuitChange}
              disabled={!selectedYear}
            >
              <SelectTrigger className="h-14 bg-secondary border-border hover:border-primary/50 transition-colors text-base">
                <SelectValue placeholder={selectedYear ? "Select circuit" : "Select year first"} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-[300px]">
                {circuits.map((circuit) => (
                  <SelectItem
                    key={circuit}
                    value={circuit}
                    className="hover:bg-primary/10 focus:bg-primary/10"
                  >
                    {circuit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Predict Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onPredict}
            disabled={!selectedYear || !selectedCircuit || isLoading}
            className="w-full h-14 text-lg font-racing tracking-wider racing-gradient hover:opacity-90 disabled:opacity-50 transition-all racing-shadow"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Processing...
              </span>
            ) : (
              "🚀 Generate Prediction"
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RaceSelector;

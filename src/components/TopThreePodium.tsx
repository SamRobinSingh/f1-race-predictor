import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { PredictionResult } from "@/data/f1MockData";

interface TopThreePodiumProps {
  predictions: PredictionResult[];
}

const TopThreePodium = ({ predictions }: TopThreePodiumProps) => {
  const top3 = predictions.slice(0, 3);
  
  if (top3.length < 3) return null;

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd for visual layout
  const podiumHeights = ["h-28", "h-36", "h-20"];
  const positions = ["2nd", "1st", "3rd"];
  const positionColors = ["#C0C0C0", "#FFD700", "#CD7F32"]; // Silver, Gold, Bronze
  const delays = [0.2, 0.1, 0.3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="text-center mb-6">
        <h2 className="font-racing text-xl text-foreground flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-f1-gold" />
          AI Predicted Podium
          <Trophy className="w-5 h-5 text-f1-gold" />
        </h2>
      </div>

      <div className="flex items-end justify-center gap-4 md:gap-8">
        {podiumOrder.map((driver, index) => {
          const actualPosition = index === 0 ? 1 : index === 1 ? 0 : 2;
          const originalDriver = top3[actualPosition];
          
          return (
            <motion.div
              key={originalDriver.driver}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delays[index], type: "spring", stiffness: 100 }}
              className="flex flex-col items-center"
            >
              {/* Driver Card */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: delays[index] + 0.2 }}
                className="relative mb-3"
              >
                {/* Driver Avatar Circle */}
                <div
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-racing text-xl md:text-2xl font-bold border-4 shadow-lg"
                  style={{
                    backgroundColor: `${originalDriver.teamColor}20`,
                    borderColor: originalDriver.teamColor,
                    color: originalDriver.teamColor,
                  }}
                >
                  {originalDriver.driver.substring(0, 3)}
                  
                  {/* Position Badge */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                    style={{
                      backgroundColor: positionColors[actualPosition],
                      color: actualPosition === 1 ? "#000" : "#fff",
                    }}
                  >
                    {actualPosition + 1}
                  </div>
                </div>

                {/* Trophy for 1st place */}
                {actualPosition === 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2"
                  >
                    <Trophy className="w-8 h-8 text-f1-gold drop-shadow-lg" />
                  </motion.div>
                )}
              </motion.div>

              {/* Driver Info */}
              <div className="text-center mb-2">
                <p className="font-racing text-sm md:text-base font-bold text-foreground">
                  {originalDriver.driver}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[100px]">
                  {originalDriver.team}
                </p>
              </div>

              {/* Win Probability */}
              <div className="mb-2 text-center">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${originalDriver.teamColor}20`,
                    color: originalDriver.teamColor,
                  }}
                >
                  {originalDriver.winningProb}
                </span>
              </div>

              {/* Podium Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: delays[index] + 0.1, duration: 0.4 }}
                className={`w-20 md:w-28 ${podiumHeights[index]} rounded-t-lg flex items-start justify-center pt-3 relative overflow-hidden`}
                style={{
                  background: `linear-gradient(180deg, ${originalDriver.teamColor}40 0%, ${originalDriver.teamColor}20 100%)`,
                  borderTop: `3px solid ${originalDriver.teamColor}`,
                }}
              >
                <span
                  className="font-racing text-lg md:text-2xl font-bold"
                  style={{ color: positionColors[actualPosition] }}
                >
                  {positions[index]}
                </span>
                
                {/* Decorative stripes */}
                <div className="absolute bottom-0 left-0 right-0 h-2 opacity-30" 
                  style={{ backgroundColor: originalDriver.teamColor }} 
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Actual Results Comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-center"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-4 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-f1-gold" />
            <span className="text-xs text-muted-foreground">Actual Results:</span>
          </div>
          {predictions
            .filter((p) => p.actual >= 1 && p.actual <= 3)
            .sort((a, b) => a.actual - b.actual)
            .map((driver) => (
              <span
                key={driver.driver}
                className="text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: `${driver.teamColor}20`,
                  color: driver.teamColor,
                }}
              >
                P{driver.actual}: {driver.driver}
              </span>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TopThreePodium;

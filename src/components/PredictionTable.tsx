import { motion } from "framer-motion";
import { PredictionResult } from "@/data/f1MockData";
import { ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react";

interface PredictionTableProps {
  data: PredictionResult[];
  year: number;
  circuit: string;
}

const PredictionTable = ({ data, year, circuit }: PredictionTableProps) => {
  const getPositionChange = (grid: number, actual: number) => {
    const diff = grid - actual;
    if (diff > 0) return { icon: ArrowUp, color: "text-green-400", value: `+${diff}` };
    if (diff < 0) return { icon: ArrowDown, color: "text-red-400", value: diff.toString() };
    return { icon: Minus, color: "text-muted-foreground", value: "0" };
  };

  const getPodiumStyle = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-f1-podium-1/20 to-transparent border-l-4 border-l-f1-podium-1";
    if (position === 2) return "bg-gradient-to-r from-f1-podium-2/10 to-transparent border-l-4 border-l-f1-podium-2";
    if (position === 3) return "bg-gradient-to-r from-f1-podium-3/20 to-transparent border-l-4 border-l-f1-podium-3";
    return "";
  };

  const getPodiumBadge = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full"
    >
      <div className="bg-card border-glow rounded-2xl overflow-hidden card-shadow">
        {/* Table Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg racing-gradient">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-racing text-xl md:text-2xl font-semibold tracking-wide">
                  Race Predictions
                </h2>
                <p className="text-sm text-muted-foreground">
                  {year} • {circuit}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                {data.filter(d => d.prediction === d.actual).length} Correct
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                {data.length} Drivers
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Grid
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Team
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prediction
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Win Prob
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const change = getPositionChange(row.gridPosition, row.actual);
                const ChangeIcon = change.icon;
                const isCorrect = row.prediction === row.actual;
                
                return (
                  <motion.tr
                    key={row.driver}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${getPodiumStyle(row.prediction)}`}
                  >
                    {/* Grid Position */}
                    <td className="px-4 py-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-racing font-bold text-lg">
                        {row.gridPosition}
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-racing font-bold text-sm"
                          style={{ 
                            backgroundColor: `${row.teamColor}20`,
                            color: row.teamColor,
                            border: `2px solid ${row.teamColor}`,
                          }}
                        >
                          {row.driver.slice(0, 3)}
                        </div>
                        <div className="sm:hidden">
                          <span className="font-semibold">{row.driver}</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="font-semibold">{row.driver}</span>
                          <span className="text-muted-foreground text-xs block sm:hidden">{row.team}</span>
                        </div>
                        {getPodiumBadge(row.prediction) && (
                          <span className="text-xl">{getPodiumBadge(row.prediction)}</span>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: row.teamColor }}
                        />
                        <span className="text-sm text-muted-foreground">{row.team}</span>
                      </div>
                    </td>

                    {/* Prediction */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-racing font-bold text-lg ${
                        isCorrect 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                          : 'bg-primary/20 text-primary border border-primary/50'
                      }`}>
                        {row.prediction}
                      </span>
                    </td>

                    {/* Actual */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary font-racing font-bold text-lg">
                        {row.actual}
                      </span>
                    </td>

                    {/* Win Probability */}
                    <td className="px-4 py-4 text-center hidden md:table-cell">
                      <span className={`text-sm font-medium ${
                        row.winningProb !== "-" ? "text-accent" : "text-muted-foreground"
                      }`}>
                        {row.winningProb}
                      </span>
                    </td>

                    {/* Position Change */}
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 ${change.color}`}>
                        <ChangeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{change.value}</span>
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionTable;

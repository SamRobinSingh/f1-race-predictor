import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gauge, TrendingUp } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  team: string;
  color: string;
  compound: string;
  speed: number;
}

interface DriverStandingsProps {
  drivers: Driver[];
}

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: "#FF3333",
  MEDIUM: "#FFD700",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#39B54A",
  WET: "#0066FF",
  UNKNOWN: "#888888"
};

export default function DriverStandings({ drivers }: DriverStandingsProps) {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-racing text-lg tracking-wide">Live Standings</h3>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)] pr-2">
        <div className="space-y-2">
          {drivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="relative"
            >
              <div
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30 hover:bg-secondary/80 transition-colors"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: driver.color
                }}
              >
                {/* Position */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {index + 1}
                </div>

                {/* Driver Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {driver.name}
                    </span>
                    {/* Compound indicator */}
                    <div
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: COMPOUND_COLORS[driver.compound] || COMPOUND_COLORS.UNKNOWN }}
                      title={driver.compound}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground truncate block">
                    {driver.team}
                  </span>
                </div>

                {/* Speed */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Gauge className="w-3.5 h-3.5" />
                  <span className="font-mono">{driver.speed}</span>
                  <span className="text-[10px]">km/h</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Compound Legend */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground mb-2">Tyre Compounds</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(COMPOUND_COLORS).filter(([k]) => k !== "UNKNOWN").map(([compound, color]) => (
            <div key={compound} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-muted-foreground">{compound}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

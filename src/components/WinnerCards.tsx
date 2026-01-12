import { motion } from "framer-motion";
import { Bot, Flag, Trophy } from "lucide-react";
import { teamColors } from "@/data/f1MockData";

interface WinnerCardsProps {
  aiWinner: string;
  aiWinnerTeam: string;
  actualWinner: string;
  actualWinnerTeam: string;
}

const WinnerCards = ({ aiWinner, aiWinnerTeam, actualWinner, actualWinnerTeam }: WinnerCardsProps) => {
  const aiTeamColor = teamColors[aiWinnerTeam] || "#E10600";
  const actualTeamColor = teamColors[actualWinnerTeam] || "#27F4D2";
  const isCorrect = aiWinner === actualWinner;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* AI Prediction */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl p-6 border-glow card-shadow"
        style={{
          background: `linear-gradient(135deg, ${aiTeamColor}15 0%, hsl(var(--card)) 50%)`,
        }}
      >
        <div 
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: aiTeamColor }}
        />
        
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${aiTeamColor}30` }}
          >
            <Bot className="w-5 h-5" style={{ color: aiTeamColor }} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">AI Prediction</span>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center font-racing text-2xl font-bold"
            style={{ 
              backgroundColor: `${aiTeamColor}20`,
              color: aiTeamColor,
              border: `2px solid ${aiTeamColor}`,
            }}
          >
            {aiWinner}
          </div>
          <div>
            <h3 className="text-2xl font-racing font-bold">{aiWinner}</h3>
            <p className="text-muted-foreground text-sm">{aiWinnerTeam}</p>
          </div>
        </div>

        {isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute top-4 right-4"
          >
            <Trophy className="w-8 h-8 text-f1-gold" />
          </motion.div>
        )}
      </motion.div>

      {/* Actual Result */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-6 border-glow card-shadow"
        style={{
          background: `linear-gradient(135deg, ${actualTeamColor}15 0%, hsl(var(--card)) 50%)`,
        }}
      >
        <div 
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: actualTeamColor }}
        />
        
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${actualTeamColor}30` }}
          >
            <Flag className="w-5 h-5" style={{ color: actualTeamColor }} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Actual Winner</span>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center font-racing text-2xl font-bold"
            style={{ 
              backgroundColor: `${actualTeamColor}20`,
              color: actualTeamColor,
              border: `2px solid ${actualTeamColor}`,
            }}
          >
            {actualWinner}
          </div>
          <div>
            <h3 className="text-2xl font-racing font-bold">{actualWinner}</h3>
            <p className="text-muted-foreground text-sm">{actualWinnerTeam}</p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="absolute top-4 right-4"
        >
          <span className="text-2xl">🏁</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WinnerCards;

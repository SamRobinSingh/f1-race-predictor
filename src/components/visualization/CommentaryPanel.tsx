import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Radio, Volume2 } from "lucide-react";

interface CommentaryPanelProps {
  commentary: string[];
}

export default function CommentaryPanel({ commentary }: CommentaryPanelProps) {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Radio className="w-5 h-5 text-primary" />
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <h3 className="font-racing text-lg tracking-wide">Live Commentary</h3>
        <Volume2 className="w-4 h-4 text-muted-foreground ml-auto" />
      </div>

      <div className="min-h-[80px] space-y-2">
        <AnimatePresence mode="popLayout">
          {commentary.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground italic"
            >
              Commentary will appear here as the race progresses...
            </motion.p>
          ) : (
            commentary.map((text, index) => (
              <motion.div
                key={`${index}-${text.slice(0, 20)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg text-sm ${
                  index === commentary.length - 1
                    ? 'bg-primary/10 border border-primary/30 text-foreground'
                    : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs mt-0.5">
                    {index === commentary.length - 1 ? '🎙️' : '📻'}
                  </span>
                  <p className="leading-relaxed">{text}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

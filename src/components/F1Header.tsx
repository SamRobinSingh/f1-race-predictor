import { motion } from "framer-motion";

const F1Header = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 glow-effect opacity-50" />
      
      {/* Checkered pattern overlay */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
        <div 
          className="w-full h-full animate-checkered"
          style={{
            backgroundImage: `
              linear-gradient(45deg, hsl(var(--foreground)) 25%, transparent 25%),
              linear-gradient(-45deg, hsl(var(--foreground)) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, hsl(var(--foreground)) 75%),
              linear-gradient(-45deg, transparent 75%, hsl(var(--foreground)) 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-4"
          >
            <h1 className="font-racing text-4xl md:text-6xl lg:text-7xl font-black tracking-wider">
              <span className="text-foreground">F1</span>
              <span className="text-gradient-racing ml-2">ORACLE</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl font-light tracking-wide"
          >
            Hybrid AI Race Prediction System
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-6 mx-auto w-32 h-1 racing-gradient rounded-full"
          />

          {/* Tech badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-6 flex justify-center gap-4 flex-wrap"
          >
            <span className="px-3 py-1 text-xs font-medium bg-secondary rounded-full border border-border">
              LSTM Neural Network
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-secondary rounded-full border border-border">
              Telemetry Analysis
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-secondary rounded-full border border-border">
              Historical Data
            </span>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default F1Header;

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Driver {
  id: string;
  name: string;
  team: string;
  color: string;
  x?: number;
  y?: number;
  speed: number;
}

interface TrackMapProps {
  trackData: {
    x: (number | null)[];
    y: (number | null)[];
  };
  drivers: Driver[];
}

export default function TrackMap({ trackData, drivers }: TrackMapProps) {
  // Calculate track bounds and create SVG path
  const { path, viewBox, scale } = useMemo(() => {
    const validPoints = trackData.x
      .map((x, i) => ({ x, y: trackData.y[i] }))
      .filter(p => p.x !== null && p.y !== null) as { x: number; y: number }[];

    if (validPoints.length === 0) {
      return { path: "", viewBox: "0 0 100 100", scale: { x: 0, y: 0, width: 100, height: 100 } };
    }

    const xs = validPoints.map(p => p.x);
    const ys = validPoints.map(p => p.y);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    // Create SVG path
    const pathData = validPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - minX + padding} ${p.y - minY + padding}`)
      .join(' ') + ' Z';

    return {
      path: pathData,
      viewBox: `0 0 ${width} ${height}`,
      scale: { x: minX - padding, y: minY - padding, width, height }
    };
  }, [trackData]);

  // Transform driver positions to SVG coordinates
  const driverPositions = useMemo(() => {
    return drivers
      .filter(d => d.x !== undefined && d.y !== undefined)
      .map(d => ({
        ...d,
        svgX: (d.x || 0) - scale.x,
        svgY: (d.y || 0) - scale.y
      }));
  }, [drivers, scale]);

  return (
    <div className="relative w-full aspect-[16/10] bg-secondary/30 rounded-lg overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Track path - glow effect */}
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="blur(8px)"
        />
        
        {/* Track path - main line */}
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.5)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track path - center line */}
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--background))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 20"
        />

        {/* Driver markers */}
        {driverPositions.map((driver, index) => (
          <g key={driver.id}>
            {/* Glow effect */}
            <motion.circle
              cx={driver.svgX}
              cy={driver.svgY}
              r="20"
              fill={driver.color}
              opacity={0.4}
              filter="blur(6px)"
              animate={{ cx: driver.svgX, cy: driver.svgY }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            />
            
            {/* Main marker */}
            <motion.circle
              cx={driver.svgX}
              cy={driver.svgY}
              r="12"
              fill={driver.color}
              stroke="white"
              strokeWidth="2"
              animate={{ cx: driver.svgX, cy: driver.svgY }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            />
            
            {/* Position number (for top 3) */}
            {index < 3 && (
              <motion.text
                x={driver.svgX}
                y={driver.svgY + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                animate={{ x: driver.svgX, y: driver.svgY + 4 }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
              >
                {index + 1}
              </motion.text>
            )}
            
            {/* Driver name label */}
            <motion.g
              animate={{ x: driver.svgX + 18, y: driver.svgY - 5 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              <rect
                x={0}
                y={-8}
                width="36"
                height="16"
                rx="3"
                fill={driver.color}
                opacity={0.9}
              />
              <text
                x={18}
                y={3}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
              >
                {driver.name}
              </text>
            </motion.g>
          </g>
        ))}
      </svg>

      {/* Speed legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span>● Driver Position</span>
        <span className="text-muted-foreground/50">|</span>
        <span>Top 3 numbered</span>
      </div>
    </div>
  );
}

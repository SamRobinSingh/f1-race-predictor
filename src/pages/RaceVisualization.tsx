import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Loader2, Radio, Gauge, Timer, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { raceVisualizationService, RaceData, DriverData } from "@/services/raceVisualizationService";
import TrackMap from "@/components/visualization/TrackMap";
import DriverStandings from "@/components/visualization/DriverStandings";
import CommentaryPanel from "@/components/visualization/CommentaryPanel";

const AVAILABLE_RACES = [
  { year: 2024, circuit: "Bahrain" },
  { year: 2024, circuit: "Saudi Arabia" },
  { year: 2024, circuit: "Australia" },
  { year: 2024, circuit: "Japan" },
  { year: 2024, circuit: "China" },
  { year: 2024, circuit: "Miami" },
  { year: 2024, circuit: "Monaco" },
  { year: 2024, circuit: "Canada" },
  { year: 2023, circuit: "Bahrain" },
  { year: 2023, circuit: "Saudi Arabia" },
  { year: 2023, circuit: "Australia" },
  { year: 2023, circuit: "Monaco" },
];

export default function RaceVisualization() {
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Commentary
  const [commentary, setCommentary] = useState<string[]>([]);
  const lastCommentaryTime = useRef<number>(-10);

  const handleLoadRace = async () => {
    if (!selectedRace) return;
    
    const [year, circuit] = selectedRace.split("-");
    setLoading(true);
    setError(null);
    setRaceData(null);
    setCurrentTimeIndex(0);
    setIsPlaying(false);
    setCommentary([]);

    try {
      const data = await raceVisualizationService.loadRace(parseInt(year), circuit);
      setRaceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load race data");
    } finally {
      setLoading(false);
    }
  };

  // Get current driver positions and data
  const currentState = useMemo(() => {
    if (!raceData) return null;

    const drivers = Object.entries(raceData.drivers).map(([id, driver]) => {
      const x = driver.x[currentTimeIndex];
      const y = driver.y[currentTimeIndex];
      const speed = driver.speed[currentTimeIndex] || 0;
      
      return {
        id,
        name: driver.name,
        team: driver.team,
        color: driver.color,
        compound: driver.compound,
        x: x !== null ? x : undefined,
        y: y !== null ? y : undefined,
        speed,
        isActive: x !== null && y !== null
      };
    }).filter(d => d.isActive);

    // Sort by track position (approximate using distance from start)
    const sorted = [...drivers].sort((a, b) => {
      // Use x position as simple approximation
      return (b.x || 0) - (a.x || 0);
    });

    return {
      drivers: sorted,
      time: raceData.timeline[currentTimeIndex] || 0,
      leader: sorted[0],
      chaser: sorted[1]
    };
  }, [raceData, currentTimeIndex]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !raceData) return;

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      
      const delta = timestamp - lastTimeRef.current;
      
      // Update every 50ms * playback speed
      if (delta >= 50 / playbackSpeed) {
        lastTimeRef.current = timestamp;
        
        setCurrentTimeIndex(prev => {
          const next = prev + 1;
          if (next >= raceData.timeline.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, raceData, playbackSpeed]);

  // Request commentary periodically
  useEffect(() => {
    if (!currentState || !raceData) return;
    
    const currentTime = currentState.time;
    
    // Request commentary every 30 seconds of race time
    if (currentTime - lastCommentaryTime.current >= 30 && currentState.leader && currentState.chaser) {
      lastCommentaryTime.current = currentTime;
      
      const gap = Math.abs((currentState.leader.x || 0) - (currentState.chaser.x || 0));
      
      raceVisualizationService.getCommentary({
        time_val: currentTime,
        leader_name: currentState.leader.name,
        leader_team: currentState.leader.team,
        leader_compound: currentState.leader.compound,
        leader_speed: currentState.leader.speed,
        chaser_name: currentState.chaser.name,
        gap
      }).then(text => {
        setCommentary(prev => [...prev.slice(-4), text]);
      });
    }
  }, [currentState, raceData]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleReset = () => {
    setCurrentTimeIndex(0);
    setIsPlaying(false);
    lastTimeRef.current = 0;
    lastCommentaryTime.current = -10;
    setCommentary([]);
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentTimeIndex(value[0]);
    lastTimeRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-racing text-2xl lg:text-3xl tracking-wide text-foreground flex items-center gap-3">
              <Flag className="w-7 h-7 text-primary" />
              Race Visualization
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time race simulation with telemetry data & AI commentary
            </p>
          </div>

          {/* Race Selector */}
          <div className="flex items-center gap-3">
            <Select value={selectedRace} onValueChange={setSelectedRace}>
              <SelectTrigger className="w-[220px] bg-card border-border">
                <SelectValue placeholder="Select a race..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_RACES.map(race => (
                  <SelectItem 
                    key={`${race.year}-${race.circuit}`} 
                    value={`${race.year}-${race.circuit}`}
                  >
                    {race.year} {race.circuit} GP
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleLoadRace}
              disabled={!selectedRace || loading}
              className="racing-gradient text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load Race"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4 border-destructive/50 bg-destructive/10">
                <p className="text-destructive text-sm">{error}</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {raceData ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Track Map - Main Area */}
            <div className="xl:col-span-3 space-y-4">
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                {/* Event Title */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-racing text-xl text-foreground">
                    {raceData.event_name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span>{formatTime(currentState?.time || 0)}</span>
                    </div>
                    {currentState?.leader && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">LEADER:</span>
                        <Badge 
                          style={{ backgroundColor: currentState.leader.color }}
                          className="text-white"
                        >
                          {currentState.leader.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Track Visualization */}
                <TrackMap 
                  trackData={raceData.track_map}
                  drivers={currentState?.drivers || []}
                />

                {/* Playback Controls */}
                <div className="mt-4 space-y-3">
                  <Slider
                    value={[currentTimeIndex]}
                    max={raceData.timeline.length - 1}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="w-full"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePlayPause}
                        className="h-10 w-10"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
                        className="h-10 w-10"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Speed:</span>
                      {[0.5, 1, 2, 4].map(speed => (
                        <Button
                          key={speed}
                          variant={playbackSpeed === speed ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPlaybackSpeed(speed)}
                          className="h-8 px-3"
                        >
                          {speed}x
                        </Button>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {currentTimeIndex + 1} / {raceData.timeline.length}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Commentary Panel */}
              <CommentaryPanel commentary={commentary} />
            </div>

            {/* Sidebar - Driver Standings */}
            <div className="xl:col-span-1">
              <DriverStandings drivers={currentState?.drivers || []} />
            </div>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Flag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="font-racing text-xl text-muted-foreground mb-2">
              Select a Race to Visualize
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-md text-center">
              Choose a race from the dropdown above to load telemetry data and 
              watch the race unfold with real-time positions and AI commentary.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

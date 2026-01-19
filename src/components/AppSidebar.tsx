import { Zap, History, Layers, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const predictionModels = [
  {
    title: "Hybrid Oracle",
    subtitle: "LSTM + Telemetry",
    url: "/",
    icon: Layers,
    years: "2018-2025",
    description: "Combined model for best accuracy",
    color: "hsl(var(--f1-red))",
  },
  {
    title: "Telemetry Model",
    subtitle: "Real-time Analysis",
    url: "/telemetry",
    icon: Zap,
    years: "2023-2025",
    description: "Live telemetry & probability",
    color: "hsl(var(--f1-gold))",
  },
  {
    title: "Historical Model",
    subtitle: "LSTM Neural Network",
    url: "/historical",
    icon: History,
    years: "2018-2025",
    description: "Pattern-based prediction",
    color: "hsl(var(--accent))",
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50 bg-card/30 backdrop-blur-xl">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg racing-gradient flex items-center justify-center">
            <span className="text-xl">🏎️</span>
          </div>
          <div>
            <h1 className="font-racing text-lg tracking-wider text-foreground">
              F1 ORACLE
            </h1>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              AI Prediction System
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2">
            Prediction Models
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {predictionModels.map((model) => {
                const isActive = location.pathname === model.url;
                return (
                  <SidebarMenuItem key={model.title}>
                    <SidebarMenuButton asChild className="h-auto p-0">
                      <NavLink to={model.url} className="block">
                        <motion.div
                          className={`relative p-3 rounded-lg transition-all duration-300 ${
                            isActive
                              ? "bg-secondary border border-primary/30"
                              : "hover:bg-secondary/50"
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                              style={{ backgroundColor: model.color }}
                            />
                          )}

                          <div className="flex items-start gap-3">
                            <div
                              className="p-2 rounded-md"
                              style={{
                                backgroundColor: `${model.color}20`,
                              }}
                            >
                              <model.icon
                                className="w-4 h-4"
                                style={{ color: model.color }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`font-semibold text-sm ${
                                    isActive
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {model.title}
                                </span>
                                <ChevronRight
                                  className={`w-4 h-4 transition-opacity ${
                                    isActive
                                      ? "opacity-100 text-primary"
                                      : "opacity-0"
                                  }`}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground/70">
                                {model.subtitle}
                              </span>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${model.color}15`,
                                    color: model.color,
                                  }}
                                >
                                  {model.years}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Model Info */}
        <div className="mt-auto p-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">
                Models Active
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Neural networks trained on 7+ seasons of race data for accurate predictions.
            </p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

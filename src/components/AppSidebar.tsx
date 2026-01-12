import { Brain, Cpu, Zap, Activity } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

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
  useSidebar,
} from "@/components/ui/sidebar";

const models = [
  {
    title: "Telemetry Model",
    subtitle: "2023 - 2025",
    url: "/telemetry",
    icon: Activity,
    description: "LSTM + Telemetry Analysis",
    badge: "NEW",
  },
  {
    title: "Historical Model",
    subtitle: "2018 - 2025",
    url: "/historical",
    icon: Brain,
    description: "Deep Learning Neural Network",
    badge: null,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg racing-gradient racing-shadow">
            <Cpu className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-racing text-lg font-bold tracking-wide text-sidebar-foreground">
                F1 ORACLE
              </h2>
              <p className="text-xs text-muted-foreground">AI Prediction Hub</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            {!collapsed && "Prediction Models"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {models.map((model) => (
                <SidebarMenuItem key={model.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(model.url)}
                    tooltip={model.title}
                    className={`
                      relative group h-auto py-3 px-3 mb-1 rounded-xl transition-all duration-200
                      ${isActive(model.url) 
                        ? "bg-primary/10 border border-primary/30 racing-shadow" 
                        : "hover:bg-sidebar-accent border border-transparent"
                      }
                    `}
                  >
                    <NavLink
                      to={model.url}
                      className="flex items-start gap-3 w-full"
                      activeClassName=""
                    >
                      <div className={`
                        p-2 rounded-lg transition-all
                        ${isActive(model.url) 
                          ? "racing-gradient text-primary-foreground" 
                          : "bg-sidebar-accent text-muted-foreground group-hover:text-sidebar-foreground"
                        }
                      `}>
                        <model.icon className="w-5 h-5" />
                      </div>
                      
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`
                              font-racing text-sm font-semibold tracking-wide
                              ${isActive(model.url) ? "text-primary" : "text-sidebar-foreground"}
                            `}>
                              {model.title}
                            </span>
                            {model.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-accent text-accent-foreground">
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground block">
                            {model.subtitle}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 block mt-0.5">
                            {model.description}
                          </span>
                        </div>
                      )}

                      {isActive(model.url) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Model Stats */}
        {!collapsed && (
          <div className="mt-6 p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Model Stats
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="text-sidebar-foreground font-semibold">87.3%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Races Analyzed</span>
                <span className="text-sidebar-foreground font-semibold">1,247</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-sidebar-foreground font-semibold">Today</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

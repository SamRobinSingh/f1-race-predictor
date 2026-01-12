import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[128px] opacity-20 racing-gradient" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-accent" />
        </div>

        {/* Carbon texture overlay */}
        <div className="fixed inset-0 carbon-texture opacity-30 pointer-events-none z-0" />

        <AppSidebar />
        
        <SidebarInset className="flex-1 relative z-10">
          {/* Header with trigger */}
          <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <span className="font-racing text-lg font-bold tracking-wide text-gradient-racing">
                F1 HYBRID AI ORACLE
              </span>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border mt-16">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <span className="font-racing tracking-wide">F1 ORACLE</span>
                <span>Powered by LSTM Neural Network & Telemetry Analysis</span>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;

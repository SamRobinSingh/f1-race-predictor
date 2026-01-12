import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden sticky top-0 z-50 flex items-center gap-3 p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <SidebarTrigger className="p-2 rounded-lg hover:bg-secondary">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏎️</span>
              <span className="font-racing text-sm tracking-wider">F1 ORACLE</span>
            </div>
          </header>

          <main className="flex-1 relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[128px] opacity-20 racing-gradient" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-accent" />
            </div>

            {/* Carbon texture overlay */}
            <div className="fixed inset-0 carbon-texture opacity-30 pointer-events-none" />

            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

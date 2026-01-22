import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import HybridPredictor from "./pages/HybridPredictor";
import TelemetryPredictor from "./pages/TelemetryPredictor";
import HistoricalPredictor from "./pages/HistoricalPredictor";
import RaceVisualization from "./pages/RaceVisualization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HybridPredictor />} />
            <Route path="/telemetry" element={<TelemetryPredictor />} />
            <Route path="/historical" element={<HistoricalPredictor />} />
            <Route path="/visualization" element={<RaceVisualization />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Activity } from "lucide-react";
import PredictionPage from "@/components/PredictionPage";

const years = [2025, 2024, 2023];

const TelemetryModel = () => {
  return (
    <PredictionPage
      modelName="Telemetry Model"
      modelDescription="Advanced LSTM Neural Network combined with real-time telemetry data analysis for 2023-2025 seasons"
      years={years}
      icon={<Activity className="w-6 h-6 text-primary-foreground" />}
    />
  );
};

export default TelemetryModel;

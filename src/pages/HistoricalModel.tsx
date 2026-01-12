import { Brain } from "lucide-react";
import PredictionPage from "@/components/PredictionPage";

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

const HistoricalModel = () => {
  return (
    <PredictionPage
      modelName="Historical Model"
      modelDescription="Deep Learning Neural Network trained on comprehensive historical F1 data from 2018-2025 seasons"
      years={years}
      icon={<Brain className="w-6 h-6 text-primary-foreground" />}
    />
  );
};

export default HistoricalModel;

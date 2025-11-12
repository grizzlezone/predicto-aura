import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Activity, Target, Clock } from "lucide-react";

interface ModelInfoProps {
  modelType: string;
  accuracy: number;
  lastTrained: string;
  predictionHorizon: string;
}

export const ModelInfo = ({ modelType, accuracy, lastTrained, predictionHorizon }: ModelInfoProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Model Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Model Type</span>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            {modelType}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Accuracy</span>
          </div>
          <span className="text-sm font-medium text-success">{accuracy}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last Trained</span>
          </div>
          <span className="text-sm font-medium text-foreground">{lastTrained}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Forecast Period</span>
          </div>
          <span className="text-sm font-medium text-foreground">{predictionHorizon}</span>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This model uses LSTM neural networks with sentiment analysis to predict stock movements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

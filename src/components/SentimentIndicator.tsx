import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentIndicatorProps {
  sentiment: "bullish" | "bearish" | "neutral";
  score: number;
  confidence: number;
}

export const SentimentIndicator = ({ sentiment, score, confidence }: SentimentIndicatorProps) => {
  const getSentimentIcon = () => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="h-8 w-8 text-success" />;
      case "bearish":
        return <TrendingDown className="h-8 w-8 text-danger" />;
      default:
        return <Minus className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case "bullish":
        return "text-success";
      case "bearish":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Market Sentiment</CardTitle>
        <p className="text-sm text-muted-foreground">AI-analyzed news & social signals</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={`text-3xl font-bold capitalize ${getSentimentColor()}`}>
              {sentiment}
            </p>
            <p className="text-sm text-muted-foreground">
              Sentiment Score: {score.toFixed(1)}
            </p>
          </div>
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            {getSentimentIcon()}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Model Confidence</span>
            <span className="text-foreground font-medium">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 rounded bg-secondary">
            <p className="text-xs text-muted-foreground">Bearish</p>
            <p className="text-sm font-medium text-danger">{(100 - score).toFixed(0)}%</p>
          </div>
          <div className="text-center p-2 rounded bg-secondary">
            <p className="text-xs text-muted-foreground">Neutral</p>
            <p className="text-sm font-medium text-muted-foreground">-</p>
          </div>
          <div className="text-center p-2 rounded bg-secondary">
            <p className="text-xs text-muted-foreground">Bullish</p>
            <p className="text-sm font-medium text-success">{score.toFixed(0)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

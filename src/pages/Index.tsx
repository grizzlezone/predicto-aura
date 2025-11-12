import { useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { MetricCard } from "@/components/MetricCard";
import { PriceChart } from "@/components/PriceChart";
import { SentimentIndicator } from "@/components/SentimentIndicator";
import { ModelInfo } from "@/components/ModelInfo";
import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [currentData, setCurrentData] = useState(generateMockData("AAPL"));
  const { toast } = useToast();

  function generateMockData(symbol: string) {
    const basePrice = Math.random() * 200 + 100;
    const data = [];
    
    // Historical data (30 days)
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variance = (Math.random() - 0.5) * 20;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: basePrice + variance + (i * 0.5),
      });
    }
    
    // Predicted data (7 days)
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const trend = Math.random() > 0.5 ? 1 : -1;
      const variance = Math.random() * 10;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: undefined,
        predicted: basePrice + (i * 2 * trend) + variance,
      });
    }

    const currentPrice = data[30].actual!;
    const predictedPrice = data[data.length - 1].predicted!;
    const change = ((predictedPrice - currentPrice) / currentPrice) * 100;
    const sentiment: "bullish" | "bearish" | "neutral" = change > 2 ? "bullish" : change < -2 ? "bearish" : "neutral";

    return {
      symbol,
      currentPrice: currentPrice.toFixed(2),
      predictedPrice: predictedPrice.toFixed(2),
      change: change.toFixed(2),
      volume: (Math.random() * 100000000).toFixed(0),
      sentiment,
      sentimentScore: 50 + change * 5,
      confidence: 75 + Math.random() * 20,
      chartData: data,
    };
  }

  const handleSearch = (searchTicker: string) => {
    toast({
      title: "Analyzing Stock",
      description: `Running AI analysis on ${searchTicker}...`,
    });
    
    setTimeout(() => {
      const newData = generateMockData(searchTicker);
      setCurrentData(newData);
      toast({
        title: "Analysis Complete",
        description: `${searchTicker} predictions ready!`,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            AI Stock Market Predictor
          </h1>
          <p className="text-lg text-muted-foreground">
            Advanced machine learning predictions powered by neural networks
          </p>
        </div>

        {/* Search */}
        <StockSearch onSearch={handleSearch} ticker={ticker} setTicker={setTicker} />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Current Price"
            value={`$${currentData.currentPrice}`}
            icon={DollarSign}
            trend="neutral"
          />
          <MetricCard
            title="Predicted Price (7d)"
            value={`$${currentData.predictedPrice}`}
            change={`${currentData.change}%`}
            icon={TrendingUp}
            trend={parseFloat(currentData.change) > 0 ? "up" : "down"}
          />
          <MetricCard
            title="Volume"
            value={`${(parseInt(currentData.volume) / 1000000).toFixed(1)}M`}
            icon={BarChart3}
            trend="neutral"
          />
          <MetricCard
            title="Model Confidence"
            value={`${currentData.confidence.toFixed(0)}%`}
            icon={Activity}
            trend="up"
          />
        </div>

        {/* Chart */}
        <PriceChart data={currentData.chartData} ticker={currentData.symbol} />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SentimentIndicator
            sentiment={currentData.sentiment}
            score={currentData.sentimentScore}
            confidence={currentData.confidence}
          />
          <ModelInfo
            modelType="LSTM Neural Network"
            accuracy={87.5}
            lastTrained="2024-01-10"
            predictionHorizon="7 days"
          />
        </div>

        {/* Disclaimer */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
          <p>
            This is a demonstration prototype with simulated AI predictions. 
            Not financial advice. For production use, integrate with real ML models and financial data APIs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

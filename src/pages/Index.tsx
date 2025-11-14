import { useState, useEffect } from "react";
import { StockSearch } from "@/components/StockSearch";
import { MetricCard } from "@/components/MetricCard";
import { PriceChart } from "@/components/PriceChart";
import { SentimentIndicator } from "@/components/SentimentIndicator";
import { ModelInfo } from "@/components/ModelInfo";
import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStockPrediction } from "@/hooks/useStockPrediction";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [currentData, setCurrentData] = useState<any>({ 
      currentPrice: 0, 
      predictedPrice: 0, 
      change: 0, 
      volume: 0, 
      sentimentScore: 0, 
      confidence: 0,
      chartData: [],
  });
  const [aiPrediction, setAiPrediction] = useState<any>(null);
  const [aiSentiment, setAiSentiment] = useState<any>(null);
  const { toast } = useToast();
  const { loading, getPrediction, getSentiment } = useStockPrediction();



 const handleSearch = async (searchTicker: string) => {
    toast({
      title: "Analyzing Stock",
      description: `Running AI analysis on ${searchTicker}...`,
    });
    
    // 1. Get AI predictions. The backend (Deno function) now handles Alpha Vantage fetching.
    // We assume the hook function signature is updated to only take the ticker.
    const prediction = await getPrediction(searchTicker); 
    
    // 2. Get AI sentiment
    const sentiment = await getSentiment(searchTicker);
    
    if (prediction) {
        // Map the combined data structure from the backend to the component's state shape
        setCurrentData({
            symbol: searchTicker,
            // Use real data from the prediction object
            currentPrice: prediction.currentPrice?.toFixed(2) || 'N/A', 
            predictedPrice: prediction.predictedPrice?.toFixed(2) || 'N/A',
            // Volume is still placeholder as it wasn't fetched/calculated in Deno code
            volume: (Math.random() * 100000000).toFixed(0), 
            // Use sentiment data or fallback to prediction trend
            sentiment: sentiment?.sentiment || prediction.trend,
            sentimentScore: sentiment?.score || 50,
            confidence: prediction.confidence,
            
            // Map the backend's 'close' price from Alpha Vantage to the chart's expected 'actual'
            chartData: prediction.chartData.map((d: any) => ({
                date: d.date,
                actual: d.close, // <-- Mapped from 'close' to 'actual' for the PriceChart
                predicted: undefined // AI prediction is visualized separately on the chart
            })),
        });
        setAiPrediction(prediction);
    }
    
    setAiSentiment(sentiment);
    
    if (prediction && sentiment) {
      toast({
        title: "Analysis Complete",
        description: `AI-powered predictions for ${searchTicker} are ready!`,
      });
    }
  };

  // Load initial AI data
  useEffect(() => {
	console.log(ticker)
    handleSearch(ticker);
  }, []);

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
          {loading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : (
            <>
              <MetricCard
                title="Current Price"
                value={`$${currentData.currentPrice || '0.00'}`}
                icon={DollarSign}
                trend="neutral"
              />
              <MetricCard
                title={aiPrediction ? "AI Predicted Price" : "Predicted Price (7d)"}
                value={aiPrediction ? `$${aiPrediction.predictedPrice.toFixed(2)}` : `$${currentData.predictedPrice}`}
                change={aiPrediction ? `${aiPrediction.trend === 'bullish' ? '+' : '-'}${Math.abs(parseFloat(currentData.change))}%` : `${currentData.change}%`}
                icon={TrendingUp}
                trend={aiPrediction ? (aiPrediction.trend === 'bullish' ? "up" : "down") : (parseFloat(currentData.change) > 0 ? "up" : "down")}
              />
              <MetricCard
                title="Volume"
                value={`${(parseInt(currentData.volume) / 1000000).toFixed(1)}M`}
                icon={BarChart3}
                trend="neutral"
              />
              <MetricCard
				title="AI Confidence"
				value={aiPrediction ? 
						`${aiPrediction.confidence}%` : 
						`${(currentData.confidence || 0).toFixed(0)}%`} // <-- Protected toFixed call
				icon={Activity}
				trend="up"
				/>
            </>
          )}
        </div>

        {/* Chart */}
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <div className="space-y-4">
            <PriceChart data={currentData.chartData} ticker={currentData.symbol} />
            {aiPrediction && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">{aiPrediction.reasoning}</p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-muted-foreground">30-day target: <strong className="text-foreground">${aiPrediction.targetPrice30d?.toFixed(2)}</strong></span>
                  <span className="text-muted-foreground">90-day target: <strong className="text-foreground">${aiPrediction.targetPrice90d?.toFixed(2)}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : (
            <>
              <div className="space-y-4">
                <SentimentIndicator
                  sentiment={aiSentiment?.sentiment || currentData.sentiment}
                  score={aiSentiment?.score || currentData.sentimentScore}
                  confidence={aiPrediction?.confidence || currentData.confidence}
                />
                {aiSentiment && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Market Factors</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {aiSentiment.factors?.slice(0, 3).map((factor: string, i: number) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <ModelInfo
                modelType="AI-Powered Neural Network"
                accuracy={aiPrediction?.confidence || 87.5}
                lastTrained={new Date().toISOString().split('T')[0]}
                predictionHorizon="Real-time"
              />
            </>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
          <p>
            AI-powered stock predictions using Google Gemini. Predictions are generated in real-time based on market analysis.
            This is for demonstration purposes only and is not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

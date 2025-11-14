import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictionData {
  predictedPrice: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  reasoning: string;
  targetPrice30d: number;
  targetPrice90d: number;
  currentPrice: number; 
  chartData: Array<{ date: string; close: number }>;
}

interface SentimentData {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  summary: string;
  factors: string[];
  newsHeadlines: string[];
}

export const useStockPrediction = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getPrediction = async (ticker: string, historicalData?: any): Promise<PredictionData | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-stock', {
        body: { ticker, historicalData }
      });

      if (error) {
        console.error('Prediction error:', error);
        toast({
          title: 'Prediction Failed',
          description: error.message || 'Unable to generate prediction',
          variant: 'destructive'
        });
        return null;
      }

      return data as PredictionData;
    } catch (err) {
      console.error('Error calling predict-stock:', err);
      toast({
        title: 'Error',
        description: 'Failed to connect to prediction service',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSentiment = async (ticker: string): Promise<SentimentData | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { ticker }
      });

      if (error) {
        console.error('Sentiment error:', error);
        toast({
          title: 'Analysis Failed',
          description: error.message || 'Unable to analyze sentiment',
          variant: 'destructive'
        });
        return null;
      }

      return data as SentimentData;
    } catch (err) {
      console.error('Error calling analyze-sentiment:', err);
      toast({
        title: 'Error',
        description: 'Failed to connect to sentiment service',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getPrediction,
    getSentiment
  };
};



import "https://deno.land/x/xhr@0.1.0/mod.ts";

// @ts-ignore: Local TS compiler cannot resolve this remote module
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore: Explicitly typed 'req' as Request, but Deno type is not local
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // We only need the ticker from the frontend
    const { ticker } = await req.json(); 
    
    if (!ticker) {
      return new Response(
        JSON.stringify({ error: 'Ticker symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- 1. FETCH REAL HISTORICAL DATA (ALPHA VANTAGE) ---
    // @ts-ignore: Deno is available in the Edge Function runtime
    const STOCK_API_KEY = Deno.env.get('STOCK_API_KEY');
    if (!STOCK_API_KEY) {
      console.error('STOCK_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Stock Data API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Alpha Vantage endpoint to get daily historical data
    const stockDataUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=E65IRBNJAF23EORH`;
    
    const stockResponse = await fetch(stockDataUrl);
    const stockRawData = await stockResponse.json();

    if (stockRawData["Error Message"] || stockRawData["Note"]) {
        console.error('Alpha Vantage Error:', stockRawData["Error Message"] || stockRawData["Note"]);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch stock data: ' + (stockRawData["Error Message"] || "API limit reached") }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Transform data for AI prompt (get last 30 days of closing prices)
    const timeSeries = stockRawData["Time Series (Daily)"];
    const historicalDataForAI = Object.keys(timeSeries)
        .slice(0, 30)
        .map(date => ({ 
            date, 
            close: parseFloat(timeSeries[date]["4. close"]) 
        }));

    // --- 2. DIRECT GEMINI API CALL ---
    // @ts-ignore: Deno is available in the Edge Function runtime
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create analysis prompt using the newly fetched data
    const prompt = `Analyze the stock ${ticker} using the following historical closing prices (Date: Close Price): ${JSON.stringify(historicalDataForAI)}. Provide a price prediction for the next 7 days.

Provide a JSON response with:
1. predictedPrice: estimated price for next trading day
2. confidence: confidence level (0-100)
3. trend: "bullish", "bearish", or "neutral"
4. reasoning: brief explanation of the prediction
5. targetPrice30d: 30-day target price
6. targetPrice90d: 90-day target price
7. currentPrice: The most recent closing price from the historical data provided.

Respond ONLY with valid JSON, no markdown or additional text.`;

    console.log('Sending request to Gemini AI for ticker:', ticker);

    // Using the official Gemini endpoint and passing the key as a query parameter
    const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/google/gemini-2.5-flash:generateContent';
    
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Model is part of the body payload
        model: 'google/gemini-2.5-flash', 
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // Generic error response for direct API call failures
      return new Response(
        JSON.stringify({ error: `Gemini API call failed (${response.status}): ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini AI response received');

    // Corrected parsing for the Gemini 'generateContent' response structure
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    let prediction;
    try {
      const jsonStr = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      prediction = JSON.parse(jsonStr);
      
      // *** IMPORTANT: Attach the historical data to the prediction response ***
      prediction.chartData = historicalDataForAI;
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback response
      prediction = {
        predictedPrice: 0,
        confidence: 50,
        trend: 'neutral',
        reasoning: 'Unable to generate prediction due to parsing error.',
        targetPrice30d: 0,
        targetPrice90d: 0,
        chartData: historicalDataForAI // Still send the real historical data
      };
    }

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-stock function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
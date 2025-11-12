import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockSearchProps {
  onSearch: (ticker: string) => void;
  ticker: string;
  setTicker: (ticker: string) => void;
}

export const StockSearch = ({ onSearch, ticker, setTicker }: StockSearchProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.toUpperCase());
    }
  };

  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          Analyze
        </Button>
      </form>
      
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Popular:</span>
        {popularStocks.map((stock) => (
          <Button
            key={stock}
            variant="outline"
            size="sm"
            onClick={() => {
              setTicker(stock);
              onSearch(stock);
            }}
            className="border-border hover:bg-secondary"
          >
            {stock}
          </Button>
        ))}
      </div>
    </div>
  );
};

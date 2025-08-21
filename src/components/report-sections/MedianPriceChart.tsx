
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketDataUnion } from '@/utils/webhook/types';
import { getMedianPriceHistory, sortMonthsChronologically } from '@/utils/marketDataUtils';

interface MedianPriceChartProps {
  marketData?: MarketDataUnion;
}

const MedianPriceChart: React.FC<MedianPriceChartProps> = ({ marketData }) => {
  const priceHistory = getMedianPriceHistory(marketData);
  
  const chartData = React.useMemo(() => {
    if (!priceHistory || Object.keys(priceHistory).length === 0) {
      return [
        { month: 'Jan', price: 850000 },
        { month: 'Feb', price: 875000 },
        { month: 'Mar', price: 890000 },
        { month: 'Apr', price: 910000 },
        { month: 'May', price: 925000 },
        { month: 'Jun', price: 940000 }
      ];
    }

    const sortedData = sortMonthsChronologically(priceHistory);
    return sortedData.map(([monthYear, price]) => {
      const numericPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[$,]/g, '')) 
        : price;
      
      return {
        month: monthYear.split(' ')[0].slice(0, 3),
        price: numericPrice
      };
    });
  }, [priceHistory]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">
          Median Price Trends (6 months)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                axisLine={{ strokeWidth: 1 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                axisLine={{ strokeWidth: 1 }}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${(value/1000)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Median Price']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                className="stroke-primary"
                strokeWidth={2}
                dot={{ className: "fill-primary stroke-primary", strokeWidth: 1, r: 2 }}
                activeDot={{ r: 3, className: "fill-primary stroke-primary" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedianPriceChart;

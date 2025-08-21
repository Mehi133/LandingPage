
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentSalesComparablesChartProps {
  recentSales?: any[];
  suggestedPrice?: number;
  marketData?: any;
  pricingData?: any;
}

const RecentSalesComparablesChart: React.FC<RecentSalesComparablesChartProps> = ({ 
  recentSales = [], 
  suggestedPrice,
  marketData,
  pricingData 
}) => {
  // Extract suggested price from pricing data
  const extractedSuggestedPrice = suggestedPrice || 
    (pricingData?.PricingStrategy?.[0]?.suggestedPrice) ||
    (pricingData?.PricingStrategy?.[0]?.['suggested price']) ||
    (pricingData?.PricingStrategy?.[0]?.SuggestedPrice);

  // Extract market average price for bedrooms
  const marketAveragePrice = marketData?.medianPriceBedrooms || marketData?.medianPrice;

  // Process recent sales data for chart
  const chartData = recentSales.slice(0, 8).map((sale, index) => {
    const price = typeof sale.price === 'string' 
      ? parseFloat(sale.price.replace(/[$,]/g, '')) || 0
      : sale.price || 0;
    
    const address = sale.address || `Property ${index + 1}`;
    const shortAddress = address.length > 20 ? address.substring(0, 20) + '...' : address;
    
    return {
      name: shortAddress,
      fullAddress: address,
      price: price,
      soldDate: sale.soldDate || 'Recently sold',
      type: 'Recent Sale'
    };
  }).filter(item => item.price > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">Recent Sales Comparables</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">No recent sales data available for comparison.</p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground text-sm">{data.fullAddress}</p>
          <p className="text-primary font-semibold">${payload[0].value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{data.soldDate}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">Recent Sales Comparables</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tickFormatter={formatPrice}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Suggested Price Reference Line */}
              {extractedSuggestedPrice && (
                <ReferenceLine 
                  y={extractedSuggestedPrice} 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                />
              )}
              
              {/* Market Average Reference Line */}
              {marketAveragePrice && (
                <ReferenceLine 
                  y={marketAveragePrice} 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}
              
              <Bar 
                dataKey="price" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-violet-500 rounded"></div>
            <span className="text-muted-foreground">Recent Sales</span>
          </div>
          {extractedSuggestedPrice && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-green-500"></div>
            </div>
          )}
          {marketAveragePrice && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-amber-500"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSalesComparablesChart;

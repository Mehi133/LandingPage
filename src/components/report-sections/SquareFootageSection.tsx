
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EnhancedMarketData, MarketDataUnion } from '@/utils/webhook/types';
import { formatMarketValue, sortMonthsChronologically } from '@/utils/marketDataUtils';

interface SquareFootageSectionProps {
  marketData?: MarketDataUnion;
}

const isEnhancedMarketData = (data: MarketDataUnion): data is EnhancedMarketData => {
  return data && typeof data === 'object' && 'averagePricePerSqFtGeneral' in data;
};

const SquareFootageSection: React.FC<SquareFootageSectionProps> = ({ marketData }) => {
  if (!marketData || !isEnhancedMarketData(marketData)) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-foreground">Square Footage Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-sm text-muted-foreground">
            Square footage data is not available for this area
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPricePerSqftChartData = () => {
    if (!marketData.averagePricePerSqFtLast6Months) return [];
    
    const sortedData = sortMonthsChronologically(marketData.averagePricePerSqFtLast6Months);
    return sortedData.map(([monthYear, price]) => ({
      month: monthYear.split(' ')[0].slice(0, 3),
      pricePerSqft: typeof price === 'number' ? price : parseFloat(String(price))
    }));
  };

  const chartData = getPricePerSqftChartData();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">Square Footage Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium text-foreground mb-1">
              {formatMarketValue(marketData.averagePricePerSqFtGeneral, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground">Avg Price/Sqft (General)</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium text-foreground mb-1">
              {formatMarketValue(marketData.averagePricePerSqFtBedrooms, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground">Price/Sqft ({marketData.bedroomsRequested} BR)</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium text-foreground mb-1">
              {formatMarketValue(marketData.averagePricePerSqFtPropertyType, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground">Price/Sqft ({marketData.propertyTypeNormalized})</div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Price Per Square Foot Trends (6 months)</h4>
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
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price/Sqft']}
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
                    dataKey="pricePerSqft"
                    className="stroke-primary"
                    strokeWidth={2}
                    dot={{ className: "fill-primary stroke-primary", strokeWidth: 1, r: 2 }}
                    activeDot={{ r: 3, className: "fill-primary stroke-primary" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SquareFootageSection;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EnhancedMarketData, MarketDataUnion } from '@/utils/webhook/types';
import { formatMarketValue } from '@/utils/marketDataUtils';

interface BedroomSectionProps {
  marketData?: MarketDataUnion;
}

const isEnhancedMarketData = (data: MarketDataUnion): data is EnhancedMarketData => {
  return data && typeof data === 'object' && 'bedroomsRequested' in data;
};

const BedroomSection: React.FC<BedroomSectionProps> = ({ marketData }) => {
  console.log('[BEDROOM SECTION] Processing market data:', marketData);

  if (!marketData || !isEnhancedMarketData(marketData)) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Bedroom Analysis</h3>
          <div className="text-center py-8 text-muted-foreground">
            Bedroom-specific data is not available for this area
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonData = [
    {
      category: 'General Market',
      medianPrice: marketData.medianPrice,
      avgDaysOnMarket: marketData.averageDaysOnMarketGeneral,
      totalListings: marketData.totalListingsGeneral
    },
    {
      category: `${marketData.bedroomsRequested} Bedrooms`,
      medianPrice: marketData.medianPriceBedrooms,
      avgDaysOnMarket: marketData.averageDaysOnMarketBedrooms,
      totalListings: marketData.totalListingsBedrooms
    }
  ];

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Bedroom Analysis ({marketData.bedroomsRequested} Bedrooms)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">
              {formatMarketValue(marketData.medianPriceBedrooms, 'currency')}
            </div>
            <div className="text-sm text-muted-foreground">Median Price ({marketData.bedroomsRequested} BR)</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">
              {formatMarketValue(marketData.totalListingsBedrooms, 'number')}
            </div>
            <div className="text-sm text-muted-foreground">Total Listings ({marketData.bedroomsRequested} BR)</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">
              {formatMarketValue(Math.round(marketData.averageDaysOnMarketBedrooms), 'days')}
            </div>
            <div className="text-sm text-muted-foreground">Avg Days on Market</div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-foreground mb-3">Market Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                <XAxis 
                  dataKey="category" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value/1000)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'medianPrice') return [`$${value.toLocaleString()}`, 'Median Price'];
                    if (name === 'totalListings') return [value.toLocaleString(), 'Total Listings'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Bar 
                  dataKey="medianPrice" 
                  className="fill-primary" 
                  barSize={40} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BedroomSection;

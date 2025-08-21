
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EnhancedMarketData, MarketDataUnion } from '@/utils/webhook/types';
import { formatMarketValue } from '@/utils/marketDataUtils';

interface PropertyTypeSectionProps {
  marketData?: MarketDataUnion;
}

const isEnhancedMarketData = (data: MarketDataUnion): data is EnhancedMarketData => {
  return data && typeof data === 'object' && 'propertyTypeRequested' in data;
};

const PropertyTypeSection: React.FC<PropertyTypeSectionProps> = ({ marketData }) => {
  if (!marketData || !isEnhancedMarketData(marketData)) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Property Type Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-6 text-sm text-muted-foreground">
            Property type specific data is not available for this area
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
      totalListings: marketData.totalListingsGeneral,
      pricePerSqft: marketData.averagePricePerSqFtGeneral
    },
    {
      category: marketData.propertyTypeNormalized,
      medianPrice: marketData.medianPricePropertyType,
      avgDaysOnMarket: marketData.averageDaysOnMarketPropertyType,
      totalListings: marketData.totalListingsPropertyType,
      pricePerSqft: marketData.averagePricePerSqFtPropertyType
    }
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Property Type Analysis ({marketData.propertyTypeNormalized})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 border border-border/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground mb-1">
              {formatMarketValue(marketData.medianPricePropertyType, 'currency')}
            </div>
            <div className="text-sm text-muted-foreground">Median Price</div>
          </div>
          
          <div className="text-center p-3 border border-border/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground mb-1">
              {formatMarketValue(marketData.totalListingsPropertyType, 'number')}
            </div>
            <div className="text-sm text-muted-foreground">Total Listings</div>
          </div>
          
          <div className="text-center p-3 border border-border/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground mb-1">
              {formatMarketValue(Math.round(marketData.averageDaysOnMarketPropertyType), 'days')}
            </div>
            <div className="text-sm text-muted-foreground">Avg Days on Market</div>
          </div>
          
          <div className="text-center p-3 border border-border/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground mb-1">
              {formatMarketValue(marketData.averagePricePerSqFtPropertyType, 'currency')}
            </div>
            <div className="text-sm text-muted-foreground">Price/Sqft</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Property Type vs General Market</h4>
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
                    if (name === 'pricePerSqft') return [`$${value}`, 'Price/Sqft'];
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

export default PropertyTypeSection;

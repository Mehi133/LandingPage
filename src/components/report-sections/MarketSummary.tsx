
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketDataUnion } from '@/utils/webhook/types';
import { getMedianPrice, getCurrentInventory, getAverageDaysOnMarket } from '@/utils/marketDataUtils';

interface MarketSummaryProps {
  marketData?: MarketDataUnion;
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ marketData }) => {
  const medianPrice = getMedianPrice(marketData);
  const currentInventory = getCurrentInventory(marketData);
  const avgDaysOnMarket = getAverageDaysOnMarket(marketData);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Market Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{medianPrice}</div>
            <div className="text-muted-foreground">Current Median Price</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{currentInventory}</div>
            <div className="text-muted-foreground">Active Listings</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{avgDaysOnMarket}</div>
            <div className="text-muted-foreground">Average Days on Market</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSummary;

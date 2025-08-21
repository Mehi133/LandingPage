
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MarketDataUnion } from '@/utils/webhook/types';
import { getMedianPrice, getCurrentInventory, getAverageDaysOnMarket } from '@/utils/marketDataUtils';

interface GeneralMarketSectionProps {
  marketData?: MarketDataUnion;
}

const GeneralMarketSection: React.FC<GeneralMarketSectionProps> = ({ marketData }) => {
  console.log('[GENERAL MARKET] Processing market data:', marketData);

  const medianPrice = getMedianPrice(marketData);
  const currentInventory = getCurrentInventory(marketData);
  const avgDaysOnMarket = getAverageDaysOnMarket(marketData);

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">General Market Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{medianPrice}</div>
            <div className="text-sm text-muted-foreground">Median Price</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{currentInventory}</div>
            <div className="text-sm text-muted-foreground">Current Inventory</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{avgDaysOnMarket}</div>
            <div className="text-sm text-muted-foreground">Avg Days on Market</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralMarketSection;

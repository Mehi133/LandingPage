
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketDataUnion, EnhancedMarketData } from '@/utils/webhook/types';
import MedianPriceChart from './MedianPriceChart';
import DaysOnMarketChart from './DaysOnMarketChart';
import MedianPriceBedroomsChart from './MedianPriceBedroomsChart';
import DaysOnMarketBedroomsChart from './DaysOnMarketBedroomsChart';
import SquareFootageSection from './SquareFootageSection';
import BedroomSection from './BedroomSection';
import PropertyTypeSection from './PropertyTypeSection';
import { getMedianPrice, getCurrentInventory, getAverageDaysOnMarket } from '@/utils/marketDataUtils';

interface MarketConditionsProps {
  marketData?: MarketDataUnion;
}

const isEnhancedMarketData = (data: MarketDataUnion): data is EnhancedMarketData => {
  return data && typeof data === 'object' && 'zipCode' in data;
};

const hasValidMarketData = (marketData?: MarketDataUnion): boolean => {
  if (!marketData || Object.keys(marketData).length === 0) {
    return false;
  }
  
  if (isEnhancedMarketData(marketData)) {
    const hasValidFields = marketData.medianPrice !== undefined && marketData.medianPrice > 0;
    return hasValidFields;
  }
  
  const legacyData = marketData as any;
  const hasMedianPrice = (legacyData['Median Price'] !== undefined && legacyData['Median Price'] !== null) && 
                         (typeof legacyData['Median Price'] === 'number' || (typeof legacyData['Median Price'] === 'string' && legacyData['Median Price'] !== ''));
  const hasInventory = (legacyData['Current For Sale Inventory'] !== undefined && legacyData['Current For Sale Inventory'] !== null) &&
                      (typeof legacyData['Current For Sale Inventory'] === 'number' || typeof legacyData['Current For Sale Inventory'] === 'string');
  const hasDaysOnMarket = legacyData['Days on Market in the Last 6 Months'] !== undefined && legacyData['Days on Market in the Last 6 Months'] !== null;
  const hasPriceHistory = legacyData['Median Price Last 6 Months'] !== undefined && legacyData['Median Price Last 6 Months'] !== null;
  
  const validIndicators = [hasMedianPrice, hasInventory, hasDaysOnMarket, hasPriceHistory].filter(Boolean).length;
  return validIndicators >= 1;
};

const MarketConditions: React.FC<MarketConditionsProps> = ({ marketData }) => {
  const medianPrice = getMedianPrice(marketData);
  const currentInventory = getCurrentInventory(marketData);
  const avgDaysOnMarket = getAverageDaysOnMarket(marketData);

  // Check if we have no market data at all
  if (!marketData || Object.keys(marketData).length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6">Market Conditions</h2>
          
          <Card className="border-border/50 bg-muted/10">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                Market data unavailable. Displaying default market trend data.
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Market Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">N/A</div>
                <div className="text-sm text-muted-foreground">Current Median Price</div>
              </div>
              
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">N/A</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">N/A</div>
                <div className="text-sm text-muted-foreground">Average Days on Market</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedianPriceChart marketData={undefined} />
          <DaysOnMarketChart marketData={undefined} />
        </div>
      </div>
    );
  }

  const hasValidData = hasValidMarketData(marketData);

  if (!hasValidData) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6">Market Conditions</h2>
          
          <Card className="border-border/50 bg-muted/10">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                Partial market data available. Some market trends may use default values.
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Market Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">{medianPrice}</div>
                <div className="text-sm text-muted-foreground">Current Median Price</div>
              </div>
              
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">{currentInventory}</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">{avgDaysOnMarket}</div>
                <div className="text-sm text-muted-foreground">Average Days on Market</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedianPriceChart marketData={marketData} />
          <DaysOnMarketChart marketData={marketData} />
        </div>
      </div>
    );
  }

  // Check if we have enhanced market data with new structure
  if (isEnhancedMarketData(marketData)) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Market Conditions</h2>
        
        {/* Market Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">{medianPrice}</div>
                <div className="text-sm text-muted-foreground">Current Median Price</div>
              </div>
              
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">{currentInventory}</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              
              <div className="text-center p-3 border border-border/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground mb-1">{avgDaysOnMarket}</div>
                <div className="text-sm text-muted-foreground">Average Days on Market</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* General Market Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedianPriceChart marketData={marketData} />
          <DaysOnMarketChart marketData={marketData} />
        </div>
        
        {/* Bedroom-Specific Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedianPriceBedroomsChart marketData={marketData} />
          <DaysOnMarketBedroomsChart marketData={marketData} />
        </div>
        
        {/* Enhanced Sections */}
        <div className="space-y-6">
          <SquareFootageSection marketData={marketData} />
          <BedroomSection marketData={marketData} />
          <PropertyTypeSection marketData={marketData} />
        </div>
      </div>
    );
  }

  // Fallback to legacy layout for old market data format
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground mb-6">Market Conditions</h2>
      
      {/* Market Summary */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border border-border/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground mb-1">{medianPrice}</div>
              <div className="text-sm text-muted-foreground">Current Median Price</div>
            </div>
            
            <div className="text-center p-3 border border-border/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground mb-1">{currentInventory}</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </div>
            
            <div className="text-center p-3 border border-border/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground mb-1">{avgDaysOnMarket}</div>
              <div className="text-sm text-muted-foreground">Average Days on Market</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedianPriceChart marketData={marketData} />
        <DaysOnMarketChart marketData={marketData} />
      </div>
    </div>
  );
};

export default MarketConditions;

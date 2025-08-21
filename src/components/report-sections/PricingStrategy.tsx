
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingData } from '@/utils/webhook/types';
import { getCaseInsensitiveValue } from '@/utils/webhook/fieldAccessUtils';
import ActiveSalesComparablesChart from './ActiveSalesComparablesChart';
import RecentSalesComparablesChart from './RecentSalesComparablesChart';

interface PricingStrategyProps {
  propertyData?: any;
  pricingData?: PricingData;
  activeListings?: any[];
  recentSales?: any[];
  marketData?: any;
}

const PricingStrategy: React.FC<PricingStrategyProps> = ({ 
  pricingData, 
  activeListings = [], 
  recentSales = [], 
  marketData 
}) => {
  // Validate basic structure
  if (!pricingData) {
    return (
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-primary">Pricing Strategy & Analysis</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Pricing analysis is not available for this property.</p>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  // Check PricingStrategy array
  const pricingStrategyArray = pricingData.PricingStrategy;
  
  if (!pricingStrategyArray || !Array.isArray(pricingStrategyArray) || pricingStrategyArray.length === 0) {
    return (
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-primary">Pricing Strategy & Analysis</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Pricing analysis is not available for this property.</p>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  // Analyze first item structure
  const strategyData = pricingStrategyArray[0];
  
  if (!strategyData || typeof strategyData !== 'object') {
    return (
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-primary">Pricing Strategy & Analysis</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Pricing analysis is not available for this property.</p>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  // Extract all fields
  const suggestedPrice = getCaseInsensitiveValue(strategyData, 'suggested price') || 
                         getCaseInsensitiveValue(strategyData, 'suggestedPrice') ||
                         getCaseInsensitiveValue(strategyData, 'SuggestedPrice');
                         
  const priceRange = getCaseInsensitiveValue(strategyData, 'Price Range') || 
                     getCaseInsensitiveValue(strategyData, 'PriceRange') ||
                     getCaseInsensitiveValue(strategyData, 'priceRange');
  
  const options = getCaseInsensitiveValue(strategyData, 'Pricing Options') || 
                  getCaseInsensitiveValue(strategyData, 'PricingOptions') ||
                  getCaseInsensitiveValue(strategyData, 'pricingOptions');
  
  const reasoning = getCaseInsensitiveValue(strategyData, 'Pricing Reasoning') || 
                    getCaseInsensitiveValue(strategyData, 'PricingReasoning') ||
                    getCaseInsensitiveValue(strategyData, 'pricingReasoning');
  
  // Simplified currency formatting - less blue, more structure
  const formatPrice = (value: any): string => {
    if (!value) return 'N/A';
    if (typeof value === 'number') return `$${value.toLocaleString()}`;
    if (typeof value === 'string' && value.includes('$')) return value;
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    const result = isNaN(num) ? 'N/A' : `$${num.toLocaleString()}`;
    return result;
  };

  // Type guard for options object
  const isOptionsObject = (opts: any): opts is { Conservative?: any; MarketValue?: any; Premium?: any; "Market Value"?: any } => {
    return opts && typeof opts === 'object' && !Array.isArray(opts);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-primary">Pricing Strategy & Analysis</h2>
      
      {/* Comparative Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveSalesComparablesChart 
          activeListings={activeListings}
          suggestedPrice={typeof suggestedPrice === 'number' ? suggestedPrice : parseFloat(String(suggestedPrice).replace(/[^0-9.-]/g, '')) || undefined}
          marketData={marketData}
          pricingData={pricingData}
        />
        <RecentSalesComparablesChart 
          recentSales={recentSales}
          suggestedPrice={typeof suggestedPrice === 'number' ? suggestedPrice : parseFloat(String(suggestedPrice).replace(/[^0-9.-]/g, '')) || undefined}
          marketData={marketData}
          pricingData={pricingData}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="space-y-4">
          {/* Suggested Price */}
          {suggestedPrice && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suggested Price</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold text-foreground">{formatPrice(suggestedPrice)}</p>
              </CardContent>
            </Card>
          )}

          {/* Price Range */}
          {priceRange && (priceRange.low || priceRange.high) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Price Range</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  {priceRange.low && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Low</p>
                      <p className="text-lg font-semibold text-foreground">{formatPrice(priceRange.low)}</p>
                    </div>
                  )}
                  {priceRange.high && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">High</p>
                      <p className="text-lg font-semibold text-foreground">{formatPrice(priceRange.high)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Reasoning */}
        {reasoning && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pricing Reasoning</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-foreground leading-relaxed">{String(reasoning)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pricing Options - Full Width */}
      {options && isOptionsObject(options) && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pricing Options</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conservative Option */}
              {options.Conservative && (
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Conservative</h4>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {formatPrice(typeof options.Conservative === 'object' ? 
                        (getCaseInsensitiveValue(options.Conservative, 'price') || getCaseInsensitiveValue(options.Conservative, 'Price')) : 
                        options.Conservative)}
                    </p>
                  </div>
                  {typeof options.Conservative === 'object' && getCaseInsensitiveValue(options.Conservative, 'Pros') && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Pros:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{String(getCaseInsensitiveValue(options.Conservative, 'Pros'))}</p>
                    </div>
                  )}
                  {typeof options.Conservative === 'object' && getCaseInsensitiveValue(options.Conservative, 'Cons') && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Cons:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{String(getCaseInsensitiveValue(options.Conservative, 'Cons'))}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Market Value Option */}
              {(options.MarketValue || options["Market Value"]) && (
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Market Value</h4>
                    {(() => {
                      const marketValue = options.MarketValue || options["Market Value"];
                      return (
                        <>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {formatPrice(typeof marketValue === 'object' ? 
                              (getCaseInsensitiveValue(marketValue, 'price') || getCaseInsensitiveValue(marketValue, 'Price')) : 
                              marketValue)}
                          </p>
                          {typeof marketValue === 'object' && getCaseInsensitiveValue(marketValue, 'Pros') && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Pros:</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{String(getCaseInsensitiveValue(marketValue, 'Pros'))}</p>
                            </div>
                          )}
                          {typeof marketValue === 'object' && getCaseInsensitiveValue(marketValue, 'Cons') && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Cons:</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{String(getCaseInsensitiveValue(marketValue, 'Cons'))}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Premium Option */}
              {options.Premium && (
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Premium</h4>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {formatPrice(typeof options.Premium === 'object' ? 
                        (getCaseInsensitiveValue(options.Premium, 'price') || getCaseInsensitiveValue(options.Premium, 'Price')) : 
                        options.Premium)}
                    </p>
                  </div>
                  {typeof options.Premium === 'object' && getCaseInsensitiveValue(options.Premium, 'Pros') && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Pros:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{String(getCaseInsensitiveValue(options.Premium, 'Pros'))}</p>
                    </div>
                  )}
                  {typeof options.Premium === 'object' && getCaseInsensitiveValue(options.Premium, 'Cons') && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Cons:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{String(getCaseInsensitiveValue(options.Premium, 'Cons'))}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default PricingStrategy;

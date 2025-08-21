
import { MarketData, EnhancedMarketData, MarketDataUnion } from '../types';

/**
 * Extract market data from webhook response - handles both legacy and enhanced formats
 */
export const extractMarketData = (workingData: any): MarketDataUnion | undefined => {
  console.log('[MARKET DATA EXTRACTOR] ======= EXTRACTING MARKET DATA =======');
  console.log('[MARKET DATA EXTRACTOR] Full workingData received:', workingData);
  
  try {
    let marketDataFound = false;
    let transformedData: MarketDataUnion;

    // Check for enhanced market data format first (new structure)
    const checkEnhancedData = (rawData: any): EnhancedMarketData | null => {
      if (rawData && typeof rawData === 'object' && 'zipCode' in rawData && 'medianPrice' in rawData) {
        console.log('[MARKET DATA EXTRACTOR] ✅ FOUND ENHANCED market data format');
        return rawData as EnhancedMarketData;
      }
      return null;
    };

    // Check for direct marketData field first
    if (workingData.marketData) {
      console.log('[MARKET DATA EXTRACTOR] ✅ FOUND DIRECT marketData field:', workingData.marketData);
      
      const enhancedData = checkEnhancedData(workingData.marketData);
      if (enhancedData) {
        transformedData = enhancedData;
        marketDataFound = true;
        console.log('[MARKET DATA EXTRACTOR] ✅ Using enhanced market data format');
      } else {
        // Handle legacy format
        const rawMarketData = workingData.marketData;
        
        if (typeof rawMarketData === 'object' && rawMarketData !== null) {
          transformedData = {
            "Median Price": rawMarketData.medianPrice && typeof rawMarketData.medianPrice === 'number' && rawMarketData.medianPrice > 0
              ? `$${Math.round(rawMarketData.medianPrice).toLocaleString()}` 
              : 'N/A',
            "Current For Sale Inventory": rawMarketData.currentInventory && typeof rawMarketData.currentInventory === 'number' && rawMarketData.currentInventory > 0
              ? Math.round(rawMarketData.currentInventory).toLocaleString()
              : 'N/A',
            "Days on Market in the Last 6 Months": rawMarketData.daysOnMarket && typeof rawMarketData.daysOnMarket === 'object' && rawMarketData.daysOnMarket !== null
              ? rawMarketData.daysOnMarket 
              : {},
            "Median Price Last 6 months": (() => {
              if (!rawMarketData.priceHistory || typeof rawMarketData.priceHistory !== 'object' || rawMarketData.priceHistory === null) {
                return {};
              }
              const formatted: Record<string, string> = {};
              Object.entries(rawMarketData.priceHistory).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  formatted[key] = typeof value === 'number' 
                    ? `$${Math.round(value).toLocaleString()}` 
                    : String(value);
                }
              });
              return formatted;
            })()
          };

          // Store raw numeric values for utility functions - only if they exist and are valid
          if (rawMarketData.medianPrice && typeof rawMarketData.medianPrice === 'number') {
            (transformedData as any).medianPrice = rawMarketData.medianPrice;
          }
          if (rawMarketData.currentInventory && typeof rawMarketData.currentInventory === 'number') {
            (transformedData as any).currentInventory = rawMarketData.currentInventory;
          }
          if (rawMarketData.daysOnMarket && typeof rawMarketData.daysOnMarket === 'object') {
            (transformedData as any).daysOnMarket = rawMarketData.daysOnMarket;
          }
          if (rawMarketData.priceHistory && typeof rawMarketData.priceHistory === 'object') {
            (transformedData as any).priceHistory = rawMarketData.priceHistory;
          }
          
          marketDataFound = true;
          console.log('[MARKET DATA EXTRACTOR] ✅ Using legacy market data format');
        }
      }
    }
    
    // Check for data.marketData structure
    if (!marketDataFound && workingData.data && workingData.data.marketData) {
      console.log('[MARKET DATA EXTRACTOR] ✅ FOUND data.marketData field:', workingData.data.marketData);
      
      const enhancedData = checkEnhancedData(workingData.data.marketData);
      if (enhancedData) {
        transformedData = enhancedData;
        marketDataFound = true;
        console.log('[MARKET DATA EXTRACTOR] ✅ Using enhanced market data format from data.marketData');
      } else {
        // Handle legacy format from data.marketData
        const rawMarketData = workingData.data.marketData;
        
        transformedData = {
          "Median Price": rawMarketData.medianPrice && typeof rawMarketData.medianPrice === 'number' && rawMarketData.medianPrice > 0
            ? `$${Math.round(rawMarketData.medianPrice).toLocaleString()}` 
            : 'N/A',
          "Current For Sale Inventory": rawMarketData.currentInventory && typeof rawMarketData.currentInventory === 'number' && rawMarketData.currentInventory > 0
            ? Math.round(rawMarketData.currentInventory).toLocaleString()
            : 'N/A',
          "Days on Market in the Last 6 Months": rawMarketData.daysOnMarket && typeof rawMarketData.daysOnMarket === 'object' && rawMarketData.daysOnMarket !== null
            ? rawMarketData.daysOnMarket 
            : {},
          "Median Price Last 6 months": (() => {
            if (!rawMarketData.priceHistory || typeof rawMarketData.priceHistory !== 'object' || rawMarketData.priceHistory === null) {
              return {};
            }
            const formatted: Record<string, string> = {};
            Object.entries(rawMarketData.priceHistory).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                formatted[key] = typeof value === 'number' 
                  ? `$${Math.round(value).toLocaleString()}` 
                  : String(value);
              }
            });
            return formatted;
          })()
        };

        // Store raw numeric values for utility functions - only if they exist and are valid
        if (rawMarketData.medianPrice && typeof rawMarketData.medianPrice === 'number') {
          (transformedData as any).medianPrice = rawMarketData.medianPrice;
        }
        if (rawMarketData.currentInventory && typeof rawMarketData.currentInventory === 'number') {
          (transformedData as any).currentInventory = rawMarketData.currentInventory;
        }
        if (rawMarketData.daysOnMarket && typeof rawMarketData.daysOnMarket === 'object') {
          (transformedData as any).daysOnMarket = rawMarketData.daysOnMarket;
        }
        if (rawMarketData.priceHistory && typeof rawMarketData.priceHistory === 'object') {
          (transformedData as any).priceHistory = rawMarketData.priceHistory;
        }
        
        marketDataFound = true;
        console.log('[MARKET DATA EXTRACTOR] ✅ Using legacy market data format from data.marketData');
      }
    }
    
    if (!marketDataFound) {
      console.log('[MARKET DATA EXTRACTOR] ❌ No market data found');
      return undefined;
    }

    console.log('[MARKET DATA EXTRACTOR] ✅ FINAL TRANSFORMED market data:', transformedData);
    return transformedData;
    
  } catch (error) {
    console.error('[MARKET DATA EXTRACTOR] ERROR:', error);
    return undefined;
  }
};

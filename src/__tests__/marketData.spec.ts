
import { describe, it, expect } from 'vitest';
import { extractMarketData } from '../utils/webhook/parsers/marketDataExtractor';
import { getMedianPrice, getCurrentInventory, getAverageDaysOnMarket } from '../utils/marketDataUtils';

describe('Market Data Rendering', () => {
  const mockWebhookResponse = {
    marketData: {
      medianPrice: 891333.33,
      currentInventory: 15956.33,
      daysOnMarket: {
        "June 2025": 49,
        "May 2025": 48.33,
        "April 2025": 58.67
      },
      priceHistory: {
        "May 2025": 872196.73,
        "April 2025": 871761.79,
        "March 2025": 871058.50
      }
    }
  };

  it('should extract market data with both numeric and formatted values', () => {
    const result = extractMarketData(mockWebhookResponse);
    
    expect(result).toBeDefined();
    expect(result?.["Median Price"]).toBe("$891,333");
    expect(result?.["Current For Sale Inventory"]).toBe("15,956");
  });

  it('should format market values correctly', () => {
    const marketData = extractMarketData(mockWebhookResponse);
    
    const medianPrice = getMedianPrice(marketData);
    const inventory = getCurrentInventory(marketData);
    const avgDays = getAverageDaysOnMarket(marketData);
    
    expect(medianPrice).toBe("$891,333");
    expect(inventory).toBe("15,956");
    expect(avgDays).toBe("49 days");
  });

  it('should handle missing market data gracefully', () => {
    const emptyResponse = {};
    const result = extractMarketData(emptyResponse);
    
    expect(result).toBeUndefined();
    
    const medianPrice = getMedianPrice(undefined);
    const inventory = getCurrentInventory(undefined);
    const avgDays = getAverageDaysOnMarket(undefined);
    
    expect(medianPrice).toBe('N/A');
    expect(inventory).toBe('N/A');
    expect(avgDays).toBe('N/A');
  });
});

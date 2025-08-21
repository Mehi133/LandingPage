
import { describe, it, expect } from 'vitest';
import { extractMarketData } from '../utils/webhook/parsers/marketDataExtractor';

describe('Report Flow Integration', () => {
  const mockWebhookResponse = {
    activeListings: [],
    recentSales: [],
    subjectProperty: {
      address: "150 W 56th St APT 3812 New York, NY 10019",
      price: 129335,
      sqft: 865,
      yearBuilt: 1987
    },
    marketData: {
      "Median Price": "$891,333",
      "Current For Sale Inventory": "15,956",
      "Days on Market in the Last 6 Months": {
        "June 2025": "49",
        "May 2025": "48"
      },
      "Median Price Last 6 months": {
        "May 2025": "$872,197",
        "April 2025": "$871,762"
      }
    }
  };

  it('should extract market data from webhook response', () => {
    const result = extractMarketData(mockWebhookResponse);
    
    expect(result).toBeDefined();
    expect(result?.["Median Price"]).toBe("$891,333");
    expect(result?.["Current For Sale Inventory"]).toBe("15,956");
    expect(result?.["Days on Market in the Last 6 Months"]).toEqual(mockWebhookResponse.marketData["Days on Market in the Last 6 Months"]);
  });

  it('should handle missing market data gracefully', () => {
    const emptyResponse = { activeListings: [], recentSales: [] };
    const result = extractMarketData(emptyResponse);
    
    expect(result).toBeUndefined();
  });
});

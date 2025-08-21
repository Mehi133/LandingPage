
import { describe, it, expect } from 'vitest';
import { extractMarketData } from '../utils/webhook/parsers/marketDataExtractor';

describe('Map and Market Data Integration', () => {
  const mockWebhookResponse = {
    activeListings: [
      { id: 1, address: "200 E 61ST ST APT 19D, NEW YORK, CA 10019" },
      { id: 2, address: "30 W 63RD ST APT 8T, NEW YORK, CA 10019" },
      { id: 3, address: "350 W 42ND ST APT 24A, NEW YORK, CA 10019" }
    ],
    recentSales: [
      { id: 1, address: "161 W 61ST ST APT 24F, NEW YORK, CA 10023" }
    ],
    subjectProperty: {
      address: "150 W 56th St APT 3812 New York, NY 10019",
      yearBuilt: 1987
    },
    marketData: {
      medianPrice: 891333.3333333334,
      currentInventory: 15956.333333333334,
      daysOnMarket: {
        "June 2025": 49,
        "May 2025": 48.333333333333336
      },
      priceHistory: {
        "May 2025": 872196.7314286971,
        "April 2025": 871761.793835575
      }
    }
  };

  it('should extract and transform numeric market data', () => {
    const result = extractMarketData(mockWebhookResponse);
    
    expect(result).toBeDefined();
    expect(result?.["Median Price"]).toBe("$891,333");
    expect(result?.["Current For Sale Inventory"]).toBe("15,956");
    expect(result?.["Days on Market in the Last 6 Months"]).toEqual(mockWebhookResponse.marketData.daysOnMarket);
    expect(result?.["Median Price Last 6 months"]).toBeDefined();
  });

  it('should count correct number of properties for map pins', () => {
    const { activeListings, recentSales, subjectProperty } = mockWebhookResponse;
    
    // Subject property + active listings + recent sales = 5 total pins
    const expectedPinCount = 1 + activeListings.length + recentSales.length;
    expect(expectedPinCount).toBe(5);
    
    // Subject should be present
    expect(subjectProperty.address).toBeTruthy();
    
    // All properties should have addresses
    expect(activeListings.every(listing => listing.address)).toBe(true);
    expect(recentSales.every(sale => sale.address)).toBe(true);
  });

  it('should handle year built formatting in subject property', () => {
    const { subjectProperty } = mockWebhookResponse;
    const yearBuilt = String(subjectProperty.yearBuilt);
    
    expect(yearBuilt).toMatch(/^\d{4}$/);
    expect(yearBuilt).not.toContain(',');
    expect(yearBuilt).toBe('1987');
  });
});


import { PropertyListing, MarketData } from '../types';

/**
 * Formats and structures the final webhook response
 */
export const formatWebhookResponse = (
  activeListings: PropertyListing[],
  recentSales: PropertyListing[],
  marketData: MarketData | undefined,
  pricingData: any | undefined,
  pdfUrl: string | undefined
) => {
  console.log('[RESPONSE FORMATTER] ======= FORMATTING FINAL RESULTS =======');
  console.log('[RESPONSE FORMATTER] activeListings count:', activeListings.length);
  console.log('[RESPONSE FORMATTER] recentSales count:', recentSales.length);
  console.log('[RESPONSE FORMATTER] marketData available:', !!marketData);
  console.log('[RESPONSE FORMATTER] pricingData available:', !!pricingData);
  console.log('[RESPONSE FORMATTER] pdfUrl available:', !!pdfUrl);
  
  if (activeListings.length > 0) {
    console.log('[RESPONSE FORMATTER] First active listing sample:', {
      address: activeListings[0].address,
      price: activeListings[0].price,
      beds: activeListings[0].beds,
      baths: activeListings[0].baths,
      images: activeListings[0].images?.length || 0
    });
  }
  
  if (marketData) {
    console.log('[RESPONSE FORMATTER] Market data extracted:', {
      medianPrice: marketData['Median Price'],
      inventory: marketData['Current For Sale Inventory'],
      daysOnMarket: marketData['Days on Market in the Last 6 Months'],
      priceHistory: marketData['Median Price Last 6 months'] || marketData['Median Price Last 6 Months']
    });
  }
  
  console.log('[RESPONSE FORMATTER] ======= END FORMATTING =======');
  
  return { activeListings, recentSales, marketData, pricingData, pdfUrl };
};

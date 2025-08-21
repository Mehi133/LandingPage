
// Force production rebuild - updated timestamp
const PARSER_VERSION = `v2.2.${Date.now()}`;
console.log(`🔄 [PRODUCTION BUILD] responseParser loaded - ${PARSER_VERSION}`);

import { 
  PropertyListing, 
  MarketData, 
  PricingData, 
  WebhookResponse, 
  ConfirmationResponse 
} from './types';
import { processActiveListings, processRecentSales } from './parsers/listingsProcessor';
import { extractMarketData } from './parsers/marketDataExtractor';
import { getCaseInsensitiveValue } from './fieldAccessUtils';

/**
 * Parse webhook response and extract all relevant data
 */
export const parseWebhookResponse = (webhookData: any): ConfirmationResponse => {
  console.log(`🔄 [PRODUCTION PARSER] ${PARSER_VERSION} - PARSING WEBHOOK RESPONSE`);
  console.log('[PRODUCTION PARSER] Full webhook data received:', webhookData);
  console.log('[PRODUCTION PARSER] Webhook data type:', typeof webhookData);
  
  if (!webhookData || typeof webhookData !== 'object') {
    console.log('[PRODUCTION PARSER] ❌ Invalid webhook data');
    return {
      success: false,
      message: 'Invalid webhook response data',
      error: 'Invalid data structure'
    };
  }

  try {
    // Extract working data - handle both direct structure and nested structure
    let workingData = webhookData;
    
    // Check if data is nested under a key like 'data' or 'result'
    if (webhookData.data && typeof webhookData.data === 'object') {
      workingData = webhookData.data;
      console.log('[PRODUCTION PARSER] Found nested data structure, using webhookData.data');
    }
    
    console.log('[PRODUCTION PARSER] Working data keys:', Object.keys(workingData));

    // ======= PDF URL EXTRACTION =======
    let pdfUrl: string | undefined;
    
    if (workingData.pdfUrl && typeof workingData.pdfUrl === 'string') {
      pdfUrl = workingData.pdfUrl;
      console.log('[PRODUCTION PARSER] ✅ PDF URL extracted successfully:', pdfUrl);
    } else {
      console.log('[PRODUCTION PARSER] ⚠️ No PDF URL found');
    }

    // ======= PRICING DATA EXTRACTION WITH PRODUCTION FIX =======
    console.log(`🔥 [PRODUCTION PRICING ${PARSER_VERSION}] ======= STARTING PRICING EXTRACTION =======`);
    console.log('[PRODUCTION PRICING] Working data structure:', {
      keys: Object.keys(workingData),
      hasPricingStrategy: 'pricingStrategy' in workingData,
      pricingStrategyType: typeof workingData.pricingStrategy
    });

    let pricingData: PricingData;
    let foundPricingPath = '';

    try {
      let pricingArray: any[] | null = null;
      
      // STEP 1: Check for direct pricingStrategy field (VIEW LINK CASE)
      console.log('[PRODUCTION PRICING] STEP 1: Checking direct pricingStrategy field...');
      if (workingData.pricingStrategy) {
        console.log('[PRODUCTION PRICING] ✅ Found workingData.pricingStrategy');
        console.log('[PRODUCTION PRICING] Type:', typeof workingData.pricingStrategy);
        console.log('[PRODUCTION PRICING] Keys:', Object.keys(workingData.pricingStrategy || {}));
        
        let pricingStrategyObj = workingData.pricingStrategy;
        
        // If it's a string (JSON stored in database), parse it
        if (typeof workingData.pricingStrategy === 'string') {
          console.log('[PRODUCTION PRICING] 🔧 pricingStrategy is JSON string - parsing...');
          try {
            pricingStrategyObj = JSON.parse(workingData.pricingStrategy);
            console.log('[PRODUCTION PRICING] ✅ Successfully parsed JSON string');
            console.log('[PRODUCTION PRICING] Parsed object keys:', Object.keys(pricingStrategyObj));
          } catch (parseError) {
            console.error('[PRODUCTION PRICING] ❌ Failed to parse pricingStrategy JSON string:', parseError);
            pricingStrategyObj = null;
          }
        }
        
        // Now check for "Pricing Strategy" array inside the object
        if (pricingStrategyObj && typeof pricingStrategyObj === 'object') {
          console.log('[PRODUCTION PRICING] STEP 2: Looking for "Pricing Strategy" array...');
          console.log('[PRODUCTION PRICING] Available keys in pricingStrategyObj:', Object.keys(pricingStrategyObj));
          
          // Use case-insensitive lookup for "Pricing Strategy"
          const pricingStrategyArray = getCaseInsensitiveValue(pricingStrategyObj, 'Pricing Strategy');
          if (pricingStrategyArray && Array.isArray(pricingStrategyArray)) {
            console.log('[PRODUCTION PRICING] ✅ SUCCESS: Found "Pricing Strategy" array!');
            console.log('[PRODUCTION PRICING] Array length:', pricingStrategyArray.length);
            console.log('[PRODUCTION PRICING] First item keys:', pricingStrategyArray[0] ? Object.keys(pricingStrategyArray[0]) : 'none');
            pricingArray = pricingStrategyArray;
            foundPricingPath = 'workingData.pricingStrategy["Pricing Strategy"] (case-insensitive)';
          } else {
            console.log('[PRODUCTION PRICING] ❌ "Pricing Strategy" array not found in pricingStrategyObj');
          }
        }
      } else {
        console.log('[PRODUCTION PRICING] ❌ No direct pricingStrategy field found');
      }
      
      // FALLBACK 1: Check for case-insensitive pricingStrategy field
      if (!pricingArray) {
        console.log('[PRODUCTION PRICING] FALLBACK 1: Using case-insensitive lookup for pricingStrategy...');
        const pricingStrategyField = getCaseInsensitiveValue(workingData, 'pricingStrategy');
        
        if (pricingStrategyField) {
          console.log('[PRODUCTION PRICING] ✅ Found pricingStrategy using case-insensitive lookup');
          let pricingStrategyObj = pricingStrategyField;
          
          if (typeof pricingStrategyField === 'string') {
            try {
              pricingStrategyObj = JSON.parse(pricingStrategyField);
            } catch (e) {
              pricingStrategyObj = null;
            }
          }
          
          if (pricingStrategyObj) {
            const pricingStrategyArray = getCaseInsensitiveValue(pricingStrategyObj, 'Pricing Strategy');
            if (pricingStrategyArray && Array.isArray(pricingStrategyArray)) {
              pricingArray = pricingStrategyArray;
              foundPricingPath = 'case-insensitive pricingStrategy lookup';
            }
          }
        }
      }
      
      // FALLBACK 2: Check if already parsed (direct PricingStrategy array)
      if (!pricingArray && workingData.pricingData?.PricingStrategy && Array.isArray(workingData.pricingData.PricingStrategy)) {
        console.log('[PRODUCTION PRICING] FALLBACK 2: Found already-parsed pricingData.PricingStrategy');
        pricingArray = workingData.pricingData.PricingStrategy;
        foundPricingPath = 'workingData.pricingData (already parsed - will check for double nesting)';
      }
      // FALLBACK 3: Direct "Pricing Strategy" array
      else if (!pricingArray) {
        console.log('[PRODUCTION PRICING] FALLBACK 3: Looking for direct "Pricing Strategy" array...');
        const directPricingStrategy = getCaseInsensitiveValue(workingData, 'Pricing Strategy');
        if (directPricingStrategy && Array.isArray(directPricingStrategy)) {
          console.log('[PRODUCTION PRICING] ✅ Found direct "Pricing Strategy" array');
          pricingArray = directPricingStrategy;
          foundPricingPath = 'direct "Pricing Strategy" array';
        }
      }
      
      // Set final pricing data with DOUBLE NESTING FIX
      if (pricingArray && pricingArray.length > 0) {
        console.log('[PRODUCTION PRICING] 🔧 APPLYING DOUBLE NESTING FIX...');
        console.log('[PRODUCTION PRICING] First item in pricingArray:', pricingArray[0]);
        console.log('[PRODUCTION PRICING] First item keys:', Object.keys(pricingArray[0] || {}));
        
        // CHECK FOR DOUBLE NESTING - if first item has PricingStrategy, use that directly
        if (pricingArray[0] && pricingArray[0].PricingStrategy && Array.isArray(pricingArray[0].PricingStrategy)) {
          console.log('[PRODUCTION PRICING] 🎯 DOUBLE NESTING DETECTED! Using inner PricingStrategy array');
          pricingData = { PricingStrategy: pricingArray[0].PricingStrategy };
          foundPricingPath = `${foundPricingPath} (double nesting fixed)`;
        } else {
          console.log('[PRODUCTION PRICING] ✅ No double nesting detected, using array as is');
          pricingData = { PricingStrategy: pricingArray };
        }
        
        console.log('[PRODUCTION PRICING] ✅ SUCCESS: Final pricing data created');
        console.log('[PRODUCTION PRICING] Path used:', foundPricingPath);
        console.log('[PRODUCTION PRICING] Final PricingStrategy array length:', pricingData.PricingStrategy.length);
      } else {
        console.log('[PRODUCTION PRICING] ❌ FAILED: No pricing data found anywhere');
        pricingData = { PricingStrategy: [] };
        foundPricingPath = 'none (exhaustive search failed)';
      }
      
    } catch (error) {
      console.error('[PRODUCTION PRICING] ❌ Error in pricing extraction:', error);
      pricingData = { PricingStrategy: [] };
      foundPricingPath = `error: ${error.message}`;
    }

    console.log(`🔥 [PRODUCTION PRICING ${PARSER_VERSION}] ======= FINAL PRICING RESULTS =======`);
    console.log('[PRODUCTION PRICING] Found via path:', foundPricingPath);
    console.log('[PRODUCTION PRICING] Final pricingData structure:', {
      hasPricingStrategy: !!pricingData.PricingStrategy,
      length: pricingData.PricingStrategy?.length || 0,
      firstItemKeys: pricingData.PricingStrategy?.[0] ? Object.keys(pricingData.PricingStrategy[0]) : 'none'
    });

    // ======= ACTIVE LISTINGS EXTRACTION =======
    console.log('[PRODUCTION PARSER] ======= ACTIVE LISTINGS EXTRACTION =======');
    let activeListingsData = [];
    if (workingData.activeListings && Array.isArray(workingData.activeListings)) {
      activeListingsData = workingData.activeListings;
      console.log('[PRODUCTION PARSER] Found activeListings array with', activeListingsData.length, 'items');
    } else if (workingData.forSaleComparables && Array.isArray(workingData.forSaleComparables)) {
      activeListingsData = workingData.forSaleComparables;
      console.log('[PRODUCTION PARSER] Found forSaleComparables array with', activeListingsData.length, 'items');
    } else if (workingData["Active Listings"] && Array.isArray(workingData["Active Listings"])) {
      activeListingsData = workingData["Active Listings"];
      console.log('[PRODUCTION PARSER] Found "Active Listings" array with', activeListingsData.length, 'items');
    }
    
    const activeListings = activeListingsData.length > 0 ? processActiveListings(activeListingsData) : [];

    // ======= RECENT SALES EXTRACTION =======
    console.log('[PRODUCTION PARSER] ======= RECENT SALES EXTRACTION =======');
    let recentSalesData = [];
    if (workingData.recentSales && Array.isArray(workingData.recentSales)) {
      recentSalesData = workingData.recentSales;
      console.log('[PRODUCTION PARSER] Found recentSales array with', recentSalesData.length, 'items');
    } else if (workingData["Recent Sales"] && Array.isArray(workingData["Recent Sales"])) {
      recentSalesData = workingData["Recent Sales"];
      console.log('[PRODUCTION PARSER] Found "Recent Sales" array with', recentSalesData.length, 'items');
    }
    
    const recentSales = recentSalesData.length > 0 ? processRecentSales(recentSalesData) : [];

    // ======= MARKET DATA EXTRACTION =======
    console.log('[PRODUCTION PARSER] ======= MARKET DATA EXTRACTION =======');
    const marketData = extractMarketData(workingData);

    const result: ConfirmationResponse = {
      success: true,
      message: 'Report data processed successfully',
      activeListings,
      recentSales,
      marketData,
      pricingData,
      pdfUrl
    };

    console.log(`🔄 [PRODUCTION PARSER] ${PARSER_VERSION} - FINAL PARSED RESULT`);
    console.log('[PRODUCTION PARSER] Result keys:', Object.keys(result));
    console.log('[PRODUCTION PARSER] Active listings count:', activeListings?.length || 0);
    console.log('[PRODUCTION PARSER] Recent sales count:', recentSales?.length || 0);
    console.log('[PRODUCTION PARSER] Market data available:', !!marketData);
    console.log('[PRODUCTION PARSER] Pricing data available:', !!pricingData);
    console.log('[PRODUCTION PARSER] Pricing data PricingStrategy length:', pricingData?.PricingStrategy?.length || 0);
    console.log('[PRODUCTION PARSER] Used pricing path:', foundPricingPath);

    return result;

  } catch (error) {
    console.error(`🔄 [PRODUCTION PARSER] ${PARSER_VERSION} - Error parsing webhook response:`, error);
    return {
      success: false,
      message: 'Failed to parse webhook response',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

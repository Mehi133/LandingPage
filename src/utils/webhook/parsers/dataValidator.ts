
/**
 * Enhanced data validation and normalization for webhook responses
 * FIXED: Better handling of actual webhook response structure
 */
export const validateAndNormalizeResponse = (responseData: any) => {
  console.log('[DATA VALIDATOR] ======= VALIDATING WEBHOOK RESPONSE =======');
  console.log('[DATA VALIDATOR] Raw response type:', typeof responseData);
  console.log('[DATA VALIDATOR] Raw response keys:', Object.keys(responseData || {}));
  
  if (!responseData || typeof responseData !== 'object') {
    console.error('[DATA VALIDATOR] Invalid response data - not an object');
    return null;
  }
  
  // Initialize working data structure
  let workingData: any = {
    activeListings: [],
    recentSales: [],
    editFields3: undefined,
    pricingStrategy: undefined,
    pdfUrl: undefined
  };
  
  try {
    // CRITICAL FIX: Extract active listings from the actual webhook structure
    if (responseData.activeListings && Array.isArray(responseData.activeListings)) {
      console.log('[DATA VALIDATOR] ✅ Found direct activeListings array');
      workingData.activeListings = responseData.activeListings;
      console.log('[DATA VALIDATOR] Active listings count:', workingData.activeListings.length);
      
      // Log sample for debugging
      if (workingData.activeListings.length > 0) {
        console.log('[DATA VALIDATOR] First active listing sample:', workingData.activeListings[0]);
        console.log('[DATA VALIDATOR] First listing features:', workingData.activeListings[0]?.features);
        console.log('[DATA VALIDATOR] Bedrooms/bathrooms in first listing:', {
          beds: workingData.activeListings[0]?.beds,
          bedrooms: workingData.activeListings[0]?.bedrooms,
          baths: workingData.activeListings[0]?.baths,
          bathrooms: workingData.activeListings[0]?.bathrooms,
          featuresBedrooms: workingData.activeListings[0]?.features?.bedrooms,
          featuresBathrooms: workingData.activeListings[0]?.features?.bathrooms
        });
      }
    }
    
    // CRITICAL FIX: Extract recent sales from the actual webhook structure
    if (responseData.recentSales && Array.isArray(responseData.recentSales)) {
      console.log('[DATA VALIDATOR] ✅ Found direct recentSales array');
      workingData.recentSales = responseData.recentSales;
      console.log('[DATA VALIDATOR] Recent sales count:', workingData.recentSales.length);
      
      // Log sample for debugging
      if (workingData.recentSales.length > 0) {
        console.log('[DATA VALIDATOR] First recent sale sample:', workingData.recentSales[0]);
        console.log('[DATA VALIDATOR] First sale features:', workingData.recentSales[0]?.features);
        console.log('[DATA VALIDATOR] Bedrooms/bathrooms in first sale:', {
          beds: workingData.recentSales[0]?.beds,
          bedrooms: workingData.recentSales[0]?.bedrooms,
          baths: workingData.recentSales[0]?.baths,
          bathrooms: workingData.recentSales[0]?.bathrooms,
          featuresBedrooms: workingData.recentSales[0]?.features?.bedrooms,
          featuresBathrooms: workingData.recentSales[0]?.features?.bathrooms
        });
      }
    }
    
    // Extract market data from editFields3
    if (responseData.editFields3) {
      console.log('[DATA VALIDATOR] ✅ Found editFields3 for market data');
      workingData.editFields3 = responseData.editFields3;
      console.log('[DATA VALIDATOR] editFields3 structure:', {
        hasMessage: !!responseData.editFields3.message,
        hasContent: !!responseData.editFields3.message?.content,
        messageKeys: Object.keys(responseData.editFields3.message || {}),
        contentKeys: Object.keys(responseData.editFields3.message?.content || {})
      });
    }
    
    // Extract pricing data
    if (responseData.pricingStrategy) {
      console.log('[DATA VALIDATOR] ✅ Found pricingStrategy');
      workingData.pricingStrategy = responseData.pricingStrategy;
    }
    
    // Extract PDF URL
    if (responseData.pdfUrl) {
      console.log('[DATA VALIDATOR] ✅ Found pdfUrl');
      workingData.pdfUrl = responseData.pdfUrl;
    }
    
    console.log('[DATA VALIDATOR] ✅ VALIDATION SUCCESS');
    console.log('[DATA VALIDATOR] Final working data summary:', {
      activeListings: workingData.activeListings.length,
      recentSales: workingData.recentSales.length,
      hasMarketData: !!workingData.editFields3,
      hasPricingData: !!workingData.pricingStrategy,
      hasPdfUrl: !!workingData.pdfUrl
    });
    
    return workingData;
    
  } catch (validationError) {
    console.error('[DATA VALIDATOR] ❌ VALIDATION ERROR:', validationError);
    return null;
  }
};

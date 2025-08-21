
/**
 * Handles extraction of properties from numeric-keyed webhook responses
 * UPDATED: Now handles nested comparable structures like "Active Sales Comparables 1"
 */
export const extractPropertiesFromNumericKeys = (responseData: any) => {
  console.log('[NUMERIC KEY EXTRACTOR] Starting extraction from numeric keys');
  console.log('[NUMERIC KEY EXTRACTOR] Response data type:', typeof responseData);
  console.log('[NUMERIC KEY EXTRACTOR] Is array:', Array.isArray(responseData));
  
  if (!Array.isArray(responseData) || responseData.length === 0) {
    console.log('[NUMERIC KEY EXTRACTOR] Not an array or empty, returning empty array');
    return [];
  }
  
  const firstItem = responseData[0];
  console.log('[NUMERIC KEY EXTRACTOR] First item keys:', Object.keys(firstItem || {}));
  
  // UPDATED: Check for both numeric keys and comparable patterns
  const numericKeys = Object.keys(firstItem || {}).filter(key => /^\d+$/.test(key));
  const comparableKeys = Object.keys(firstItem || {}).filter(key => 
    key.includes('Sales Comparables') || 
    key.includes('for sale comparable') ||
    key.includes('Comparables')
  );
  
  console.log('[NUMERIC KEY EXTRACTOR] Found numeric keys:', numericKeys);
  console.log('[NUMERIC KEY EXTRACTOR] Found comparable keys:', comparableKeys);
  
  if (numericKeys.length === 0 && comparableKeys.length === 0) {
    console.log('[NUMERIC KEY EXTRACTOR] No numeric or comparable keys found');
    return [];
  }
  
  console.log('[NUMERIC KEY EXTRACTOR] NEW FORMAT DETECTED: Numeric-keyed or nested comparable properties');
  
  // Extract properties from numeric keys and comparable keys
  const extractedProperties = [];
  
  // Process numeric keys
  numericKeys.forEach(key => {
    const property = firstItem[key];
    console.log(`[NUMERIC KEY EXTRACTOR] Processing numeric key "${key}":`, {
      hasAddress: !!property?.Address,
      hasPrice: !!property?.Price,
      hasBeds: !!property?.['Number of Bedrooms'],
      hasBaths: !!property?.['Number of Bathrooms'],
      hasImages: !!property?.['Image URL']
    });
    if (property) extractedProperties.push(property);
  });
  
  // UPDATED: Process comparable keys 
  comparableKeys.forEach(key => {
    const property = firstItem[key];
    console.log(`[NUMERIC KEY EXTRACTOR] Processing comparable key "${key}":`, {
      hasAddress: !!property?.Address,
      hasPrice: !!property?.Price,
      hasBeds: !!property?.bedrooms || !!property?.['Number of Bedrooms'],
      hasBaths: !!property?.bathrooms || !!property?.['Number of Bathrooms'],
      hasImages: !!property?.imgScr || !!property?.['Image URL']
    });
    if (property) extractedProperties.push(property);
  });
  
  const validProperties = extractedProperties.filter(prop => prop !== null && prop !== undefined);
  console.log('[NUMERIC KEY EXTRACTOR] Extracted', validProperties.length, 'properties from all keys');
  return validProperties;
};

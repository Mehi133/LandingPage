
/**
 * CRITICAL FIX: Currency formatting with proper numeric handling for webhook data
 */
export const formatCurrency = (value: number | string): string => {
  console.log('[CURRENCY FORMAT] Input value:', value, 'Type:', typeof value);
  
  if (typeof value === 'number') {
    // Handle numeric values directly
    if (value === 0) {
      console.log('[CURRENCY FORMAT] Zero value detected, returning default');
      return 'Price not available';
    }
    const formatted = `$${value.toLocaleString()}`;
    console.log('[CURRENCY FORMAT] SUCCESS: Formatted numeric value:', formatted);
    return formatted;
  }
  
  if (typeof value === 'string') {
    // If it's already formatted as currency, return as is
    if (value.includes('$')) {
      console.log('[CURRENCY FORMAT] Already formatted currency:', value);
      return value;
    }
    // Otherwise, parse and format
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue) || numValue === 0) {
      console.log('[CURRENCY FORMAT] Invalid or zero string value:', value);
      return 'Price not available';
    }
    const formatted = `$${numValue.toLocaleString()}`;
    console.log('[CURRENCY FORMAT] SUCCESS: Formatted string value:', formatted);
    return formatted;
  }
  
  console.log('[CURRENCY FORMAT] Unhandled value type, returning default');
  return 'Price not available';
};

/**
 * CRITICAL FIX: Enhanced price extraction with UPPERCASE Price priority for webhook
 */
export const extractPriceFromProperty = (property: any): string => {
  console.log('[PRICE EXTRACT] Processing property for price:', property);
  console.log('[PRICE EXTRACT] Available keys:', Object.keys(property || {}));
  
  // NEW FORMAT: Try direct price field first (simplified structure)
  if (typeof property.price === 'number' && property.price > 0) {
    const result = formatCurrency(property.price);
    console.log('[PRICE EXTRACT] SUCCESS: From direct price field:', result);
    return result;
  }
  
  // FALLBACK: Handle UPPERCASE Price field 
  if (typeof property.Price === 'number' && property.Price > 0) {
    const result = formatCurrency(property.Price);
    console.log('[PRICE EXTRACT] SUCCESS: From uppercase Price field:', result);
    return result;
  }
  
  // Then try string/formatted prices (but skip if it's 0)
  if (property.Price && property.Price !== 0 && typeof property.Price !== 'number') {
    const result = formatCurrency(property.Price);
    console.log('[PRICE EXTRACT] From string uppercase Price field:', result);
    return result;
  }
  
  if (property.price && property.price !== 0 && typeof property.price !== 'number') {
    const result = formatCurrency(property.price);
    console.log('[PRICE EXTRACT] From string lowercase price field:', result);
    return result;
  }
  
  // ENHANCED: Try to extract from priceHistory for recent sales (especially when Price is 0)
  if (property.priceHistory && Array.isArray(property.priceHistory)) {
    console.log('[PRICE EXTRACT] Found priceHistory array:', property.priceHistory);
    
    // Look for 'Sold' events first
    for (const historyItem of property.priceHistory) {
      console.log('[PRICE EXTRACT] Checking history item:', historyItem);
      if (historyItem.event === 'Sold' && historyItem.price && historyItem.price !== 0) {
        const result = formatCurrency(historyItem.price);
        console.log('[PRICE EXTRACT] SUCCESS: From priceHistory (Sold):', result);
        return result;
      }
    }
    
    // If no sold event with price, look for any event with a valid price
    for (const historyItem of property.priceHistory) {
      if (historyItem.price && historyItem.price !== 0) {
        const result = formatCurrency(historyItem.price);
        console.log('[PRICE EXTRACT] From priceHistory (other):', result);
        return result;
      }
    }
  }
  
  // Try price from Additional Features
  if (property['Additional Features']?.price && property['Additional Features'].price !== 0) {
    const result = formatCurrency(property['Additional Features'].price);
    console.log('[PRICE EXTRACT] From Additional Features.price:', result);
    return result;
  }
  
  // ENHANCED: Try nested object price extraction
  if (property.propertyDetails?.price && property.propertyDetails.price !== 0) {
    const result = formatCurrency(property.propertyDetails.price);
    console.log('[PRICE EXTRACT] From propertyDetails.price:', result);
    return result;
  }
  
  console.log('[PRICE EXTRACT] FAILED: No valid price found, using default');
  console.log('[PRICE EXTRACT] Property structure for debugging:', JSON.stringify(property, null, 2).substring(0, 500));
  return 'Price not available';
};


/**
 * Enhanced address parsing for webhook responses
 * UPDATED: Handles new direct webhook format with comprehensive fallbacks
 */
export const parsePropertyAddress = (property: any): string => {
  console.log('[ADDRESS PARSER] ======= PARSING ADDRESS =======');
  console.log('[ADDRESS PARSER] Input property:', property);
  console.log('[ADDRESS PARSER] Property type:', typeof property);
  console.log('[ADDRESS PARSER] Property keys:', Object.keys(property || {}));
  
  if (!property || typeof property !== 'object') {
    console.log('[ADDRESS PARSER] Invalid or missing property object');
    return 'Address not available';
  }

  // PRIORITY 1: Direct address field (most common in new format)
  if (property.address && typeof property.address === 'string' && property.address.trim() !== '') {
    const directAddress = property.address.trim();
    console.log('[ADDRESS PARSER] ✅ SUCCESS: Found direct address field:', directAddress);
    return directAddress;
  }

  // PRIORITY 2: Standard address fields from webhook
  const addressFields = [
    'Address',
    'address', 
    'propertyAddress',
    'Property Address',
    'Properties Address',
    'fullAddress'
  ];

  for (const field of addressFields) {
    if (property[field] && typeof property[field] === 'string' && property[field].trim() !== '') {
      const foundAddress = property[field].trim();
      console.log(`[ADDRESS PARSER] ✅ SUCCESS: Found address in field "${field}":`, foundAddress);
      return foundAddress;
    }
  }

  // PRIORITY 3: Composite address from components
  console.log('[ADDRESS PARSER] Attempting composite address construction...');
  const addressComponents = [];
  
  // Street address components
  if (property['Street Number'] && property['Street Name']) {
    const streetNumber = String(property['Street Number']).trim();
    const streetName = String(property['Street Name']).trim();
    addressComponents.push(`${streetNumber} ${streetName}`);
    console.log('[ADDRESS PARSER] Added street components:', `${streetNumber} ${streetName}`);
  } else if (property.streetAddress) {
    addressComponents.push(String(property.streetAddress).trim());
    console.log('[ADDRESS PARSER] Added streetAddress:', property.streetAddress);
  }

  // City
  const cityFields = ['City', 'city', 'locality'];
  for (const field of cityFields) {
    if (property[field] && String(property[field]).trim() !== '') {
      addressComponents.push(String(property[field]).trim());
      console.log(`[ADDRESS PARSER] Added city from ${field}:`, property[field]);
      break;
    }
  }

  // State
  const stateFields = ['State', 'state', 'stateOrProvince', 'region'];
  for (const field of stateFields) {
    if (property[field] && String(property[field]).trim() !== '') {
      addressComponents.push(String(property[field]).trim());
      console.log(`[ADDRESS PARSER] Added state from ${field}:`, property[field]);
      break;
    }
  }

  // ZIP code
  const zipFields = ['ZIP Code', 'zipCode', 'postalCode', 'zip'];
  for (const field of zipFields) {
    if (property[field] && String(property[field]).trim() !== '') {
      addressComponents.push(String(property[field]).trim());
      console.log(`[ADDRESS PARSER] Added ZIP from ${field}:`, property[field]);
      break;
    }
  }

  if (addressComponents.length > 0) {
    const compositeAddress = addressComponents.join(', ');
    console.log('[ADDRESS PARSER] ✅ SUCCESS: Built composite address:', compositeAddress);
    return compositeAddress;
  }

  // PRIORITY 4: Last resort - try any field that might contain an address
  console.log('[ADDRESS PARSER] Attempting last resort address extraction...');
  const allKeys = Object.keys(property);
  for (const key of allKeys) {
    if (typeof property[key] === 'string' && 
        property[key].length > 10 && 
        property[key].length < 200 &&
        (property[key].includes(',') || property[key].includes(' ')) &&
        !key.toLowerCase().includes('url') &&
        !key.toLowerCase().includes('image') &&
        !key.toLowerCase().includes('description')) {
      
      console.log(`[ADDRESS PARSER] ✅ LAST RESORT: Found potential address in "${key}":`, property[key]);
      return property[key].trim();
    }
  }

  console.log('[ADDRESS PARSER] ❌ FAILED: Could not extract address from any field');
  console.log('[ADDRESS PARSER] Available fields for debugging:', Object.keys(property));
  return 'Address not available';
};

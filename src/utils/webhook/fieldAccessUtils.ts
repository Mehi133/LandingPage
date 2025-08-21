
/**
 * Utility functions for case-insensitive field access
 */

/**
 * Find a key in an object that matches the target key in a case-insensitive way,
 * handling spaces, underscores, and camelCase variations
 */
export const getCaseInsensitiveKey = (obj: any, targetKey: string): string | null => {
  console.log(`🔍 [FIELD ACCESS] getCaseInsensitiveKey called`);
  console.log(`🔍 [FIELD ACCESS] - Target key: "${targetKey}"`);
  console.log(`🔍 [FIELD ACCESS] - Object type: ${typeof obj}`);
  console.log(`🔍 [FIELD ACCESS] - Object null check: ${obj === null || obj === undefined}`);
  
  if (!obj || typeof obj !== 'object') {
    console.log(`🔍 [FIELD ACCESS] Object is null or not an object:`, typeof obj);
    return null;
  }
  
  const keys = Object.keys(obj);
  console.log(`🔍 [FIELD ACCESS] Available keys: [${keys.join(', ')}]`);
  
  // Normalize function - converts to lowercase and removes spaces/underscores
  const normalize = (str: string): string => {
    const result = str.toLowerCase().replace(/[\s_-]/g, '');
    console.log(`🔍 [FIELD ACCESS] Normalized "${str}" -> "${result}"`);
    return result;
  };
  
  const normalizedTarget = normalize(targetKey);
  console.log(`🔍 [FIELD ACCESS] Normalized target: "${normalizedTarget}"`);
  
  // Find matching key
  const matchingKey = keys.find(key => {
    const normalizedKey = normalize(key);
    const isMatch = normalizedKey === normalizedTarget;
    console.log(`🔍 [FIELD ACCESS] Comparing "${key}" (normalized: "${normalizedKey}") with target "${normalizedTarget}" -> Match: ${isMatch}`);
    return isMatch;
  });
  
  console.log(`🔍 [FIELD ACCESS] Final matching key: "${matchingKey}"`);
  return matchingKey || null;
};

/**
 * Get a value from an object using case-insensitive key lookup
 */
export const getCaseInsensitiveValue = (obj: any, targetKey: string): any => {
  console.log(`🔍 [FIELD ACCESS] ===== getCaseInsensitiveValue START =====`);
  console.log(`🔍 [FIELD ACCESS] Target key: "${targetKey}"`);
  console.log(`🔍 [FIELD ACCESS] Object keys: [${obj ? Object.keys(obj).join(', ') : 'none'}]`);
  console.log(`🔍 [FIELD ACCESS] Object preview:`, JSON.stringify(obj, null, 2).substring(0, 300));
  
  const matchingKey = getCaseInsensitiveKey(obj, targetKey);
  const result = matchingKey ? obj[matchingKey] : undefined;
  
  console.log(`🔍 [FIELD ACCESS] Final result summary:`);
  console.log(`🔍 [FIELD ACCESS] - Matching key found: "${matchingKey}"`);
  console.log(`🔍 [FIELD ACCESS] - Result exists: ${result !== undefined}`);
  console.log(`🔍 [FIELD ACCESS] - Result type: ${typeof result}`);
  console.log(`🔍 [FIELD ACCESS] - Result value:`, result);
  console.log(`🔍 [FIELD ACCESS] ===== getCaseInsensitiveValue END =====`);
  
  return result;
};

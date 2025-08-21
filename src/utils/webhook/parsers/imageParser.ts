
/**
 * Parse multiple image URLs from comma-separated string or direct array
 * UPDATED: Handles new webhook format with direct images array and ImgScr field
 * FIXED: Now handles object-wrapped values with _type and value properties
 */
export const parseImageUrls = (imgSrc: string | null | any, imgScr?: string | null | any, ImgScr?: string | null | any): string[] => {
  // Helper function to extract string value from potentially wrapped objects
  const extractStringValue = (field: any): string | null => {
    if (!field) return null;
    
    // If it's already a string, return it
    if (typeof field === 'string') return field;
    
    // If it's an object with value property, extract the value
    if (typeof field === 'object' && field.value !== undefined) {
      // Skip if the value is explicitly "undefined" string or null
      if (field.value === 'undefined' || field.value === null) return null;
      return String(field.value);
    }
    
    return null;
  };

  // Try new ImgScr field first, then imgScr, then fallback to imgSrc
  const imgScrValue = extractStringValue(ImgScr);
  const imgScrFallback = extractStringValue(imgScr);
  const imgSrcValue = extractStringValue(imgSrc);
  
  const imageString = imgScrValue || imgScrFallback || imgSrcValue;
  
  console.log('[IMAGE PARSER] Input values:', {
    ImgScr: ImgScr,
    imgScr: imgScr,
    imgSrc: imgSrc
  });
  console.log('[IMAGE PARSER] Extracted values:', {
    imgScrValue,
    imgScrFallback,
    imgSrcValue,
    finalImageString: imageString
  });
  
  if (!imageString) {
    console.log('[IMAGE PARSER] No valid image string found');
    return [];
  }
  
  const parsedImages = imageString.split(',').map(url => url.trim()).filter(url => url.length > 0);
  console.log('[IMAGE PARSER] Final parsed images:', parsedImages);
  
  return parsedImages;
};

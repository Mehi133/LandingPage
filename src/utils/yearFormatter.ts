
/**
 * Formats year built to always show 4 digits without commas
 */
export const formatYearBuilt = (yearBuilt: any): string => {
  if (!yearBuilt) return 'N/A';
  
  // Convert to string and remove any commas
  const yearStr = String(yearBuilt).replace(/,/g, '');
  
  // Parse as number and validate it's a reasonable year
  const year = parseInt(yearStr, 10);
  
  if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 10) {
    return 'N/A';
  }
  
  // Return exactly 4 digits
  return year.toString();
};


/**
 * Utility functions for extracting and formatting property data
 */

export const formatAge = (age?: number): number | null => {
  if (!age) return null;
  const currentYear = new Date().getFullYear();
  const builtYear = currentYear - age;
  return builtYear;
};

export const formatSqft = (sqft: any): string | null => {
  try {
    if (!sqft || sqft === 'N/A') return null;
    const numSqft = typeof sqft === 'string' ? parseInt(sqft.replace(/[^\d]/g, '')) : sqft;
    return isNaN(numSqft) ? null : `${numSqft.toLocaleString()} sqft`;
  } catch (error) {
    console.error('[MODAL DEBUG] Error formatting sqft:', error);
    return null;
  }
};

export const formatCurrency = (value: any): string | null => {
  try {
    if (!value || value === 0 || value === '0') return null;
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) : value;
    return isNaN(numValue) ? null : `$${numValue.toLocaleString()}`;
  } catch (error) {
    console.error('[MODAL DEBUG] Error formatting currency:', error);
    return null;
  }
};

export const formatPercentage = (value: any): string | null => {
  try {
    if (!value) return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? null : `${numValue}%`;
  } catch (error) {
    console.error('[MODAL DEBUG] Error formatting percentage:', error);
    return null;
  }
};

export const getPropertySize = (property: any): any => {
  try {
    return property?.sqft || 
           property?.livingAreaValue || 
           property?.["Building area (square footage)"] || 
           property?.buildingArea || 
           property?.["Additional Features"]?.livingArea ||
           null;
  } catch (error) {
    console.error('[MODAL DEBUG] Error getting property size:', error);
    return null;
  }
};

export const getBedrooms = (property: any): number => {
  try {
    return property?.beds || 
           property?.["Number of bedrooms"] || 
           property?.["Additional Features"]?.bedrooms || 
           0;
  } catch (error) {
    console.error('[MODAL DEBUG] Error getting bedrooms:', error);
    return 0;
  }
};

export const getBathrooms = (property: any): number => {
  try {
    return property?.baths || 
           property?.["Number of bathrooms"] || 
           property?.["Additional Features"]?.bathrooms || 
           0;
  } catch (error) {
    console.error('[MODAL DEBUG] Error getting bathrooms:', error);
    return 0;
  }
};

export const getLotSize = (property: any): string | null => {
  try {
    return property?.lotSize || property?.["Lot size"] || null;
  } catch (error) {
    console.error('[MODAL DEBUG] Error getting lot size:', error);
    return null;
  }
};

export const getPropertyAddress = (property: any): string => {
  try {
    return property?.address || 
           property?.["Properties Address"] || 
           property?.["Property Address"] || 
           property?.["Address"] || 
           'Address not available';
  } catch (error) {
    console.error('[MODAL DEBUG] Error getting property address:', error);
    return 'Address not available';
  }
};

export const getPropertyImages = (property: any): string[] => {
  try {
    let allImages: string[] = [];
    
    if (property?.images && Array.isArray(property.images)) {
      allImages = [...allImages, ...property.images];
    }
    
    if (property?.imgSrc) {
      const imgSrcUrls = property.imgSrc.split(',').map(url => url.trim()).filter(url => url.length > 0);
      allImages = [...allImages, ...imgSrcUrls];
    }
    
    return [...new Set(allImages)];
  } catch (error) {
    console.error('[MODAL DEBUG] Error getting property images:', error);
    return [];
  }
};

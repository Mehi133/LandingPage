
/**
 * Utilities for property comparison logic and highlighting
 */

export interface ComparisonAttribute {
  key: string;
  label: string;
  type: 'numeric' | 'boolean' | 'text';
  isHigherBetter?: boolean; // For numeric values, true if higher is better
  excludeFromSubject?: boolean; // If true, don't show this attribute for subject property
}

// Define comparison attributes - REMOVED PRICE from subject property display
export const COMPARISON_ATTRIBUTES: ComparisonAttribute[] = [
  { key: 'beds', label: 'Bedrooms', type: 'numeric', isHigherBetter: true },
  { key: 'baths', label: 'Bathrooms', type: 'numeric', isHigherBetter: true },
  { key: 'sqft', label: 'Square Footage', type: 'numeric', isHigherBetter: true },
  { key: 'lotSize', label: 'Lot Size', type: 'numeric', isHigherBetter: true },
  { key: 'yearBuilt', label: 'Year Built', type: 'numeric', isHigherBetter: true },
  { key: 'price', label: 'Price', type: 'numeric', isHigherBetter: false, excludeFromSubject: true },
  { key: 'hasPool', label: 'Pool', type: 'boolean' },
  { key: 'hasGarage', label: 'Garage', type: 'boolean' },
  { key: 'hasFireplace', label: 'Fireplace', type: 'boolean' },
  { key: 'hasCentralAir', label: 'Central Air', type: 'boolean' },
];

// Extract numeric value from lot size string for comparison
const extractLotSizeNumeric = (lotSizeStr: string): number => {
  if (!lotSizeStr || lotSizeStr === 'N/A' || lotSizeStr === '') {
    return 0;
  }
  
  const lotStr = String(lotSizeStr).toLowerCase();
  
  // Extract numeric value - handle decimals properly
  const numericMatch = lotStr.match(/(\d+\.?\d*)/);
  if (!numericMatch) {
    return 0;
  }
  
  const numericValue = parseFloat(numericMatch[1]);
  
  if (isNaN(numericValue)) {
    return 0;
  }
  
  // Convert acres to square feet for comparison (1 acre = 43,560 sq ft)
  if (lotStr.includes('acre')) {
    return numericValue * 43560;
  }
  
  // If it's already in square feet or just a number, return as is
  return numericValue;
};

// Extract comparison value from property
export const extractComparisonValue = (property: any, attribute: ComparisonAttribute): any => {
  switch (attribute.key) {
    case 'beds':
      return property.beds || property.bedrooms || 0;
    case 'baths':
      return property.baths || property.bathrooms || 0;
    case 'sqft':
      return property.sqft || property.livingAreaValue || property.buildingArea || 0;
    case 'lotSize':
      // For display, return formatted string; for comparison, we'll extract numeric separately
      return formatLotSize(property.lotSize || 'N/A');
    case 'yearBuilt':
      // Enhanced year built extraction - fix for showing 0
      let yearBuilt = null;
      if (property.features?.yearBuilt && property.features.yearBuilt !== 0) {
        yearBuilt = property.features.yearBuilt;
      } else if (property.yearBuilt && property.yearBuilt !== 0) {
        yearBuilt = property.yearBuilt;
      } else if (property["Year built"] && property["Year built"] !== 0) {
        yearBuilt = property["Year built"];
      } else if (property.buildingDetails?.yearBuilt && property.buildingDetails.yearBuilt !== 0) {
        yearBuilt = property.buildingDetails.yearBuilt;
      }
      return yearBuilt || 0;
    case 'price':
      return property.price || 0;
    case 'hasPool':
      return hasPoolFeature(property);
    case 'hasGarage':
      return hasFeature(property, ['garage', 'attached garage', 'parking']);
    case 'hasFireplace':
      return hasFeature(property, ['fireplace']);
    case 'hasCentralAir':
      return hasFeature(property, ['central air', 'hvac', 'air conditioning']);
    default:
      return 'N/A';
  }
};

// Enhanced pool detection specifically for subject property accuracy
const hasPoolFeature = (property: any): boolean => {
  console.log('🏊 Checking pool feature for property:', property);
  
  // Check direct pool properties first
  if (property.hasPool === true || property.hasPool === false) {
    console.log('🏊 Found direct hasPool property:', property.hasPool);
    return property.hasPool;
  }
  
  // Check pool features array
  if (property.poolFeatures && Array.isArray(property.poolFeatures) && property.poolFeatures.length > 0) {
    console.log('🏊 Found poolFeatures array:', property.poolFeatures);
    return true;
  }
  
  // Check features object for pool
  if (property.features) {
    if (property.features.hasPool === true || property.features.hasPool === false) {
      console.log('🏊 Found features.hasPool:', property.features.hasPool);
      return property.features.hasPool;
    }
    if (property.features.pool === true || property.features.pool === false) {
      console.log('🏊 Found features.pool:', property.features.pool);
      return property.features.pool;
    }
  }
  
  // Fallback to text search - but be more specific
  const searchText = JSON.stringify(property).toLowerCase();
  const hasPoolMention = searchText.includes('"pool"') || 
                        searchText.includes('swimming pool') || 
                        searchText.includes('pool features');
  
  console.log('🏊 Pool text search result:', hasPoolMention);
  return hasPoolMention;
};

// Helper function to check if property has a feature
const hasFeature = (property: any, keywords: string[]): boolean => {
  const searchText = JSON.stringify(property).toLowerCase();
  return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
};

// Format lot size with proper units
const formatLotSize = (lotSize: any): string => {
  if (!lotSize || lotSize === 'N/A' || lotSize === '') {
    return 'N/A';
  }
  
  const lotStr = String(lotSize).toLowerCase();
  
  // If it already has units, return as is
  if (lotStr.includes('acres') || lotStr.includes('sq ft') || lotStr.includes('sqft')) {
    return String(lotSize);
  }
  
  // Parse numeric value
  const numericMatch = lotStr.match(/(\d+\.?\d*)/);
  if (!numericMatch) {
    return String(lotSize);
  }
  
  const numericValue = parseFloat(numericMatch[1]);
  
  if (isNaN(numericValue)) {
    return String(lotSize);
  }
  
  // If the number is small (likely acres), format as acres
  if (numericValue < 10) {
    return `${numericValue} acres`;
  }
  
  // If the number is large (likely square feet), format as sq ft
  if (numericValue > 1000) {
    return `${numericValue.toLocaleString()} sq ft`;
  }
  
  // Default to the original value with context
  return String(lotSize);
};

// Format value for display
export const formatComparisonValue = (value: any, attribute: ComparisonAttribute): string => {
  if (value === null || value === undefined || value === 'N/A') {
    return 'N/A';
  }

  switch (attribute.type) {
    case 'numeric':
      if (attribute.key === 'price') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Number(value));
      }
      if (attribute.key === 'sqft') {
        return `${Number(value).toLocaleString()} sq ft`;
      }
      if (attribute.key === 'lotSize') {
        // Value is already formatted from extractComparisonValue
        return String(value);
      }
      return String(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'text':
      return String(value);
    default:
      return String(value);
  }
};

// Get comparison result for highlighting
export const getComparisonResult = (
  subjectValue: any, 
  comparableValue: any, 
  attribute: ComparisonAttribute
): 'better' | 'worse' | 'equal' | 'neutral' => {
  
  // For price attribute, return neutral for all comparables when subject property is excluded
  if (attribute.key === 'price' && attribute.excludeFromSubject) {
    return 'neutral';
  }
  
  if (attribute.type === 'boolean') {
    if (subjectValue === comparableValue) return 'equal';
    return comparableValue ? 'better' : 'worse';
  }

  if (attribute.type === 'numeric') {
    let subjectNum = 0;
    let comparableNum = 0;
    
    // Special handling for lot size comparison
    if (attribute.key === 'lotSize') {
      subjectNum = extractLotSizeNumeric(String(subjectValue));
      comparableNum = extractLotSizeNumeric(String(comparableValue));
      console.log(`🔍 Lot size comparison: Subject "${subjectValue}" (${subjectNum}) vs Comparable "${comparableValue}" (${comparableNum})`);
    } else {
      subjectNum = Number(subjectValue) || 0;
      comparableNum = Number(comparableValue) || 0;
    }
    
    if (subjectNum === comparableNum) return 'equal';
    
    if (attribute.isHigherBetter) {
      return comparableNum > subjectNum ? 'better' : 'worse';
    } else {
      return comparableNum < subjectNum ? 'better' : 'worse';
    }
  }

  return 'neutral';
};

// Get CSS classes for highlighting
export const getHighlightClasses = (result: 'better' | 'worse' | 'equal' | 'neutral'): string => {
  switch (result) {
    case 'better':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'worse':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'equal':
      return 'bg-gray-50 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
};

// Convert boolean to checkmark/X
export const formatBooleanDisplay = (value: boolean): string => {
  return value ? '✓' : '✗';
};

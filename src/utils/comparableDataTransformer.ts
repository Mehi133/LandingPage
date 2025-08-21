import { extractDisplayAddress } from '@/components/report-sections/utils/propertyDisplayUtils';
import { parseComplexFeatureString, formatPropertyValue, formatFeatureText } from './propertyDataParser';

/**
 * Parses "At a Glance Facts" string and extracts individual fields
 */
const parseAtAGlanceFacts = (factsString: string): Record<string, string> => {
  console.log('🔍 Parsing At a Glance Facts:', factsString);
  
  const facts: Record<string, string> = {};
  
  if (!factsString || typeof factsString !== 'string') {
    return facts;
  }
  
  // Split by "Fact Label:" to get individual facts
  const factParts = factsString.split(/Fact Label:\s*/i).filter(part => part.trim());
  
  factParts.forEach(part => {
    // Match pattern: "Label, Fact Value: Value"
    const match = part.match(/^([^,]+),\s*Fact Value:\s*(.+?)(?=,\s*Fact Label:|$)/i);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      
      // Skip "Days on Zillow" as requested
      if (!label.toLowerCase().includes('days on zillow') && 
          !label.toLowerCase().includes('daysonzillow')) {
        facts[label] = value;
      }
    }
  });
  
  console.log('✅ Parsed At a Glance Facts:', facts);
  return facts;
};

/**
 * Enhanced categorization with all requested categories - COMPLETELY REWRITTEN
 */
const processFeaturesByCategory = (features: any[], transformed: Record<string, any>): void => {
  console.log('🔄 Processing features by category:', features);
  
  const categories = {
    utilities: [] as string[],
    heating: [] as string[],
    appliances: [] as string[],
    rooms: [] as string[],
    securityFeatures: [] as string[],
    patioAndPorch: [] as string[],
    livingQuarters: [] as string[],
    listingTerms: [] as string[],
    other: [] as string[]
  };
  
  // Categorize features with enhanced logic
  features.forEach(feature => {
    const featureText = typeof feature === 'string' ? feature : 
                       (feature?.name || feature?.description || feature?.type || '');
    
    if (!featureText || typeof featureText !== 'string') return;
    
    const lowerFeature = featureText.toLowerCase();
    console.log('🔍 Categorizing feature:', featureText);
    
    // Utilities (cable, electricity, water, sewer, etc.)
    if (lowerFeature.includes('cable') || lowerFeature.includes('electricity') || 
        lowerFeature.includes('electric') || lowerFeature.includes('water') || 
        lowerFeature.includes('sewer') || lowerFeature.includes('internet') ||
        lowerFeature.includes('utility') || lowerFeature.includes('utilities') ||
        lowerFeature.includes('gas') || lowerFeature.includes('trash') ||
        lowerFeature.includes('power') || lowerFeature.includes('service')) {
      categories.utilities.push(formatFeatureText(featureText));
      console.log('✅ Added to utilities:', featureText);
    }
    // Heating systems
    else if (lowerFeature.includes('heating') || lowerFeature.includes('heat') || 
             lowerFeature.includes('furnace') || lowerFeature.includes('boiler') ||
             lowerFeature.includes('hvac') || lowerFeature.includes('central air') ||
             lowerFeature.includes('air conditioning') || lowerFeature.includes('cooling') ||
             lowerFeature.includes('forced air') || lowerFeature.includes('heat pump') ||
             lowerFeature.includes('natural gas')) {
      categories.heating.push(formatFeatureText(featureText));
      console.log('✅ Added to heating:', featureText);
    }
    // Appliances
    else if (lowerFeature.includes('appliance') || lowerFeature.includes('dishwasher') || 
             lowerFeature.includes('refrigerator') || lowerFeature.includes('oven') || 
             lowerFeature.includes('microwave') || lowerFeature.includes('washer') || 
             lowerFeature.includes('dryer') || lowerFeature.includes('stove') ||
             lowerFeature.includes('range') || lowerFeature.includes('disposal') ||
             lowerFeature.includes('freezer') || lowerFeature.includes('dishwashing')) {
      categories.appliances.push(formatFeatureText(featureText));
      console.log('✅ Added to appliances:', featureText);
    }
    // Security Features
    else if (lowerFeature.includes('security') || lowerFeature.includes('alarm') || 
             lowerFeature.includes('camera') || lowerFeature.includes('gate') ||
             lowerFeature.includes('fence') || lowerFeature.includes('locked') ||
             lowerFeature.includes('surveillance') || lowerFeature.includes('safe') ||
             lowerFeature.includes('detector') || lowerFeature.includes('smoke') ||
             lowerFeature.includes('carbon monoxide')) {
      categories.securityFeatures.push(formatFeatureText(featureText));
      console.log('✅ Added to security:', featureText);
    }
    // Patio and Porch
    else if (lowerFeature.includes('patio') || lowerFeature.includes('porch') || 
             lowerFeature.includes('deck') || lowerFeature.includes('balcony') ||
             lowerFeature.includes('outdoor') || lowerFeature.includes('terrace') ||
             lowerFeature.includes('veranda') || lowerFeature.includes('yard')) {
      categories.patioAndPorch.push(formatFeatureText(featureText));
      console.log('✅ Added to patio/porch:', featureText);
    }
    // Living Quarters
    else if (lowerFeature.includes('living quarter') || lowerFeature.includes('unit') ||
             lowerFeature.includes('area total') || lowerFeature.includes('living area') ||
             lowerFeature.includes('square footage') || lowerFeature.includes('floor plan') ||
             lowerFeature.includes('space') || lowerFeature.includes('sq ft')) {
      categories.livingQuarters.push(formatFeatureText(featureText));
      console.log('✅ Added to living quarters:', featureText);
    }
    // Listing Terms
    else if (lowerFeature.includes('listing') || lowerFeature.includes('terms') ||
             lowerFeature.includes('condition') || lowerFeature.includes('status') ||
             lowerFeature.includes('market') || lowerFeature.includes('sale') ||
             lowerFeature.includes('price') || lowerFeature.includes('availability')) {
      categories.listingTerms.push(formatFeatureText(featureText));
      console.log('✅ Added to listing terms:', featureText);
    }
    // Rooms
    else if (lowerFeature.includes('bedroom') || lowerFeature.includes('bathroom') || 
             lowerFeature.includes('dining') || lowerFeature.includes('living room') || 
             lowerFeature.includes('family room') || lowerFeature.includes('office') || 
             lowerFeature.includes('media room') || lowerFeature.includes('kitchen') ||
             lowerFeature.includes('closet') || lowerFeature.includes('room') ||
             lowerFeature.includes('basement') || lowerFeature.includes('attic') ||
             lowerFeature.includes('garage') || lowerFeature.includes('laundry') ||
             lowerFeature.includes('level') || lowerFeature.includes('upper') ||
             lowerFeature.includes('main') || lowerFeature.includes('primary')) {
      categories.rooms.push(formatFeatureText(featureText));
      console.log('✅ Added to rooms:', featureText);
    }
    // Other features
    else {
      categories.other.push(formatFeatureText(featureText));
      console.log('✅ Added to other:', featureText);
    }
  });
  
  // Add sections with proper headers - CREATE INDIVIDUAL ITEMS FOR EACH FEATURE
  if (categories.utilities.length > 0) {
    transformed['=== Utilities ==='] = 'Section Header';
    categories.utilities.forEach((utility, index) => {
      transformed[`Utility_${index + 1}`] = utility;
    });
    console.log('✅ Added Utilities section with', categories.utilities.length, 'individual items');
  }
  
  if (categories.heating.length > 0) {
    transformed['=== Heating ==='] = 'Section Header';
    categories.heating.forEach((heating, index) => {
      transformed[`Heating_${index + 1}`] = heating;
    });
    console.log('✅ Added Heating section with', categories.heating.length, 'individual items');
  }
  
  if (categories.appliances.length > 0) {
    transformed['=== Appliances ==='] = 'Section Header';
    categories.appliances.forEach((appliance, index) => {
      transformed[`Appliance_${index + 1}`] = appliance;
    });
    console.log('✅ Added Appliances section with', categories.appliances.length, 'individual items');
  }
  
  if (categories.securityFeatures.length > 0) {
    transformed['=== Security Features ==='] = 'Section Header';
    categories.securityFeatures.forEach((security, index) => {
      transformed[`Security_Feature_${index + 1}`] = security;
    });
    console.log('✅ Added Security section with', categories.securityFeatures.length, 'individual items');
  }
  
  if (categories.patioAndPorch.length > 0) {
    transformed['=== Patio And Porch Features ==='] = 'Section Header';
    categories.patioAndPorch.forEach((patio, index) => {
      transformed[`Patio_Feature_${index + 1}`] = patio;
    });
    console.log('✅ Added Patio/Porch section with', categories.patioAndPorch.length, 'individual items');
  }
  
  if (categories.livingQuarters.length > 0) {
    transformed['=== Living Quarters ==='] = 'Section Header';
    categories.livingQuarters.forEach((living, index) => {
      transformed[`Living_Quarter_${index + 1}`] = living;
    });
    console.log('✅ Added Living Quarters section with', categories.livingQuarters.length, 'individual items');
  }
  
  if (categories.listingTerms.length > 0) {
    transformed['=== Listing Terms ==='] = 'Section Header';
    categories.listingTerms.forEach((term, index) => {
      transformed[`Listing_Term_${index + 1}`] = term;
    });
    console.log('✅ Added Listing Terms section with', categories.listingTerms.length, 'individual items');
  }
  
  if (categories.rooms.length > 0) {
    transformed['=== Rooms ==='] = 'Section Header';
    categories.rooms.forEach((room, index) => {
      transformed[`Room_${index + 1}`] = room;
    });
    console.log('✅ Added Rooms section with', categories.rooms.length, 'individual items');
  }
  
  // Add other features if any
  if (categories.other.length > 0) {
    categories.other.forEach((feature, index) => {
      transformed[`Additional_Feature_${index + 1}`] = feature;
    });
    console.log('✅ Added Other features:', categories.other.length, 'individual items');
  }
  
  console.log('✅ Final transformed object keys:', Object.keys(transformed));
};

/**
 * Categorizes features into specific sections (legacy function - kept for compatibility)
 */
const categorizeFeatures = (features: any[]): Record<string, string[]> => {
  const categories = {
    appliances: [] as string[],
    patioAndPorch: [] as string[],
    livingQuarters: [] as string[],
    rooms: [] as string[],
    other: [] as string[]
  };
  
  features.forEach(feature => {
    const featureText = typeof feature === 'string' ? feature : 
                       (feature?.name || feature?.description || feature?.type || '');
    
    if (!featureText) return;
    
    const lowerFeature = featureText.toLowerCase();
    
    // Appliances
    if (lowerFeature.includes('appliance') || lowerFeature.includes('dishwasher') || 
        lowerFeature.includes('refrigerator') || lowerFeature.includes('oven') || 
        lowerFeature.includes('microwave') || lowerFeature.includes('washer') || 
        lowerFeature.includes('dryer') || lowerFeature.includes('stove')) {
      categories.appliances.push(formatFeatureText(featureText));
    }
    // Patio and Porch
    else if (lowerFeature.includes('patio') || lowerFeature.includes('porch') || 
             lowerFeature.includes('deck') || lowerFeature.includes('balcony')) {
      categories.patioAndPorch.push(formatFeatureText(featureText));
    }
    // Living Quarters
    else if (lowerFeature.includes('living quarter') || lowerFeature.includes('unit') ||
             lowerFeature.includes('area total') || lowerFeature.includes('living area')) {
      categories.livingQuarters.push(formatFeatureText(featureText));
    }
    // Rooms
    else if (lowerFeature.includes('bedroom') || lowerFeature.includes('bathroom') || 
             lowerFeature.includes('dining') || lowerFeature.includes('living room') || 
             lowerFeature.includes('family room') || lowerFeature.includes('office') || 
             lowerFeature.includes('media room') || lowerFeature.includes('kitchen')) {
      categories.rooms.push(formatFeatureText(featureText));
    }
    // Other features
    else {
      categories.other.push(formatFeatureText(featureText));
    }
  });
  
  return categories;
};

/**
 * Transforms comparable property data to work with PropertyFeatureDisplay
 */
export const transformComparableForFeatureDisplay = (property: any): Record<string, any> => {
  console.log('🔄 [TRANSFORM] Transforming comparable property for feature display:', property);
  
  if (!property || typeof property !== 'object') {
    console.warn('⚠️ [TRANSFORM] Invalid property data provided for transformation');
    return {};
  }

  const transformed: Record<string, any> = {};

  // Handle basic fields first
  const basicFields = {
    'Beds': property.beds || property.bedrooms || property['Number of bedrooms'],
    'Baths': property.baths || property.bathrooms || property['Number of bathrooms'],
    'Living Area': property.sqft || property.squareFootage || property.livingArea || property.buildingArea,
    'Year Built': property.yearBuilt || property['Year Built'],
    'Property Type': property.propertyType || property.homeType || property.propertySubType,
    'Lot Size': property.lotSize || property['Lot size'],
    'Price': property.price,
    'Status': property.status,
    'Days On Market': property.daysOnMarket,
  };

  // Add basic fields that have meaningful values
  Object.entries(basicFields).forEach(([key, value]) => {
    const formattedValue = formatPropertyValue(value, key);
    if (formattedValue && formattedValue !== 'N/A' && formattedValue !== 'Unknown') {
      transformed[key] = formattedValue;
    }
  });

  // Parse "At a Glance Facts" if present and add as individual fields with section header
  const atAGlanceFields = [
    'atAGlanceFacts', 'atAglanceFacts', 'at a glance facts', 'ataglancefacts', 
    'At AGlance Facts', 'At A Glance Facts', 'atAGlanceFacts'
  ];
  
  let hasAtAGlanceFacts = false;
  for (const fieldName of atAGlanceFields) {
    if (property[fieldName]) {
      console.log(`🔍 [TRANSFORM] Found At a Glance Facts in field: ${fieldName}`);
      const parsedFacts = parseAtAGlanceFacts(property[fieldName]);
      if (Object.keys(parsedFacts).length > 0) {
        transformed['=== At A Glance Facts ==='] = 'Section Header';
        Object.entries(parsedFacts).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            transformed[formatFeatureText(key)] = value;
          }
        });
        hasAtAGlanceFacts = true;
      }
      break; // Only process the first match
    }
  }

  // Handle features array or complex features and create dedicated sections with individual fields
  if (property.features) {
    console.log('🔍 [TRANSFORM] Processing features:', property.features);
    
    if (Array.isArray(property.features)) {
      // Process features and add as individual fields within sections
      console.log('🔄 [TRANSFORM] Features is array, processing by category');
      processFeaturesByCategory(property.features, transformed);
    } else if (typeof property.features === 'string') {
      // Handle features as string
      console.log('🔄 [TRANSFORM] Features is string, parsing complex features');
      const parsedFeatures = parseComplexFeatureString(property.features);
      Object.entries(parsedFeatures).forEach(([category, features]) => {
        if (features.length > 0) {
          const categoryName = formatFeatureText(category);
          transformed[categoryName] = features.join(', ');
        }
      });
    } else if (typeof property.features === 'object') {
      // Handle features as object
      console.log('🔄 [TRANSFORM] Features is object, processing entries');
      Object.entries(property.features).forEach(([key, value]) => {
        const formattedValue = formatPropertyValue(value, key);
        if (formattedValue && formattedValue.trim() !== '') {
          const formattedKey = formatFeatureText(key);
          transformed[formattedKey] = formattedValue;
        }
      });
    }
  }

  // Define fields to skip completely - enhanced to catch all variations and REMOVE schools
  const skipFields = [
    'beds', 'bedrooms', 'baths', 'bathrooms', 'sqft', 'squareFootage', 
    'livingArea', 'buildingArea', 'yearBuilt', 'propertyType', 'homeType', 
    'propertySubType', 'lotSize', 'price', 'status', 'daysOnMarket', 
    'daysOnZillow', 'features', 'address', 'images', 'photos', 'media',
    'id', '_id', '__typename', 'userType', 'virtualTour', 'taxHistory',
    'priceHistory', 'atAGlanceFacts', 'atAglanceFacts', 'at a glance facts',
    'ataglancefacts', 'At AGlance Facts', 'onMarketDate', 'on market date',
    'onmarketdate', 'On Market Date', 'ataglanacefacts', 'ataglancefacts',
    // REMOVE SCHOOLS COMPLETELY
    'schools', 'Schools', 'school', 'School', 'schoolData', 'schoolInfo'
  ];

  // Define duplicate detection pairs (keep first, remove second)
  const duplicatePairs = [
    ['Living Area', 'Building Area'],
    ['Living Area', 'Building area (square footage)'],
    ['Square Footage', 'Building Area'],
    ['Square Footage', 'Living Area']
  ];

  // Process remaining fields, skipping already processed ones
  Object.entries(property).forEach(([key, value]) => {
    // Enhanced skip check with better normalization
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    
    const shouldSkip = skipFields.some(skip => {
      const normalizedSkip = skip.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      return normalizedKey === normalizedSkip || 
             normalizedKey.includes(normalizedSkip) || 
             normalizedSkip.includes(normalizedKey);
    });

    if (shouldSkip) {
      console.log(`⏭️ [TRANSFORM] Skipping field: ${key}`);
      return;
    }

    const formattedValue = formatPropertyValue(value, key);
    if (formattedValue && formattedValue.trim() !== '') {
      const formattedKey = formatFeatureText(key);
      if (formattedKey && !transformed[formattedKey]) {
        transformed[formattedKey] = formattedValue;
      }
    }
  });

  // Remove duplicates based on duplicate pairs
  duplicatePairs.forEach(([keep, remove]) => {
    if (transformed[keep] && transformed[remove]) {
      // If values are similar (same number), remove the second one
      const keepValue = String(transformed[keep]).replace(/[^0-9]/g, '');
      const removeValue = String(transformed[remove]).replace(/[^0-9]/g, '');
      if (keepValue === removeValue) {
        delete transformed[remove];
        console.log(`🧹 [TRANSFORM] Removed duplicate field: ${remove} (kept ${keep})`);
      }
    }
  });

  console.log('✅ [TRANSFORM] Final transformed property data keys:', Object.keys(transformed));
  console.log('✅ [TRANSFORM] Final transformed property data:', transformed);
  return transformed;
};

/**
 * Extracts and validates address for geocoding
 */
export const extractAddressForGeocoding = (property: any): string | null => {
  console.log('🔍 Extracting address for geocoding:', property);
  
  if (!property) {
    console.error('❌ No property provided for address extraction');
    return null;
  }
  
  // Try multiple address extraction methods
  let address = null;
  
  // Method 1: Use existing utility
  try {
    address = extractDisplayAddress(property);
    if (address && address !== 'Address not available' && address.length > 5) {
      console.log('✅ Address extracted via utility:', address);
      return address.trim();
    }
  } catch (error) {
    console.warn('⚠️ Address extraction utility failed:', error);
  }
  
  // Method 2: Direct address field
  if (property.address && typeof property.address === 'string' && property.address.trim().length > 5) {
    address = property.address.trim();
    console.log('✅ Address extracted directly:', address);
    return address;
  }
  
  // Method 3: Construct from components
  if (property.street || property.city || property.state) {
    const parts = [
      property.street || property.streetName,
      property.city,
      property.state,
      property.zipCode || property.zip
    ].filter(part => part && typeof part === 'string' && part.trim() !== '');
    
    if (parts.length >= 2) {
      address = parts.join(', ');
      console.log('✅ Address constructed from components:', address);
      return address;
    }
  }
  
  console.error('❌ Failed to extract valid address from property:', property);
  return null;
};


/**
 * Enhanced property data parser for better feature extraction and formatting
 */

export const parseComplexFeatureString = (featuresString: string): Record<string, string[]> => {
  if (!featuresString || typeof featuresString !== 'string') {
    return {};
  }

  const categories: Record<string, string[]> = {
    rooms: [],
    appliances: [],
    utilities: [],
    exterior: [],
    interior: [],
    other: []
  };

  // Split by commas and clean each feature
  const features = featuresString.split(',').map(f => f.trim()).filter(Boolean);

  features.forEach(feature => {
    const cleanFeature = formatFeatureText(feature);
    if (!cleanFeature || cleanFeature.includes('http') || cleanFeature.includes('www.')) {
      return; // Skip URLs and empty features
    }

    // Categorize features
    const lowerFeature = feature.toLowerCase();
    
    if (lowerFeature.includes('bedroom') || lowerFeature.includes('bathroom') || 
        lowerFeature.includes('kitchen') || lowerFeature.includes('dining') ||
        lowerFeature.includes('living') || lowerFeature.includes('family room') ||
        lowerFeature.includes('office') || lowerFeature.includes('media room')) {
      categories.rooms.push(cleanFeature);
    } else if (lowerFeature.includes('dishwasher') || lowerFeature.includes('disposal') ||
               lowerFeature.includes('microwave') || lowerFeature.includes('range') ||
               lowerFeature.includes('cooktop') || lowerFeature.includes('oven')) {
      categories.appliances.push(cleanFeature);
    } else if (lowerFeature.includes('heating') || lowerFeature.includes('cooling') ||
               lowerFeature.includes('electric') || lowerFeature.includes('sewer') ||
               lowerFeature.includes('water') || lowerFeature.includes('hvac')) {
      categories.utilities.push(cleanFeature);
    } else if (lowerFeature.includes('yard') || lowerFeature.includes('fencing') ||
               lowerFeature.includes('deck') || lowerFeature.includes('patio') ||
               lowerFeature.includes('landscaped') || lowerFeature.includes('sprinkler')) {
      categories.exterior.push(cleanFeature);
    } else if (lowerFeature.includes('flooring') || lowerFeature.includes('ceiling') ||
               lowerFeature.includes('window') || lowerFeature.includes('door') ||
               lowerFeature.includes('closet') || lowerFeature.includes('counter') ||
               lowerFeature.includes('hardwood') || lowerFeature.includes('carpet') ||
               lowerFeature.includes('tile') || lowerFeature.includes('fireplace')) {
      categories.interior.push(cleanFeature);
    } else {
      categories.other.push(cleanFeature);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
};

export const formatFeatureText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Skip URLs and technical data
  if (text.includes('http') || text.includes('www.') || text.includes('.com')) {
    return '';
  }
  
  let formatted = text.trim();
  
  // Remove key-value separators at the start
  formatted = formatted.replace(/^[^:]*:\s*/, '');
  
  // Handle specific real estate terms FIRST before general camelCase
  const specificReplacements: Record<string, string> = {
    'SingleFamily': 'Single Family',
    'MultiFamily': 'Multi Family',
    'TownHouse': 'Town House',
    'CondoOrTownhouse': 'Condo or Townhouse',
    'MasterBedroom': 'Master Bedroom',
    'MasterBathroom': 'Master Bathroom',
    'DiningRoom': 'Dining Room',
    'FamilyRoom': 'Family Room',
    'LivingRoom': 'Living Room',
    'LaundryRoom': 'Laundry Room',
    'HomeOffice': 'Home Office',
    'WalkInCloset': 'Walk-in Closet',
    'HardwoodFloors': 'Hardwood Floors',
    'CentralAir': 'Central Air',
    'HotWater': 'Hot Water',
    'NaturalGas': 'Natural Gas',
    'ElectricRange': 'Electric Range',
    'GasRange': 'Gas Range',
    'YearBuilt': 'Year Built',
    'LotSize': 'Lot Size',
    'PropertyType': 'Property Type',
    'HomeType': 'Home Type',
    'BuildingArea': 'Building Area',
    'LivingArea': 'Living Area'
  };
  
  // Apply specific replacements first
  Object.entries(specificReplacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    formatted = formatted.replace(regex, value);
  });
  
  // Then add spaces before capital letters for remaining camelCase (but be careful not to break already spaced words)
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Capitalize properly
  formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
  
  // Clean up multiple spaces and fix common formatting issues
  formatted = formatted
    .replace(/\s+/g, ' ')
    .replace(/\bSq Ft\b/gi, 'sq ft')
    .replace(/\bAc\b/gi, 'acres')
    .trim();
  
  return formatted;
};

// Enhanced function to extract meaningful text from room objects
const extractRoomFeatures = (roomObject: any): string => {
  if (!roomObject || typeof roomObject !== 'object') {
    return '';
  }

  const features: string[] = [];
  
  // Extract room type - prioritize roomType over type
  const roomType = roomObject.roomType || roomObject.type;
  if (roomType) {
    features.push(formatFeatureText(roomType));
  }
  
  // Extract room level
  if (roomObject.roomLevel || roomObject.level) {
    features.push(`Level: ${roomObject.roomLevel || roomObject.level}`);
  }
  
  // Extract room features if they exist and are different from type
  if (roomObject.roomFeatures && Array.isArray(roomObject.roomFeatures)) {
    const additionalFeatures = roomObject.roomFeatures
      .filter(feature => feature && feature !== roomType)
      .map(feature => formatFeatureText(feature))
      .filter(Boolean);
    features.push(...additionalFeatures);
  }
  
  // Extract dimensions if available
  if (roomObject.dimensions || roomObject.size) {
    features.push(roomObject.dimensions || roomObject.size);
  }
  
  return features.filter(Boolean).join(' - ');
};

export const formatPropertyValue = (value: any, key: string): string => {
  if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'Unknown') {
    return '';
  }

  // Handle boolean-like values
  if (key.toLowerCase().includes('has') || ['pool', 'fireplace', 'garage'].some(term => key.toLowerCase().includes(term))) {
    if (value === 1 || value === '1' || value === true || value === 'Yes') return 'Yes';
    if (value === 0 || value === '0' || value === false || value === 'No') return 'No';
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const processedItems = value
      .filter(item => item && item !== '')
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle room objects specifically
          if (item.roomType || item.type || item.name) {
            return extractRoomFeatures(item);
          }
          // Skip media objects
          if (item.mediaURL || item.url || item.mediaCategory) {
            return '';
          }
          // Handle other objects by extracting meaningful properties
          const meaningfulProps = Object.entries(item)
            .filter(([k, v]) => v && !k.startsWith('_') && k !== 'id' && !String(v).includes('http'))
            .map(([k, v]) => `${formatFeatureText(k)}: ${v}`)
            .join(', ');
          return meaningfulProps || '';
        }
        return formatFeatureText(String(item));
      })
      .filter(Boolean);
    
    return processedItems.join(', ');
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Handle year fields - NO COMMA FORMATTING
    if (key.toLowerCase().includes('year') || key === 'yearBuilt') {
      return value.toString();
    }
    
    // Format area measurements
    if (key.toLowerCase().includes('sqft') || key.toLowerCase().includes('area')) {
      return `${value.toLocaleString()} sq ft`;
    }
    
    return value.toLocaleString();
  }

  // Handle objects - ORIGINAL VERSION WITHOUT MY BROKEN CHANGES
  if (typeof value === 'object' && value !== null) {
    // Skip media objects completely
    if (value.mediaURL || value.url || value.mediaCategory) {
      return '';
    }
    
    // Handle room objects specifically
    if (value.roomType || value.type || value.name) {
      return extractRoomFeatures(value);
    }
    
    // Handle fact objects from "At A Glance Facts"
    if (value.factLabel && value.factValue) {
      return `${value.factLabel}: ${value.factValue}`;
    }
    
    // Handle simple objects with type/name
    if (value.type && Object.keys(value).length <= 3) {
      return formatFeatureText(value.type);
    }
    
    if (value.name && Object.keys(value).length <= 3) {
      return formatFeatureText(value.name);
    }
    
    // For complex objects, return empty string to avoid [Object Object]
    return '';
  }

  return formatFeatureText(String(value));
};

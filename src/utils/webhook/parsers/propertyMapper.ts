
import { PropertyListing } from '../types';
import { parsePropertyAddress } from './addressParser';
import { extractPriceFromProperty, formatCurrency } from './priceParser';
import { parseImageUrls } from './imageParser';

/**
 * Enhanced subject property mapping for new direct webhook format
 * Maps subject property similar to comparables but preserves rich historical data
 */
export const mapSubjectPropertyFromWebhook = (property: any): any => {
  console.log(`[SUBJECT PROPERTY MAP] Processing subject property:`, property);
  console.log(`[SUBJECT PROPERTY MAP] Available keys:`, Object.keys(property || {}));
  
  if (!property) {
    console.error('[SUBJECT PROPERTY MAP] No property data provided');
    return {};
  }

  // CRITICAL FIX: Extract address with multiple fallback strategies
  let address = 'Address not available';
  try {
    // First try direct address field
    if (property.address && typeof property.address === 'string' && property.address.trim() !== '') {
      address = property.address.trim();
      console.log(`[SUBJECT PROPERTY MAP] Using direct address field:`, address);
    } else {
      // Try parsing complex address object
      address = parsePropertyAddress(property);
      console.log(`[SUBJECT PROPERTY MAP] Using parsed address:`, address);
    }
  } catch (error) {
    console.error(`[SUBJECT PROPERTY MAP] ERROR extracting address:`, error);
  }
  
  // Extract price directly from the new format
  let price = 'Price not available';
  try {
    if (typeof property.price === 'number' && property.price > 0) {
      price = formatCurrency(property.price);
      console.log(`[SUBJECT PROPERTY MAP] SUCCESS: Using direct price field:`, price);
    } else {
      price = extractPriceFromProperty(property);
      console.log(`[SUBJECT PROPERTY MAP] Using fallback price extraction:`, price);
    }
  } catch (error) {
    console.error(`[SUBJECT PROPERTY MAP] ERROR extracting price:`, error);
  }
  
  // CRITICAL FIX: Extract images with proper logic - only use images array if it has content
  let images = [];
  console.log(`[SUBJECT PROPERTY MAP] Image debugging:`, {
    hasImagesArray: Array.isArray(property.images),
    imagesLength: property.images?.length || 0,
    ImgScr: property.ImgScr ? 'Found' : 'Not found',
    imgScr: property.imgScr ? 'Found' : 'Not found',
    imgSrc: property.imgSrc ? 'Found' : 'Not found'
  });
  
  if (Array.isArray(property.images) && property.images.length > 0) {
    images = property.images;
    console.log(`[SUBJECT PROPERTY MAP] SUCCESS: Using direct images array with ${images.length} images`);
  } else {
    // CRITICAL FIX: Parse from raw image fields when images array is empty or missing
    images = parseImageUrls(
      property.imgSrc || property.ImageUrl || property['Image URL'], 
      property.imgScr, 
      property.ImgScr
    );
    console.log(`[SUBJECT PROPERTY MAP] SUCCESS: Parsed ${images.length} images from raw fields`);
    console.log(`[SUBJECT PROPERTY MAP] Raw field sources checked:`, {
      ImgScr: property.ImgScr ? 'Used' : 'Not available',
      imgScr: property.imgScr ? 'Used' : 'Not available', 
      imgSrc: property.imgSrc ? 'Used' : 'Not available'
    });
  }
  
  // CRITICAL FIX: Extract bedrooms and bathrooms with ROOT LEVEL priority
  let beds = 0;
  try {
    // First check ROOT LEVEL beds/baths (this is where the webhook data actually is)
    if (property.beds !== undefined && property.beds !== null) {
      beds = typeof property.beds === 'string' ? parseInt(property.beds) : property.beds;
      console.log(`[SUBJECT PROPERTY MAP] BEDS: Using ROOT LEVEL beds field:`, beds);
    } else if (typeof property.bedrooms === 'number') {
      beds = property.bedrooms;
      console.log(`[SUBJECT PROPERTY MAP] BEDS: Using ROOT LEVEL bedrooms field:`, beds);
    } else if (property.features?.bedrooms) {
      beds = parseInt(property.features.bedrooms) || 0;
      console.log(`[SUBJECT PROPERTY MAP] BEDS: Using features.bedrooms:`, beds);
    }
  } catch (error) {
    console.error(`[SUBJECT PROPERTY MAP] Error extracting beds:`, error);
  }
  
  let baths = 0;
  try {
    // First check ROOT LEVEL beds/baths (this is where the webhook data actually is)
    if (property.baths !== undefined && property.baths !== null) {
      baths = typeof property.baths === 'string' ? parseFloat(property.baths) : property.baths;
      console.log(`[SUBJECT PROPERTY MAP] BATHS: Using ROOT LEVEL baths field:`, baths);
    } else if (typeof property.bathrooms === 'number') {
      baths = property.bathrooms;
      console.log(`[SUBJECT PROPERTY MAP] BATHS: Using ROOT LEVEL bathrooms field:`, baths);
    } else if (property.features?.bathrooms) {
      baths = parseInt(property.features.bathrooms) || 0;
      console.log(`[SUBJECT PROPERTY MAP] BATHS: Using features.bathrooms:`, baths);
    } else if (property.features?.bathroomsFloat) {
      baths = parseFloat(property.features.bathroomsFloat) || 0;
      console.log(`[SUBJECT PROPERTY MAP] BATHS: Using features.bathroomsFloat:`, baths);
    }
  } catch (error) {
    console.error(`[SUBJECT PROPERTY MAP] Error extracting baths:`, error);
  }
  
  // Extract square footage - handle buildingArea from webhook
  let sqft = 0;
  try {
    if (typeof property.sqft === 'number' && property.sqft > 0) {
      sqft = property.sqft;
    } else if (property.buildingArea) {
      const buildingAreaStr = String(property.buildingArea).replace(/,/g, '');
      sqft = parseInt(buildingAreaStr) || 0;
    } else if (property['Building Area (sqft)']) {
      sqft = parseInt(property['Building Area (sqft)']) || 0;
    } else if (property.livingArea) {
      const livingAreaStr = String(property.livingArea).replace(/,/g, '');
      sqft = parseInt(livingAreaStr) || 0;
    }
  } catch (error) {
    console.error(`[SUBJECT PROPERTY MAP] Error extracting sqft:`, error);
  }
  
  // Start with basic mapped property structure
  const mappedProperty: any = {
    address,
    price,
    beds,
    baths,
    sqft,
    lotSize: property.lotSize || 'Not specified',
    yearBuilt: property.yearBuilt,
    propertyType: property.propertyType,
    images, // CRITICAL: Ensure parsed images are assigned to the images field
    // PRESERVE: Keep original image fields for fallback
    ImgScr: property.ImgScr,
    imgScr: property.imgScr,
    imgSrc: property.imgSrc
  };

  // Process features.atAGlanceFacts into individual fields
  if (property.features?.atAGlanceFacts && Array.isArray(property.features.atAGlanceFacts)) {
    console.log(`[SUBJECT PROPERTY MAP] Processing atAGlanceFacts:`, property.features.atAGlanceFacts);
    
    property.features.atAGlanceFacts.forEach((fact: any) => {
      if (fact.factLabel && fact.factValue && fact.factValue !== null) {
        mappedProperty[fact.factLabel] = fact.factValue;
      }
    });
  }

  // Process financials object into individual fields
  if (property.financials && typeof property.financials === 'object') {
    console.log(`[SUBJECT PROPERTY MAP] Processing financials:`, property.financials);
    
    const financials = property.financials;
    if (financials.assessedValue) mappedProperty['Assessed Value'] = financials.assessedValue;
    if (financials.annualTaxes) mappedProperty['Annual Taxes'] = financials.annualTaxes;
    if (financials.parcelNumber) mappedProperty['Parcel Number'] = financials.parcelNumber;
  }

  // Process other feature properties from webhook
  if (property.features) {
    const features = property.features;
    
    // Add all meaningful feature properties
    if (features.livingArea) mappedProperty['Living Area'] = features.livingArea;
    if (features.cityRegion) mappedProperty['City/Region'] = features.cityRegion;
    if (features.canRaiseHorses !== undefined) mappedProperty['Can Raise Horses'] = features.canRaiseHorses;
    if (features.hasLandLease !== undefined) mappedProperty['Has Land Lease'] = features.hasLandLease;
    if (features.taxAnnualAmount) mappedProperty['Annual Tax Amount'] = features.taxAnnualAmount;
    if (features.hasCooling !== undefined) mappedProperty['Has Cooling'] = features.hasCooling;
    if (features.parkingCapacity) mappedProperty['Parking Capacity'] = features.parkingCapacity;
    if (features.hasView !== undefined) mappedProperty['Has View'] = features.hasView;
    if (features.hasHomeWarranty !== undefined) mappedProperty['Has Home Warranty'] = features.hasHomeWarranty;
    if (features.homeType) mappedProperty['Home Type'] = features.homeType;
    if (features.hasSpa !== undefined) mappedProperty['Has Spa'] = features.hasSpa;
    if (features.hasHeating !== undefined) mappedProperty['Has Heating'] = features.hasHeating;
    if (features.furnished !== undefined) mappedProperty['Furnished'] = features.furnished;
    if (features.pricePerSquareFoot) mappedProperty['Price Per Square Foot'] = features.pricePerSquareFoot;
    if (features.garageSize) mappedProperty['Garage Size'] = features.garageSize;
    if (features.garageSquareFootage) mappedProperty['Garage Square Footage'] = features.garageSquareFootage;
    if (features.numberOfUnits) mappedProperty['Number of Units'] = features.numberOfUnits;
    if (features.totalRooms) mappedProperty['Total Rooms'] = features.totalRooms;
    if (features.numberOfStories) mappedProperty['Number of Stories'] = features.numberOfStories;
    if (features.hasPool !== undefined) mappedProperty['Has Pool'] = features.hasPool;
    if (features.hasFireplace !== undefined) mappedProperty['Has Fireplace'] = features.hasFireplace;
    if (features.airConditioning !== undefined) mappedProperty['Air Conditioning'] = features.airConditioning;
    if (features.heatingType !== undefined) mappedProperty['Heating Type'] = features.heatingType;
    if (features.basementType) mappedProperty['Basement Type'] = features.basementType;
    if (features.basementSquareFootage) mappedProperty['Basement Square Footage'] = features.basementSquareFootage;
    if (features.roofType) mappedProperty['Roof Type'] = features.roofType;
    if (features.exteriorWallType) mappedProperty['Exterior Wall Type'] = features.exteriorWallType;
    if (features.hvacSystem !== undefined) mappedProperty['HVAC System'] = features.hvacSystem;
  }

  // CRITICAL: Preserve rich historical data arrays
  if (property.priceHistory && Array.isArray(property.priceHistory)) {
    mappedProperty.priceHistory = property.priceHistory;
    console.log(`[SUBJECT PROPERTY MAP] Preserved priceHistory:`, property.priceHistory.length);
  }

  if (property.taxHistory && Array.isArray(property.taxHistory)) {
    mappedProperty.taxHistory = property.taxHistory;
    console.log(`[SUBJECT PROPERTY MAP] Preserved taxHistory:`, property.taxHistory.length);
  }

  if (property.schools && Array.isArray(property.schools)) {
    mappedProperty.schools = property.schools;
    console.log(`[SUBJECT PROPERTY MAP] Preserved schools:`, property.schools.length);
  }

  // Preserve climate and other rich data
  if (property.climate && typeof property.climate === 'object') {
    mappedProperty.climate = property.climate;
  }

  console.log(`[SUBJECT PROPERTY MAP] FINAL SUCCESS: mapped subject property with ${Object.keys(mappedProperty).length} fields`);
  console.log(`[SUBJECT PROPERTY MAP] FINAL BEDS/BATHS VALUES:`, { beds: mappedProperty.beds, baths: mappedProperty.baths });
  console.log(`[SUBJECT PROPERTY MAP] FINAL IMAGES:`, { count: mappedProperty.images?.length || 0, sources: mappedProperty.images });
  console.log(`[SUBJECT PROPERTY MAP] Historical data preserved:`, {
    priceHistory: mappedProperty.priceHistory?.length || 0,
    taxHistory: mappedProperty.taxHistory?.length || 0,
    schools: mappedProperty.schools?.length || 0
  });
  
  return mappedProperty;
};

/**
 * Enhanced active listing mapping for new direct webhook format
 * FIXED: Properly maps bedrooms/bathrooms from webhook response
 */
export const mapActiveListingFromWebhook = (property: any, index: number): PropertyListing => {
  console.log(`[ACTIVE LISTING MAP] Processing item ${index}:`, property);
  console.log(`[ACTIVE LISTING MAP] Available keys:`, Object.keys(property || {}));
  
  // Extract address directly from the new format
  let address = property.address || 'Address not available';
  if (address === 'Address not available') {
    try {
      address = parsePropertyAddress(property);
      console.log(`[ACTIVE LISTING MAP] SUCCESS: Extracted address:`, address);
    } catch (error) {
      console.error(`[ACTIVE LISTING MAP] ERROR extracting address:`, error);
    }
  }
  
  // Extract price directly from the new format
  let price = 'Price not available';
  try {
    if (typeof property.price === 'number' && property.price > 0) {
      price = formatCurrency(property.price);
      console.log(`[ACTIVE LISTING MAP] SUCCESS: Using direct price field:`, price);
    } else {
      price = extractPriceFromProperty(property);
      console.log(`[ACTIVE LISTING MAP] Using fallback price extraction:`, price);
    }
  } catch (error) {
    console.error(`[ACTIVE LISTING MAP] ERROR extracting price:`, error);
  }
  
  // FIXED: Extract images with proper logic - only use images array if it has content
  let images = [];
  if (Array.isArray(property.images) && property.images.length > 0) {
    images = property.images;
    console.log(`[ACTIVE LISTING MAP] Using direct images array:`, images.length);
  } else {
    images = parseImageUrls(property.imgSrc || property.ImageUrl || property['Image URL'], property.imgScr);
    console.log(`[ACTIVE LISTING MAP] Using parsed images:`, images.length);
  }
  
  // CRITICAL FIX: Extract bedrooms and bathrooms with proper fallbacks
  let beds = 0;
  try {
    if (typeof property.beds === 'number') {
      beds = property.beds;
    } else if (typeof property.bedrooms === 'number') {
      beds = property.bedrooms;
    } else if (property.features?.bedrooms) {
      beds = parseInt(property.features.bedrooms) || 0;
    } else if (property.features?.livingArea && property.features.livingArea.includes('bed')) {
      // Try to extract from livingArea text like "1 bed, 1 bath"
      const bedMatch = property.features.livingArea.match(/(\d+)\s*bed/i);
      beds = bedMatch ? parseInt(bedMatch[1]) : 0;
    }
    console.log(`[ACTIVE LISTING MAP] BEDS: Using ${beds} (from ${property.bedrooms ? 'bedrooms' : property.beds ? 'beds' : 'fallback'})`);
  } catch (error) {
    console.error(`[ACTIVE LISTING MAP] Error extracting beds:`, error);
  }
  
  let baths = 0;
  try {
    if (typeof property.baths === 'number') {
      baths = property.baths;
    } else if (typeof property.bathrooms === 'number') {
      baths = property.bathrooms;
    } else if (property.features?.bathrooms) {
      baths = parseInt(property.features.bathrooms) || 0;
    } else if (property.features?.bathroomsFloat) {
      baths = parseFloat(property.features.bathroomsFloat) || 0;
    } else if (property.features?.livingArea && property.features.livingArea.includes('bath')) {
      // Try to extract from livingArea text like "1 bed, 1 bath"
      const bathMatch = property.features.livingArea.match(/(\d+)\s*bath/i);
      baths = bathMatch ? parseInt(bathMatch[1]) : 0;
    }
    console.log(`[ACTIVE LISTING MAP] BATHS: Using ${baths} (from ${property.bathrooms ? 'bathrooms' : property.baths ? 'baths' : 'fallback'})`);
  } catch (error) {
    console.error(`[ACTIVE LISTING MAP] Error extracting baths:`, error);
  }
  
  // Extract square footage - handle buildingArea from webhook
  let sqft = 0;
  try {
    if (typeof property.sqft === 'number' && property.sqft > 0) {
      sqft = property.sqft;
    } else if (property.buildingArea) {
      // Handle comma-formatted numbers from webhook
      const buildingAreaStr = String(property.buildingArea).replace(/,/g, '');
      sqft = parseInt(buildingAreaStr) || 0;
      console.log(`[ACTIVE LISTING MAP] Using buildingArea field:`, sqft);
    } else if (property['Building Area (sqft)']) {
      sqft = parseInt(property['Building Area (sqft)']) || 0;
    } else if (property.livingArea) {
      const livingAreaStr = String(property.livingArea).replace(/,/g, '');
      sqft = parseInt(livingAreaStr) || 0;
      console.log(`[ACTIVE LISTING MAP] Using livingArea field:`, sqft);
    } else if (property.features?.livingArea) {
      // Extract sqft from livingArea string like "670 sqft"
      const sqftMatch = property.features.livingArea.match(/(\d+)\s*sqft/i);
      sqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;
    }
  } catch (error) {
    console.error(`[ACTIVE LISTING MAP] Error extracting sqft:`, error);
  }
  console.log(`[ACTIVE LISTING MAP] Mapped square footage: ${sqft}`);
  
  console.log(`[ACTIVE LISTING MAP] FINAL BEDS/BATHS: ${beds} beds, ${baths} baths`);
  
  const mappedProperty = {
    id: index + 1,
    address,
    beds,
    baths,
    price,
    lotSize: property.lotSize || 'Not specified',
    sqft,
    images,
    // Include ALL original property data for the modal
    ...property
  };
  
  console.log(`[ACTIVE LISTING MAP] FINAL SUCCESS: mapped active listing:`, {
    id: mappedProperty.id,
    address: mappedProperty.address,
    price: mappedProperty.price,
    beds: mappedProperty.beds,
    baths: mappedProperty.baths,
    sqft: mappedProperty.sqft,
    lotSize: mappedProperty.lotSize,
    images: mappedProperty.images.length
  });
  
  return mappedProperty;
};

/**
 * Enhanced recent sale mapping for new direct webhook format
 * FIXED: Properly maps bedrooms/bathrooms from webhook response
 */
export const mapRecentSaleFromWebhook = (property: any, index: number): PropertyListing => {
  console.log(`[RECENT SALE MAP] Processing item ${index}:`, property);
  console.log(`[RECENT SALE MAP] Available keys:`, Object.keys(property || {}));
  
  // Extract address directly from the new format
  let address = property.address || 'Address not available';
  if (address === 'Address not available') {
    try {
      address = parsePropertyAddress(property);
      console.log(`[RECENT SALE MAP] SUCCESS: Using parsed address:`, address);
    } catch (error) {
      console.error(`[RECENT SALE MAP] ERROR extracting address:`, error);
    }
  }
  
  // Extract price directly from the new format
  let price = 'Price not available';
  try {
    if (typeof property.price === 'number' && property.price > 0) {
      price = formatCurrency(property.price);
      console.log(`[RECENT SALE MAP] SUCCESS: Using direct price field:`, price);
    } else {
      price = extractPriceFromProperty(property);
      console.log(`[RECENT SALE MAP] Using fallback price extraction:`, price);
    }
  } catch (error) {
    console.error(`[RECENT SALE MAP] ERROR extracting price:`, error);
  }
  
  console.log(`[RECENT SALE MAP] Final extracted price: "${price}"`);
  
  // FIXED: Extract images with proper logic - only use images array if it has content
  const images = Array.isArray(property.images) && property.images.length > 0 
    ? property.images 
    : parseImageUrls(property['Image URL'] || property.imgSrc || property.ImageUrl, property.imgScr);
  console.log(`[RECENT SALE MAP] Mapped images count:`, images.length);
  
  // CRITICAL FIX: Extract bedrooms and bathrooms with proper fallbacks
  let beds = 0;
  try {
    if (typeof property.beds === 'number') {
      beds = property.beds;
    } else if (typeof property.bedrooms === 'number') {
      beds = property.bedrooms;
    } else if (property.features?.bedrooms) {
      beds = parseInt(property.features.bedrooms) || 0;
    } else if (property.features?.livingArea && property.features.livingArea.includes('bed')) {
      const bedMatch = property.features.livingArea.match(/(\d+)\s*bed/i);
      beds = bedMatch ? parseInt(bedMatch[1]) : 0;
    }
    console.log(`[RECENT SALE MAP] BEDS: Using ${beds} (from ${property.bedrooms ? 'bedrooms' : property.beds ? 'beds' : 'fallback'})`);
  } catch (error) {
    console.error(`[RECENT SALE MAP] Error extracting beds:`, error);
  }
  
  let baths = 0;
  try {
    if (typeof property.baths === 'number') {
      baths = property.baths;
    } else if (typeof property.bathrooms === 'number') {
      baths = property.bathrooms;
    } else if (property.features?.bathrooms) {
      baths = parseInt(property.features.bathrooms) || 0;
    } else if (property.features?.bathroomsFloat) {
      baths = parseFloat(property.features.bathroomsFloat) || 0;
    } else if (property.features?.livingArea && property.features.livingArea.includes('bath')) {
      const bathMatch = property.features.livingArea.match(/(\d+)\s*bath/i);
      baths = bathMatch ? parseInt(bathMatch[1]) : 0;
    }
    console.log(`[RECENT SALE MAP] BATHS: Using ${baths} (from ${property.bathrooms ? 'bathrooms' : property.baths ? 'baths' : 'fallback'})`);
  } catch (error) {
    console.error(`[RECENT SALE MAP] Error extracting baths:`, error);
  }
  
  // Extract square footage - handle buildingArea from webhook
  let sqft = 0;
  try {
    if (typeof property.sqft === 'number' && property.sqft > 0) {
      sqft = property.sqft;
    } else if (property.buildingArea) {
      // Handle comma-formatted numbers from webhook
      const buildingAreaStr = String(property.buildingArea).replace(/,/g, '');
      sqft = parseInt(buildingAreaStr) || 0;
      console.log(`[RECENT SALE MAP] Using buildingArea field:`, sqft);
    } else if (property['Building Area (sqft)']) {
      sqft = parseInt(property['Building Area (sqft)']) || 0;
    } else if (property.livingArea) {
      const livingAreaStr = String(property.livingArea).replace(/,/g, '');
      sqft = parseInt(livingAreaStr) || 0;
      console.log(`[RECENT SALE MAP] Using livingArea field:`, sqft);
    } else if (property.features?.livingArea) {
      // Extract sqft from livingArea string like "670 sqft"
      const sqftMatch = property.features.livingArea.match(/(\d+)\s*sqft/i);
      sqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;
    }
  } catch (error) {
    console.error(`[RECENT SALE MAP] Error extracting sqft:`, error);
  }
  console.log(`[RECENT SALE MAP] Mapped square footage: ${sqft}`);
  
  console.log(`[RECENT SALE MAP] FINAL BEDS/BATHS: ${beds} beds, ${baths} baths`);
  
  const mappedSale = {
    id: index + 1,
    address,
    beds,
    baths,
    price,
    lotSize: property.lotSize || 'Not specified',
    sqft,
    soldDate: property.soldDate || 'Recently sold',
    images,
    // Include ALL original property data for the modal
    ...property
  };
  
  console.log(`[RECENT SALE MAP] FINAL SUCCESS: mapped recent sale:`, {
    id: mappedSale.id,
    address: mappedSale.address,
    price: mappedSale.price,
    beds: mappedSale.beds,
    baths: mappedSale.baths,
    sqft: mappedSale.sqft,
    soldDate: mappedSale.soldDate,
    images: mappedSale.images.length
  });
  
  return mappedSale;
};

import { parsePropertyAddress } from '../../../utils/webhook/parsers/addressParser';

export interface Listing {
  id?: string | number;
  address?: string | any;
  price?: string | number;
  beds?: number;
  baths?: number;
  sqft?: number;
  buildingArea?: number | string;
  lotSize?: string;
  soldDate?: string;
  images?: string[];
  imgSrc?: string;
  features?: any;
  priceHistory?: any[];
  taxHistory?: any[];
  schools?: any[];
  // Add all the fields we see in the webhook response
  media?: any[];
  sewer?: string[];
  hasSpa?: boolean;
  levels?: string;
  cooling?: string[];
  fencing?: string;
  hasView?: boolean;
  heating?: string[];
  homeType?: string;
  roofType?: string;
  furnished?: boolean;
  hasGarage?: boolean;
  yearBuilt?: number;
  appliances?: string[];
  cityRegion?: string;
  hasCooling?: boolean;
  hasHeating?: boolean;
  livingArea?: string;
  feesAndDues?: any[];
  virtualTour?: string;
  waterSource?: string[];
  daysOnZillow?: number;
  hasLandLease?: boolean;
  listingTerms?: string;
  onMarketDate?: number;
  parcelNumber?: string;
  poolFeatures?: string[];
  storiesTotal?: number;
  bathroomsFull?: number;
  bathroomsHalf?: number;
  atAGlanceFacts?: any[];
  bathroomsFloat?: number;
  canRaiseHorses?: boolean;
  hasHomeWarranty?: boolean;
  laundryFeatures?: string[];
  parkingCapacity?: number;
  parkingFeatures?: string[];
  propertySubType?: string[];
  subdivisionName?: string;
  taxAnnualAmount?: number;
  taxAssessedValue?: number;
  pricePerSquareFoot?: number;
  hasAttachedProperty?: boolean;
  hasAdditionalParcels?: boolean;
  constructionMaterials?: string[];
  garageParkingCapacity?: number;
  coveredParkingCapacity?: number;
  specialListingConditions?: string;
  [key: string]: any;
}

export const extractDisplayAddress = (listing: Listing): string => {
  console.log('🏠 DEBUG: Extracting address from listing:', listing);
  console.log('🏠 DEBUG: Listing type:', typeof listing);
  console.log('🏠 DEBUG: Listing keys:', listing ? Object.keys(listing) : []);
  
  try {
    // Debug the input to parsePropertyAddress
    console.log('🏠 DEBUG: Calling parsePropertyAddress with listing:', JSON.stringify(listing, null, 2).substring(0, 500));
    
    // Use the proper address parser that handles duplicates
    const cleanedAddress = parsePropertyAddress(listing);
    console.log('🏠 DEBUG: parsePropertyAddress result:', cleanedAddress);
    
    // Only use fallbacks if parsePropertyAddress couldn't process it
    if (cleanedAddress === 'Address not available') {
      console.log('🏠 DEBUG: parsePropertyAddress failed, trying fallbacks...');
      console.log('🏠 DEBUG: listing["Properties Address"]:', listing['Properties Address']);
      console.log('🏠 DEBUG: listing.Address:', listing.Address);
      console.log('🏠 DEBUG: listing.address:', listing.address);
      
      // Fallback options
      if (listing['Properties Address']) {
        console.log('🏠 DEBUG: Using Properties Address fallback');
        return String(listing['Properties Address']);
      }
      if (listing.Address) {
        console.log('🏠 DEBUG: Using Address fallback');
        return String(listing.Address);
      }
      if (listing.address && typeof listing.address === 'string') {
        console.log('🏠 DEBUG: Using address string fallback');
        return listing.address;
      }
    }
    
    console.log('🏠 DEBUG: Final address result:', cleanedAddress);
    return cleanedAddress;
  } catch (error) {
    console.error('🏠 DEBUG: Error in extractDisplayAddress:', error);
    console.error('🏠 DEBUG: Error stack:', error.stack);
    return 'Address not available';
  }
};

export const extractDisplayPrice = (listing: Listing): string => {
  console.log('💰 Extracting price from listing:', listing);
  
  try {
    const rawPrice = listing.price ?? listing.Price ?? null;
    console.log('💰 Raw price value:', rawPrice, 'type:', typeof rawPrice);
    
    if (rawPrice !== null && rawPrice !== undefined) {
      if (typeof rawPrice === 'number' && rawPrice > 0) {
        return `$${rawPrice.toLocaleString()}`;
      } else if (typeof rawPrice === 'string' && rawPrice.trim() !== '') {
        const numericValue = parseFloat(rawPrice.replace(/[$,]/g, ''));
        if (!isNaN(numericValue) && numericValue > 0) {
          return `$${numericValue.toLocaleString()}`;
        } else if (rawPrice.startsWith('$')) {
          return rawPrice;
        }
      }
    }
    
    return 'Price not available';
  } catch (error) {
    console.error('💰 Error extracting price:', error);
    return 'Price not available';
  }
};

export const safeRenderValue = (value: any, fallback: string = 'N/A'): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
};

export const transformListingForModal = (listing: Listing): any => {
  console.log('🔄 Transforming listing for modal:', listing);
  
  try {
    // FIXED: Extract data from features object with proper fallbacks
    const beds = listing.features?.bedrooms || listing.beds || listing.bedrooms || 0;
    const baths = listing.features?.bathrooms || listing.baths || listing.bathrooms || listing.bathroomsFloat || 0;
    
    // FIXED: Parse sqft from features.livingArea if available
    let sqft = listing.sqft;
    if (!sqft && listing.features?.livingArea && typeof listing.features.livingArea === 'string') {
      const livingAreaStr = listing.features.livingArea.replace(/[^0-9,]/g, '').replace(/,/g, '');
      sqft = parseInt(livingAreaStr) || null;
    } else if (!sqft && listing.buildingArea) {
      sqft = parseInt(String(listing.buildingArea).replace(/,/g, '')) || null;
    }
    
    // FIXED: Extract yearBuilt from features first
    const yearBuilt = listing.features?.yearBuilt || listing.yearBuilt;
    
    const transformed = {
      id: listing.id || Math.random(),
      address: extractDisplayAddress(listing),
      price: extractDisplayPrice(listing),
      beds,
      baths,
      sqft,
      lotSize: listing.lotSize || 'N/A',
      soldDate: listing.soldDate,
      images: listing.images || (listing.imgSrc ? [listing.imgSrc] : []),
      imgSrc: listing.imgSrc,
      yearBuilt,
      homeType: listing.features?.homeType || listing.homeType,
      
      // COMPREHENSIVE DATA EXTRACTION - Include ALL original data
      features: listing.features || {},
      priceHistory: listing.priceHistory || [],
      taxHistory: listing.taxHistory || [],
      schools: listing.schools || [],
      
      // Include all original listing data for maximum compatibility
      ...listing
    };
    
    console.log('🔄 Transformed listing with comprehensive data:', {
      id: transformed.id,
      address: transformed.address,
      beds: transformed.beds,
      baths: transformed.baths,
      sqft: transformed.sqft,
      yearBuilt: transformed.yearBuilt,
      featuresCount: Object.keys(transformed.features).length,
      priceHistoryCount: transformed.priceHistory.length,
      taxHistoryCount: transformed.taxHistory.length,
      schoolsCount: transformed.schools.length
    });
    
    return transformed;
  } catch (error) {
    console.error('🔄 Error transforming listing:', error);
    return {
      id: Math.random(),
      address: 'Address not available',
      price: 'Price not available',
      beds: 0,
      baths: 0,
      sqft: null,
      lotSize: 'N/A',
      images: [],
      features: {},
      priceHistory: [],
      taxHistory: [],
      schools: []
    };
  }
};

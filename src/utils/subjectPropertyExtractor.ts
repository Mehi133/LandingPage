
import { PropertyListing } from "./webhook/types";

export interface SubjectPropertyData {
  address?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  propertyType?: string;
  images?: string[];
  features?: {
    garageSize?: string;
    hvac?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    pool?: boolean;
    fireplace?: boolean;
    viewType?: string;
  };
  
  [key: string]: any;
}

export const extractSubjectProperty = (data: any): SubjectPropertyData => {
  if (!data) {
    console.warn('No data provided to extractSubjectProperty');
    return {};
  }

  console.log('🏠 extractSubjectProperty input:', data);

  // Handle Full Report webhook response structure
  let subjectData = null;
  
  // Check for Full Report webhook structure
  if (data.subjectProperty) {
    console.log('🏠 Found Full Report subjectProperty:', data.subjectProperty);
    subjectData = data.subjectProperty;
  } else if (data.data && data.data.subjectProperty) {
    console.log('🏠 Found nested subjectProperty:', data.data.subjectProperty);
    subjectData = data.data.subjectProperty;
  } else {
    // Fallback to root data
    console.log('🏠 Using root data as fallback:', data);
    subjectData = data;
  }

  console.log('🏠 Using subject data:', subjectData);

  if (!subjectData) {
    console.warn('No subject data found');
    return {};
  }

  const subjectProperty: SubjectPropertyData = {};

  try {
    // Extract basic data using the exact webhook structure
    subjectProperty.address = subjectData.address;
    subjectProperty.price = subjectData.price;
    subjectProperty.beds = subjectData.beds;
    subjectProperty.baths = subjectData.baths;
    subjectProperty.sqft = subjectData.sqft;
    subjectProperty.lotSize = subjectData.lotSize;
    subjectProperty.yearBuilt = subjectData.yearBuilt;
    subjectProperty.propertyType = subjectData.propertyType;
    subjectProperty.images = subjectData.images || [];
    
    // NEW: Add additional top-level fields
    if (subjectData.daysOnMarket) {
      subjectProperty.daysOnMarket = subjectData.daysOnMarket;
    }
    if (subjectData.pricePerSqft) {
      subjectProperty.pricePerSqft = subjectData.pricePerSqft;
    }

    // NEW: Parse priceHistory array
    if (subjectData.priceHistory && Array.isArray(subjectData.priceHistory)) {
      subjectProperty.priceHistory = subjectData.priceHistory;
    }

    // NEW: Parse taxHistory array
    if (subjectData.taxHistory && Array.isArray(subjectData.taxHistory)) {
      subjectProperty.taxHistory = subjectData.taxHistory;
    }

    // NEW: Parse schools array
    if (subjectData.schools && Array.isArray(subjectData.schools)) {
      subjectProperty.schools = subjectData.schools;
    }

    // NEW: Parse climate object
    if (subjectData.climate && typeof subjectData.climate === 'object') {
      subjectProperty.climate = subjectData.climate;
    }

    // NEW: Parse financials object
    if (subjectData.financials && typeof subjectData.financials === 'object') {
      const financials = subjectData.financials;
      if (financials.assessedValue) subjectProperty['Assessed Value'] = financials.assessedValue;
      if (financials.annualTaxes) subjectProperty['Annual Taxes'] = financials.annualTaxes;
      if (financials.parcelNumber) subjectProperty['Parcel Number'] = financials.parcelNumber;
    }

    // NEW: Parse features object and atAGlanceFacts array
    if (subjectData.features && typeof subjectData.features === 'object') {
      const features = subjectData.features;
      
      // Parse atAGlanceFacts array into individual fields
      if (features.atAGlanceFacts && Array.isArray(features.atAGlanceFacts)) {
        features.atAGlanceFacts.forEach((fact: any) => {
          if (fact.factLabel && fact.factValue && fact.factValue !== null) {
            subjectProperty[fact.factLabel] = fact.factValue;
          }
        });
      }

      // Parse other feature properties
      if (features.livingArea) subjectProperty['Living Area'] = features.livingArea;
      if (features.cityRegion) subjectProperty['City/Region'] = features.cityRegion;
      if (features.canRaiseHorses !== undefined) subjectProperty['Can Raise Horses'] = features.canRaiseHorses;
      if (features.hasLandLease !== undefined) subjectProperty['Has Land Lease'] = features.hasLandLease;
      if (features.taxAnnualAmount) subjectProperty['Annual Tax Amount'] = features.taxAnnualAmount;
      if (features.hasCooling !== undefined) subjectProperty['Has Cooling'] = features.hasCooling;
      if (features.parkingCapacity) subjectProperty['Parking Capacity'] = features.parkingCapacity;
      if (features.hasView !== undefined) subjectProperty['Has View'] = features.hasView;
      if (features.hasHomeWarranty !== undefined) subjectProperty['Has Home Warranty'] = features.hasHomeWarranty;
      if (features.homeType) subjectProperty['Home Type'] = features.homeType;
      if (features.hasSpa !== undefined) subjectProperty['Has Spa'] = features.hasSpa;
      if (features.hasHeating !== undefined) subjectProperty['Has Heating'] = features.hasHeating;
      if (features.furnished !== undefined) subjectProperty['Furnished'] = features.furnished;
      if (features.pricePerSquareFoot) subjectProperty['Price Per Square Foot'] = features.pricePerSquareFoot;
      if (features.garageSize) subjectProperty['Garage Size'] = features.garageSize;
      if (features.garageSquareFootage) subjectProperty['Garage Square Footage'] = features.garageSquareFootage;
      if (features.numberOfUnits) subjectProperty['Number of Units'] = features.numberOfUnits;
      if (features.totalRooms) subjectProperty['Total Rooms'] = features.totalRooms;
      if (features.numberOfStories) subjectProperty['Number of Stories'] = features.numberOfStories;
      if (features.hasPool !== undefined) subjectProperty['Has Pool'] = features.hasPool;
      if (features.hasFireplace !== undefined) subjectProperty['Has Fireplace'] = features.hasFireplace;
      if (features.airConditioning !== undefined) subjectProperty['Air Conditioning'] = features.airConditioning;
      if (features.heatingType !== undefined) subjectProperty['Heating Type'] = features.heatingType;
      if (features.basementType) subjectProperty['Basement Type'] = features.basementType;
      if (features.basementSquareFootage) subjectProperty['Basement Square Footage'] = features.basementSquareFootage;
      if (features.roofType) subjectProperty['Roof Type'] = features.roofType;
      if (features.exteriorWallType) subjectProperty['Exterior Wall Type'] = features.exteriorWallType;
      if (features.hvacSystem !== undefined) subjectProperty['HVAC System'] = features.hvacSystem;

      // Legacy features object mapping for backward compatibility
      if (!subjectProperty.features) {
        subjectProperty.features = {
          garageSize: features.garageSize || subjectData.features.garageSize,
          hvac: features.hvacSystem !== undefined ? features.hvacSystem : subjectData.features.hvac,
          airConditioning: features.airConditioning !== undefined ? features.airConditioning : subjectData.features.airConditioning,
          heating: features.hasHeating !== undefined ? features.hasHeating : subjectData.features.heating,
          pool: features.hasPool !== undefined ? features.hasPool : subjectData.features.pool,
          fireplace: features.hasFireplace !== undefined ? features.hasFireplace : subjectData.features.fireplace,
          viewType: features.hasView ? 'Yes' : subjectData.features.viewType
        };
      }
    } else if (subjectData.features) {
      // Legacy features handling for backward compatibility
      subjectProperty.features = {
        garageSize: subjectData.features.garageSize,
        hvac: subjectData.features.hvac,
        airConditioning: subjectData.features.airConditioning,
        heating: subjectData.features.heating,
        pool: subjectData.features.pool,
        fireplace: subjectData.features.fireplace,
        viewType: subjectData.features.viewType
      };
    }

  } catch (error) {
    console.error('Error extracting subject property:', error);
    return {};
  }

  console.log('🏠 Extracted Subject Property Data:', subjectProperty);
  return subjectProperty;
};

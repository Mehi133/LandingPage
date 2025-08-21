import { useState, useEffect } from 'react';

export const usePropertyData = (initialData: any) => {
  const [displayData, setDisplayData] = useState<Record<string, any>>({});
  const [hasUserEdits, setHasUserEdits] = useState(false);

  useEffect(() => {
    console.log('[USE PROPERTY DATA] ======= PROCESSING PROPERTY DATA =======');
    console.log('[USE PROPERTY DATA] Initial data received:', initialData);
    
    if (!initialData) {
      console.log('[USE PROPERTY DATA] No initial data provided, setting empty display data');
      setDisplayData({});
      return;
    }

    // Handle webhook response data directly
    let processedData: Record<string, any> = {};

    // Check if this is direct webhook response format
    if (typeof initialData === 'object' && initialData !== null) {
      console.log('[USE PROPERTY DATA] Processing webhook response format');
      
      // FIXED: Check if data has numbered keys (0, 1, 2, etc.) - this indicates multiple property records
      const keys = Object.keys(initialData);
      const hasNumberedKeys = keys.some(key => /^\d+$/.test(key));
      
      if (hasNumberedKeys) {
        console.log('[USE PROPERTY DATA] Detected numbered keys, extracting from first meaningful object');
        
        // Find the first object that has meaningful property data (not storage/parking/etc.)
        let selectedObject = null;
        for (const key of keys) {
          const obj = initialData[key];
          if (typeof obj === 'object' && obj !== null) {
            const propertyType = obj.AdvancedPropertyType || '';
            // Skip auxiliary property types, prefer residential
            if (!['Storage', 'Parking Structure', 'Community Center', 'Retail Trade'].includes(propertyType) ||
                propertyType === 'Condominium' || 
                (obj.LotSize && obj.LotSizeAcres)) {
              selectedObject = obj;
              console.log('[USE PROPERTY DATA] Selected object with type:', propertyType);
              break;
            }
          }
        }
        
        // If no preferred object found, use the first one
        if (!selectedObject && keys.length > 0) {
          selectedObject = initialData[keys[0]];
          console.log('[USE PROPERTY DATA] Using first object as fallback');
        }
        
        if (selectedObject) {
          // Process the selected object's properties
          Object.keys(selectedObject).forEach(key => {
            const value = selectedObject[key];
            
            // Skip internal fields and backend-only fields
            const backendOnlyFields = ['userType', 'imageUrls', 'userData', '_', 'id'];
            if (backendOnlyFields.some(field => key.startsWith(field)) || key.startsWith('_') || key === 'id') return;
            
            // Map common field variations to consistent format
            if (key === 'SqFt' || key === 'sqft') {
              processedData['Square Footage'] = value;
            } else if (key === 'YearBuilt' || key === 'yearBuilt') {
              processedData['Year Built'] = value;
            } else if (key === 'LotSize' || key === 'lotSize') {
              processedData['Lot Size'] = value;
            } else if (key === 'LotSizeAcres' || key === 'lotSizeAcres') {
              processedData['Lot Size (Acres)'] = value;
            } else {
              // Keep the original key for direct webhook fields
              processedData[key] = value;
            }
          });
        }
      } else {
        // Enhanced logic for the new nested webhook structure
        Object.keys(initialData).forEach(key => {
          const value = initialData[key];
          
          // Skip internal fields and backend-only fields
          const backendOnlyFields = ['userType', 'imageUrls', 'userData', '_', 'id'];
          if (backendOnlyFields.some(field => key.startsWith(field)) || key.startsWith('_') || key === 'id') return;
          
          // Skip object values that would show as [Object object] except for specific cases
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const allowedObjectKeys = ['priceHistory', 'taxHistory', 'schools', 'climate', 'features', 'financials'];
            if (!allowedObjectKeys.includes(key)) return;
          }
          
          // Handle priceHistory array - keep as is for processing by display components
          if (key === 'priceHistory' && Array.isArray(value)) {
            processedData['Price History'] = value;
            return;
          }
          
          // Handle taxHistory array - keep as is for processing by display components
          if (key === 'taxHistory' && Array.isArray(value)) {
            processedData['Tax History'] = value;
            return;
          }
          
          // Handle schools array - keep as is for processing by display components
          if (key === 'schools' && Array.isArray(value)) {
            processedData['Schools'] = value;
            return;
          }
          
          // Handle climate object - keep as is for processing by display components
          if (key === 'climate' && typeof value === 'object' && value !== null) {
            processedData['Climate'] = value;
            return;
          }
          
          // Handle features object - extract individual properties
          if (key === 'features' && typeof value === 'object' && value !== null) {
            const features = value;
            
            // Extract atAGlanceFacts array into individual fields
            if (features.atAGlanceFacts && Array.isArray(features.atAGlanceFacts)) {
              features.atAGlanceFacts.forEach((fact: any) => {
                if (fact.factLabel && fact.factValue && fact.factValue !== null) {
                  processedData[fact.factLabel] = fact.factValue;
                }
              });
            }

            // Extract other feature properties with proper naming
            if (features.livingArea) processedData['Living Area'] = features.livingArea;
            if (features.cityRegion) processedData['City/Region'] = features.cityRegion;
            if (features.canRaiseHorses !== undefined) processedData['Can Raise Horses'] = features.canRaiseHorses ? 'Yes' : 'No';
            if (features.hasLandLease !== undefined) processedData['Has Land Lease'] = features.hasLandLease ? 'Yes' : 'No';
            if (features.taxAnnualAmount) processedData['Annual Tax Amount'] = features.taxAnnualAmount;
            if (features.hasCooling !== undefined) processedData['Has Cooling'] = features.hasCooling ? 'Yes' : 'No';
            if (features.parkingCapacity) processedData['Parking Capacity'] = `${features.parkingCapacity} space${features.parkingCapacity !== 1 ? 's' : ''}`;
            if (features.hasView !== undefined) processedData['Has View'] = features.hasView ? 'Yes' : 'No';
            if (features.hasHomeWarranty !== undefined) processedData['Has Home Warranty'] = features.hasHomeWarranty ? 'Yes' : 'No';
            if (features.homeType) processedData['Home Type'] = features.homeType;
            if (features.hasSpa !== undefined) processedData['Has Spa'] = features.hasSpa ? 'Yes' : 'No';
            if (features.hasHeating !== undefined) processedData['Has Heating'] = features.hasHeating ? 'Yes' : 'No';
            if (features.furnished !== undefined) processedData['Furnished'] = features.furnished ? 'Yes' : 'No';
            if (features.pricePerSquareFoot) processedData['Price Per Square Foot'] = `$${features.pricePerSquareFoot}`;
            if (features.garageSize) processedData['Garage Size'] = `${features.garageSize} car${features.garageSize !== '1' ? 's' : ''}`;
            if (features.garageSquareFootage) processedData['Garage Square Footage'] = `${features.garageSquareFootage} sq ft`;
            if (features.numberOfUnits) processedData['Number of Units'] = features.numberOfUnits;
            if (features.totalRooms) processedData['Total Rooms'] = features.totalRooms;
            if (features.numberOfStories) processedData['Number of Stories'] = features.numberOfStories;
            if (features.hasPool !== undefined) processedData['Has Pool'] = features.hasPool ? 'Yes' : 'No';
            if (features.hasFireplace !== undefined) processedData['Has Fireplace'] = features.hasFireplace ? 'Yes' : 'No';
            if (features.airConditioning !== undefined) processedData['Air Conditioning'] = features.airConditioning ? 'Yes' : 'No';
            if (features.heatingType !== undefined) processedData['Heating Type Available'] = features.heatingType ? 'Yes' : 'No';
            if (features.basementType) processedData['Basement Type'] = features.basementType;
            if (features.basementSquareFootage) processedData['Basement Square Footage'] = `${features.basementSquareFootage} sq ft`;
            if (features.roofType) processedData['Roof Type'] = features.roofType;
            if (features.exteriorWallType) processedData['Exterior Wall Type'] = features.exteriorWallType;
            if (features.hvacSystem !== undefined) processedData['HVAC System'] = features.hvacSystem ? 'Yes' : 'No';
            
            return;
          }
          
          // Handle financials object - extract individual properties
          if (key === 'financials' && typeof value === 'object' && value !== null) {
            const financials = value;
            if (financials.assessedValue) processedData['Assessed Value'] = financials.assessedValue;
            if (financials.annualTaxes) processedData['Annual Taxes'] = financials.annualTaxes;
            if (financials.parcelNumber) processedData['Parcel Number'] = financials.parcelNumber;
            return;
          }
          
          // CRITICAL FIX: Avoid duplicate mapping when beds/baths already exist
          if (key === 'beds') {
            processedData['beds'] = value;
            // Don't also create 'Bedrooms' to avoid duplicates
          } else if (key === 'baths') {
            processedData['baths'] = value;
            // Don't also create 'Bathrooms' to avoid duplicates
          } else if (key === 'SqFt' || key === 'sqft') {
            processedData['Square Footage'] = value;
          } else if (key === 'YearBuilt' || key === 'yearBuilt') {
            processedData['Year Built'] = value;
          } else if (key === 'LotSize' || key === 'lotSize') {
            processedData['Lot Size'] = value;
          } else if (key === 'LotSizeAcres' || key === 'lotSizeAcres') {
            processedData['Lot Size (Acres)'] = value;
          } else if (key === 'propertyType') {
            processedData['Property Type'] = value;
          } else if (key === 'daysOnMarket') {
            processedData['Days on Market'] = value;
          } else if (key === 'pricePerSqft') {
            processedData['Price per Sq Ft'] = `$${value}`;
          } else {
            // Keep the original key for direct webhook fields
            processedData[key] = value;
          }
        });
      }
    }

    console.log('[USE PROPERTY DATA] Final processed data:', processedData);
    setDisplayData(processedData);
    
  }, [initialData]);

  const updateDisplayData = (newData: Record<string, any>) => {
    console.log('[USE PROPERTY DATA] ========== USER EDIT DETECTED ==========');
    console.log('[USE PROPERTY DATA] Previous display data:', displayData);
    console.log('[USE PROPERTY DATA] New data from user edit:', newData);
    
    // Filter out backend-only fields from user edits too
    const backendOnlyFields = ['userType', 'imageUrls', 'userData'];
    const filteredNewData = { ...newData };
    backendOnlyFields.forEach(field => {
      delete filteredNewData[field];
    });
    
    console.log('[USE PROPERTY DATA] Final updated data that will be displayed:', filteredNewData);
    console.log('[USE PROPERTY DATA] Setting hasUserEdits to TRUE');
    
    setDisplayData(filteredNewData);
    setHasUserEdits(true);
    
    console.log('[USE PROPERTY DATA] ========== USER EDIT COMPLETE ==========');
  };

  console.log('[USE PROPERTY DATA] Current state - hasUserEdits:', hasUserEdits);
  console.log('[USE PROPERTY DATA] Current state - displayData keys:', Object.keys(displayData));

  return {
    displayData,
    updateDisplayData,
    hasUserEdits
  };
};

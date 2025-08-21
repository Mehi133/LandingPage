
import { PropertyListing } from '../types';
import { mapActiveListingFromWebhook, mapRecentSaleFromWebhook } from './propertyMapper';

/**
 * Processes and maps property listings from webhook data
 * UPDATED: Handles new nested comparable structure from webhook
 */
export const processActiveListings = (properties: any[]): PropertyListing[] => {
  console.log('[LISTINGS PROCESSOR] ======= PROCESSING ACTIVE LISTINGS =======');
  console.log('[LISTINGS PROCESSOR] Processing', properties.length, 'active listings');
  
  // NEW: Direct array processing for simplified webhook structure
  const extractedProperties = properties || [];
  
  const activeListings = extractedProperties
    .map((property: any, index: number) => {
      try {
        console.log(`[LISTINGS PROCESSOR] Processing active listing ${index}:`, property);
        
        // Skip error objects
        if (property && typeof property === 'object' && ('error' in property)) {
          console.log(`[LISTINGS PROCESSOR] Skipping item ${index} due to error:`, property.error);
          return null;
        }
        
        const mappedListing = mapActiveListingFromWebhook(property, index);
        console.log(`[LISTINGS PROCESSOR] Successfully mapped active listing ${index}:`, {
          id: mappedListing.id,
          address: mappedListing.address,
          price: mappedListing.price,
          beds: mappedListing.beds,
          baths: mappedListing.baths
        });
        
        return mappedListing;
      } catch (mappingError) {
        console.error(`[LISTINGS PROCESSOR] Error mapping active listing ${index}:`, mappingError);
        console.error(`[LISTINGS PROCESSOR] Problematic property data:`, property);
        return null;
      }
    })
    .filter((listing: any) => listing !== null);

  // Sort: listings with images first
  activeListings.sort((a: any, b: any) => {
    const aHasImages = Array.isArray(a.images) && a.images.length > 0;
    const bHasImages = Array.isArray(b.images) && b.images.length > 0;
    if (aHasImages === bHasImages) return 0;
    return aHasImages ? -1 : 1;
  });
  
  console.log('[LISTINGS PROCESSOR] Successfully processed', activeListings.length, 'active listings');
  return activeListings;
};

export const processRecentSales = (properties: any[]): PropertyListing[] => {
  console.log('[LISTINGS PROCESSOR] ======= PROCESSING RECENT SALES =======');
  console.log('[LISTINGS PROCESSOR] Processing', properties.length, 'recent sales');
  
  // NEW: Direct array processing for simplified webhook structure
  const extractedProperties = properties || [];
  
  const recentSales = extractedProperties
    .map((property: any, index: number) => {
      try {
        console.log(`[LISTINGS PROCESSOR] Processing recent sale ${index}:`, property);
        
        // Skip error objects
        if (property && typeof property === 'object' && ('error' in property)) {
          console.log(`[LISTINGS PROCESSOR] Skipping item ${index} due to error:`, property.error);
          return null;
        }
        
        const mappedSale = mapRecentSaleFromWebhook(property, index);
        console.log(`[LISTINGS PROCESSOR] Successfully mapped recent sale ${index}:`, {
          id: mappedSale.id,
          address: mappedSale.address,
          price: mappedSale.price,
          beds: mappedSale.beds,
          baths: mappedSale.baths,
          soldDate: mappedSale.soldDate
        });
        
        return mappedSale;
      } catch (mappingError) {
        console.error(`[LISTINGS PROCESSOR] Error mapping recent sale ${index}:`, mappingError);
        console.error(`[LISTINGS PROCESSOR] Problematic property data:`, property);
        return null;
      }
    })
    .filter((listing: any) => listing !== null);

  // Sort: listings with images first
  recentSales.sort((a: any, b: any) => {
    const aHasImages = Array.isArray(a.images) && a.images.length > 0;
    const bHasImages = Array.isArray(b.images) && b.images.length > 0;
    if (aHasImages === bHasImages) return 0;
    return aHasImages ? -1 : 1;
  });
  
  console.log('[LISTINGS PROCESSOR] Successfully processed', recentSales.length, 'recent sales');
  return recentSales;
};

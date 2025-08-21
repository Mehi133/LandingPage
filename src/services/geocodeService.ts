
import { loadGoogleMapsAPI } from '@/lib/googleMapsLoader';

let geocoder: google.maps.Geocoder | null = null;

async function getGeocoder(): Promise<google.maps.Geocoder> {
  if (geocoder) {
    return geocoder;
  }
  const google = await loadGoogleMapsAPI();
  geocoder = new google.maps.Geocoder();
  return geocoder;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  console.log(`🔍 Geocoding address: "${address}"`);
  
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    console.error('❌ Invalid address provided for geocoding:', address);
    return null;
  }

  try {
    const geocoderInstance = await getGeocoder();
    const request: google.maps.GeocoderRequest = { 
      address: address.trim(),
      componentRestrictions: {
        country: 'US'
      }
    };
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error(`❌ Geocoding timeout for "${address}"`);
        resolve(null);
      }, 10000); // Increased timeout to 10 seconds
      
      geocoderInstance.geocode(request, (results, status) => {
        clearTimeout(timeoutId);
        
        console.log(`🔍 Geocoding result for "${address}":`, { 
          status, 
          resultsCount: results?.length || 0,
          firstResult: results?.[0]?.formatted_address,
          coordinates: results?.[0] ? {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          } : null
        });
        
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          
          // Explicitly convert to numbers and validate
          const lat = Number(location.lat());
          const lng = Number(location.lng());
          
          if (isNaN(lat) || isNaN(lng)) {
            console.error(`❌ Invalid coordinates returned for "${address}":`, { lat, lng });
            resolve(null);
            return;
          }
          
          const result = {
            lat,
            lng,
            formattedAddress: results[0].formatted_address,
          };
          console.log(`✅ Geocoding successful for "${address}":`, result);
          resolve(result);
        } else {
          console.error(`❌ Geocoding failed for address "${address}": ${status}`);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('❌ Error during geocoding:', error);
    return null;
  }
}

// Simple distance calculation (Haversine formula) with coordinate validation
export function haversineDistance(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}): number {
  // Validate input coordinates
  if (!p1 || !p2 || 
      typeof p1.lat !== 'number' || typeof p1.lng !== 'number' || 
      typeof p2.lat !== 'number' || typeof p2.lng !== 'number' ||
      isNaN(p1.lat) || isNaN(p1.lng) || isNaN(p2.lat) || isNaN(p2.lng)) {
    console.warn('⚠️ Invalid coordinates provided for distance calculation:', { p1, p2 });
    return 0;
  }
  
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = +(R * c).toFixed(2);
  
  console.log(`📏 Calculated distance: ${distance} miles between:`, { p1, p2 });
  return distance;
}

// Enhanced batch geocode with better error handling and coordinate validation
export async function batchGeocodeAddresses(
  addresses: { address?: string; id: string; group: string; lat?: number; lng?: number }[]
): Promise<{ [key: string]: any }> {
  console.log('🗺️ Starting batch geocoding for addresses:', addresses.length);
  
  if (!addresses || addresses.length === 0) {
    console.warn('⚠️ No addresses provided for batch geocoding');
    return {};
  }
  
  await loadGoogleMapsAPI();
  
  const geocodedGroups: { [key: string]: any[] } = {};
  let successfulGeocodes = 0;
  let failedGeocodes = 0;

  // Process addresses with better error handling
  for (const entry of addresses) {
    const { group } = entry;

    if (!geocodedGroups[group]) {
      geocodedGroups[group] = [];
    }

    // Skip if already has valid coordinates
    if (entry.lat && entry.lng) {
      const lat = Number(entry.lat);
      const lng = Number(entry.lng);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log(`✅ Entry ${entry.id} already has valid coordinates:`, { lat, lng });
        geocodedGroups[group].push({ ...entry, lat, lng });
        successfulGeocodes++;
        continue;
      }
    }
    
    // Extract and validate address
    let addressString: string | null = null;
    
    if (typeof entry.address === 'string' && entry.address.trim().length > 0) {
      addressString = entry.address.trim();
    } else if (entry.address && typeof entry.address === 'object') {
      // Handle address objects
      const addr = entry.address as any;
      if (addr.fullAddress) {
        addressString = addr.fullAddress;
      } else {
        const parts = [addr.street, addr.city, addr.state, addr.zipCode]
          .filter(part => part && typeof part === 'string' && part.trim() !== '');
        if (parts.length > 0) {
          addressString = parts.join(', ');
        }
      }
    }
    
    if (!addressString || addressString.length < 5) {
      console.warn(`⚠️ Skipping geocoding for entry id "${entry.id}" - invalid/missing address:`, entry.address);
      failedGeocodes++;
      continue;
    }

    try {
      console.log(`🔍 Geocoding address for ${entry.id}: "${addressString}"`);
      
      const geocodeResult = await geocodeAddress(addressString);
      
      if (geocodeResult && 
          typeof geocodeResult.lat === 'number' && 
          typeof geocodeResult.lng === 'number' &&
          !isNaN(geocodeResult.lat) && 
          !isNaN(geocodeResult.lng)) {
        
        const item = { ...entry, address: addressString, ...geocodeResult };
        geocodedGroups[group].push(item);
        successfulGeocodes++;
        console.log(`✅ Successfully geocoded ${entry.id} with coordinates:`, {
          lat: geocodeResult.lat,
          lng: geocodeResult.lng
        });
      } else {
        console.warn(`⚠️ Geocoding returned invalid result for "${addressString}" (entry id: ${entry.id}):`, geocodeResult);
        failedGeocodes++;
      }
    } catch (error) {
      console.error(`❌ Error geocoding address "${addressString}" for entry ${entry.id}:`, error);
      failedGeocodes++;
    }
  }

  console.log('🗺️ Batch geocoding completed:', {
    totalAddresses: addresses.length,
    successful: successfulGeocodes, 
    failed: failedGeocodes
  });

  // Format output
  const finalOutput: { [key: string]: any } = {};
  for (const groupName in geocodedGroups) {
    if (groupName === 'subject' || groupName === 'selected') {
      finalOutput[groupName] = geocodedGroups[groupName][0] || null;
    } else {
      finalOutput[groupName] = geocodedGroups[groupName];
    }
  }

  console.log('🗺️ Final geocoding results:', finalOutput);
  return finalOutput;
}

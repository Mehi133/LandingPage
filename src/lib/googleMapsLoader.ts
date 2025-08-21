
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

let googleMapsPromise: Promise<typeof google> | null = null;
let apiKeyCache: string | null = null;

async function fetchApiKey(): Promise<string> {
  console.log('🔑 Fetching Google Maps API key...');
  
  if (apiKeyCache) {
    console.log('✅ Using cached API key');
    return apiKeyCache;
  }

  try {
    console.log('🔑 Calling Supabase function to get API key...');
    const { data, error } = await supabase.functions.invoke('get-google-maps-key');
    
    if (error) {
      console.error('❌ Error fetching Google Maps API key:', error);
      throw new Error(`API key fetch failed: ${error.message}`);
    }
    
    if (!data || !data.apiKey) {
      console.error('❌ API key not found in response:', data);
      throw new Error('API key not found in response');
    }
    
    console.log('✅ Successfully fetched API key');
    apiKeyCache = data.apiKey;
    return data.apiKey;
    
  } catch (fetchError) {
    console.error('❌ Failed to fetch API key:', fetchError);
    throw new Error('Google Maps API key configuration error');
  }
}

export function loadGoogleMapsAPI(): Promise<typeof google> {
  if (googleMapsPromise) {
    console.log('🗺️ Returning existing Google Maps API promise');
    return googleMapsPromise;
  }

  console.log('🗺️ Creating new Google Maps API loader promise');
  
  googleMapsPromise = new Promise(async (resolve, reject) => {
    try {
      const apiKey = await fetchApiKey();
      console.log('🗺️ Loading Google Maps with API key');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
        language: 'en',
        region: 'US'
      });

      console.log('🗺️ Initializing Google Maps loader...');
      await loader.load();
      
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps API loaded successfully');
        
        // Verify essential services are available
        const requiredServices = [
          'Geocoder',
          'DirectionsService', 
          'Map',
          'Marker',
          'LatLngBounds'
        ];
        
        const missingServices = requiredServices.filter(service => 
          !window.google.maps[service as keyof typeof window.google.maps]
        );
        
        if (missingServices.length === 0) {
          console.log('✅ All required Google Maps services verified');
          resolve(window.google);
        } else {
          console.error('❌ Missing Google Maps services:', missingServices);
          throw new Error(`Missing Google Maps services: ${missingServices.join(', ')}`);
        }
      } else {
        throw new Error('Google Maps API failed to initialize properly');
      }
    } catch (error) {
      console.error('❌ Error loading Google Maps API:', error);
      
      // Reset for retry capability
      googleMapsPromise = null;
      apiKeyCache = null;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown Google Maps loading error';
      reject(new Error(`Google Maps loading failed: ${errorMessage}`));
    }
  });

  return googleMapsPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return !!(window.google && window.google.maps && window.google.maps.Map);
}

export function resetGoogleMapsLoader(): void {
  console.log('🔄 Resetting Google Maps loader');
  googleMapsPromise = null;
  apiKeyCache = null;
}

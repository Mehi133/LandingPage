
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";
import { geocodeAddress, haversineDistance } from "@/services/geocodeService";

interface GoogleMapDistanceProps {
  subjectProperty: any;
  comparableProperty: any;
  propertyType?: 'sold' | 'active';
  height?: number;
}

const GoogleMapDistance: React.FC<GoogleMapDistanceProps> = ({
  subjectProperty,
  comparableProperty,
  propertyType = 'active',
  height = 300
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [subjectGeoData, setSubjectGeoData] = useState<any>(null);
  const [comparableGeoData, setComparableGeoData] = useState<any>(null);
  const [distance, setDistance] = useState<string>('');
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🗺️ GoogleMapDistance render - Properties:', {
    subject: subjectProperty?.address,
    comparable: comparableProperty?.address,
    propertyType,
    windowGoogle: !!window.google
  });

  // Enhanced address extraction with multiple fallbacks (like ReportMapSection)
  const extractAddress = (property: any, propertyName: string): string | null => {
    if (!property) {
      console.error(`❌ No ${propertyName} property provided`);
      return null;
    }

    // Primary: Check for address field
    if (property.address && typeof property.address === 'string' && property.address.trim()) {
      const address = property.address.trim();
      console.log(`📍 ✅ Using ${propertyName}.address:`, address);
      return address;
    }
    
    // Secondary: Check for propertyAddress
    if (property.propertyAddress && typeof property.propertyAddress === 'string' && property.propertyAddress.trim()) {
      const address = property.propertyAddress.trim();
      console.log(`📍 ✅ Using ${propertyName}.propertyAddress:`, address);
      return address;
    }
    
    // Tertiary: Check for streetAddress
    if (property.streetAddress && typeof property.streetAddress === 'string' && property.streetAddress.trim()) {
      const address = property.streetAddress.trim();
      console.log(`📍 ✅ Using ${propertyName}.streetAddress:`, address);
      return address;
    }

    console.error(`❌ No valid ${propertyName} address found!`, {
      keys: Object.keys(property),
      addressField: property.address,
      propertyAddressField: property.propertyAddress,
      streetAddressField: property.streetAddress
    });
    return null;
  };

  // Validation helper for coordinates (same as before)
  const validateCoordinates = (lat: any, lng: any): { lat: number; lng: number } | null => {
    const numLat = typeof lat === 'number' ? lat : parseFloat(String(lat));
    const numLng = typeof lng === 'number' ? lng : parseFloat(String(lng));
    
    if (isNaN(numLat) || isNaN(numLng) || 
        numLat < -90 || numLat > 90 || 
        numLng < -180 || numLng > 180) {
      console.error('❌ Invalid coordinates:', { lat, lng, numLat, numLng });
      return null;
    }
    
    return { lat: numLat, lng: numLng };
  };

  // Geocode individual property with retry logic
  const geocodeProperty = async (property: any, propertyName: string, retryCount = 0): Promise<any> => {
    const maxRetries = 2;
    
    try {
      const address = extractAddress(property, propertyName);
      if (!address) {
        throw new Error(`${propertyName} property address is missing or invalid`);
      }

      console.log(`🔍 Geocoding ${propertyName}: "${address}" (attempt ${retryCount + 1})`);
      
      const result = await geocodeAddress(address);
      
      if (!result) {
        throw new Error(`Geocoding failed for ${propertyName}: ${address}`);
      }

      // Validate coordinates
      const coords = validateCoordinates(result.lat, result.lng);
      if (!coords) {
        throw new Error(`Invalid coordinates returned for ${propertyName}: ${address}`);
      }

      console.log(`✅ Successfully geocoded ${propertyName}:`, coords);
      return { ...result, ...coords, address };

    } catch (error) {
      console.error(`❌ Error geocoding ${propertyName} (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying ${propertyName} geocoding in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return geocodeProperty(property, propertyName, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Main geocoding effect
  useEffect(() => {
    const geocodeProperties = async () => {
      try {
        setIsLoading(true);
        setGeocodingError(null);
        
        console.log('🚀 Starting geocoding for both properties...');

        // Geocode both properties
        const [subjectResult, comparableResult] = await Promise.allSettled([
          geocodeProperty(subjectProperty, 'subject'),
          geocodeProperty(comparableProperty, 'comparable')
        ]);

        // Handle results
        let subjectData = null;
        let comparableData = null;
        let errors = [];

        if (subjectResult.status === 'fulfilled') {
          subjectData = subjectResult.value;
          setSubjectGeoData(subjectData);
        } else {
          errors.push(`Subject: ${subjectResult.reason.message}`);
        }

        if (comparableResult.status === 'fulfilled') {
          comparableData = comparableResult.value;
          setComparableGeoData(comparableData);
        } else {
          errors.push(`Comparable: ${comparableResult.reason.message}`);
        }

        // Calculate distance if both succeeded
        if (subjectData && comparableData) {
          const dist = haversineDistance(
            { lat: subjectData.lat, lng: subjectData.lng },
            { lat: comparableData.lat, lng: comparableData.lng }
          );
          setDistance(`${dist} miles`);
          console.log('📏 Distance calculated:', `${dist} miles`);
        }

        // Handle errors
        if (errors.length > 0) {
          if (errors.length === 2) {
            setGeocodingError(`Failed to geocode both properties: ${errors.join('; ')}`);
          } else {
            setGeocodingError(`Partial geocoding failure: ${errors.join('; ')}`);
          }
        }

      } catch (error) {
        console.error('❌ Unexpected error in geocoding:', error);
        setGeocodingError('Unexpected geocoding error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (subjectProperty && comparableProperty) {
      geocodeProperties();
    } else {
      setGeocodingError('Missing property data for mapping');
      setIsLoading(false);
    }
  }, [subjectProperty, comparableProperty]);

  // Map creation effect
  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      return;
    }
    
    if (!subjectGeoData || !comparableGeoData) {
      return;
    }

    console.log('🗺️ Creating map with geocoded data');

    try {
      // Create map centered on subject property
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: subjectGeoData.lat, lng: subjectGeoData.lng },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      });
      
      mapInstanceRef.current = map;

      // Clean up existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();

      // Create subject marker (always green)
      const subjectMarker = new window.google.maps.Marker({
        position: { lat: subjectGeoData.lat, lng: subjectGeoData.lng },
        map: map,
        title: 'Subject Property',
        icon: {
          url: "data:image/svg+xml;base64," + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="13" r="7" fill="#27ae60" stroke="#fff" stroke-width="2"/>
              <path d="M16 27C16 27 8 19.0025 8 13C8 8.02944 11.5817 4 16 4C20.4183 4 24 8.02944 24 13C24 19.0025 16 27 16 27Z" fill="#27ae60" stroke="#222" stroke-width="1.5"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 28)
        },
        zIndex: 20,
      });

      // Create comparable marker with dynamic color based on property type
      const comparableColor = propertyType === 'sold' ? '#e74c3c' : '#3b82f6';
      
      const comparableMarker = new window.google.maps.Marker({
        position: { lat: comparableGeoData.lat, lng: comparableGeoData.lng },
        map: map,
        title: 'Comparable Property',
        icon: {
          url: "data:image/svg+xml;base64," + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="13" r="7" fill="${comparableColor}" stroke="#fff" stroke-width="2"/>
              <path d="M16 27C16 27 8 19.0025 8 13C8 8.02944 11.5817 4 16 4C20.4183 4 24 8.02944 24 13C24 19.0025 16 27 16 27Z" fill="${comparableColor}" stroke="#222" stroke-width="1.5"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 28)
        },
        zIndex: 19,
      });

      markersRef.current.push(subjectMarker, comparableMarker);

      // Fit bounds to show both markers
      bounds.extend({ lat: subjectGeoData.lat, lng: subjectGeoData.lng });
      bounds.extend({ lat: comparableGeoData.lat, lng: comparableGeoData.lng });
      map.fitBounds(bounds, 50);

      console.log('✅ Map created successfully with both markers');

    } catch (error) {
      console.error('❌ Error creating map:', error);
      setGeocodingError('Failed to create map: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current = undefined;
      }
    };
  }, [subjectGeoData, comparableGeoData, propertyType]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <span className="text-gray-600">Loading map...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (geocodingError) {
    return (
      <div className="flex items-center justify-center h-48 text-orange-600 bg-orange-50 rounded-lg border border-orange-200">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Map temporarily unavailable</p>  
          <p className="text-sm text-gray-600 mt-1">{geocodingError}</p>
          <p className="text-xs text-gray-500 mt-2">
            Subject: {subjectProperty?.address || 'No address'}<br/>
            Comparable: {comparableProperty?.address || 'No address'}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      {distance && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-4">
            <Navigation className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">
                Distance: <span className="text-blue-600">{distance}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{ width: "100%", height: `${height}px` }}
        className="rounded-lg border border-gray-200"
      />
      
      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Subject Property
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${propertyType === 'sold' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          {propertyType === 'sold' ? 'Recent Sale' : 'Active Listing'}
        </div>
      </div>
    </div>
  );
};

export default GoogleMapDistance;

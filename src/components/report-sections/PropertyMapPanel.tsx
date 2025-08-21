
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadGoogleMapsAPI } from '@/lib/googleMapsLoader';
import { MapPin, Loader2 } from 'lucide-react';

interface PropertyMapPanelProps {
  subjectProperty: any;
  userEnteredAddress?: string;
}

const PropertyMapPanel: React.FC<PropertyMapPanelProps> = ({ 
  subjectProperty, 
  userEnteredAddress 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const address = userEnteredAddress || subjectProperty?.address;

  useEffect(() => {
    if (!address || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await loadGoogleMapsAPI();
        
        const geocoder = new google.maps.Geocoder();
        const geocodeResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        if (geocodeResult.length === 0) {
          throw new Error('No location found for this address');
        }

        const location = geocodeResult[0].geometry.location;
        
        const map = new google.maps.Map(mapRef.current!, {
          center: location,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        new google.maps.Marker({
          position: location,
          map: map,
          title: address,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#dc2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [address]);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Property Location</h3>
          <Badge variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Interactive Map
          </Badge>
        </div>
        
        <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden border border-border">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading map...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map unavailable</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full" />
        </div>
        
        {address && (
          <div className="mt-4 text-xs text-muted-foreground">
            {address}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyMapPanel;


import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, Star, Loader2 } from "lucide-react";
import { loadGoogleMapsAPI } from '@/lib/googleMapsLoader';

interface School {
  name: string;
  type: string;
  grades?: string;
  rating?: number;
  distance?: string;
  location?: { lat: number; lng: number };
  address?: string;
}

interface SchoolsSectionProps {
  schools: School[];
  subjectProperty: any;
  userEnteredAddress?: string;
}

const SchoolsSection: React.FC<SchoolsSectionProps> = ({ 
  schools, 
  subjectProperty, 
  userEnteredAddress 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolsWithLocations, setSchoolsWithLocations] = useState<School[]>([]);

  const address = userEnteredAddress || subjectProperty?.address;

  useEffect(() => {
    if (!address || !mapRef.current || schools.length === 0) {
      setIsLoading(false);
      return;
    }

    const initializeSchoolsMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await loadGoogleMapsAPI();
        
        // Geocode the subject property
        const geocoder = new google.maps.Geocoder();
        const subjectResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        if (subjectResult.length === 0) {
          throw new Error('No location found for property address');
        }

        const subjectLocation = subjectResult[0].geometry.location;
        
        // Create the map
        const map = new google.maps.Map(mapRef.current!, {
          center: subjectLocation,
          zoom: 13,
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

        // Add subject property marker
        new google.maps.Marker({
          position: subjectLocation,
          map: map,
          title: 'Subject Property',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#dc2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          }
        });

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(subjectLocation);

        // Geocode schools and add markers
        const geocodedSchools: School[] = [];
        
        for (const school of schools) {
          try {
            // Create search query using school name and property address components
            const addressParts = address.split(',');
            const city = addressParts[1]?.trim() || '';
            const stateZip = addressParts[2]?.trim() || '';
            const searchQuery = `${school.name}, ${city}, ${stateZip}`;
            
            const schoolResult = await new Promise<google.maps.GeocoderResult[]>((resolve) => {
              geocoder.geocode({ address: searchQuery }, (results, status) => {
                if (status === 'OK' && results) {
                  resolve(results);
                } else {
                  resolve([]);
                }
              });
            });

            if (schoolResult.length > 0) {
              const schoolLocation = schoolResult[0].geometry.location;
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                subjectLocation,
                schoolLocation
              ) / 1609.34; // Convert to miles

              const schoolWithLocation = {
                ...school,
                location: {
                  lat: schoolLocation.lat(),
                  lng: schoolLocation.lng()
                },
                address: schoolResult[0].formatted_address,
                distance: `${Math.round(distance * 10) / 10} mi`
              };

              geocodedSchools.push(schoolWithLocation);

              // Add school marker
              const marker = new google.maps.Marker({
                position: schoolLocation,
                map: map,
                title: school.name,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#2563eb',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }
              });

              // Add info window
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-semibold text-sm">${school.name}</h3>
                    <p class="text-xs text-gray-600">${school.type}</p>
                    ${school.rating ? `<p class="text-xs">Rating: ${school.rating}/10</p>` : ''}
                    <p class="text-xs">${Math.round(distance * 10) / 10} miles away</p>
                  </div>
                `
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });

              bounds.extend(schoolLocation);
            }
          } catch (error) {
            console.warn(`Failed to geocode school: ${school.name}`, error);
          }
        }

        setSchoolsWithLocations(geocodedSchools);
        
        // Fit map to show all markers
        if (geocodedSchools.length > 0) {
          map.fitBounds(bounds, 50);
        }

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Schools map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schools map');
        setIsLoading(false);
      }
    };

    initializeSchoolsMap();
  }, [address, schools]);

  const displaySchools = schoolsWithLocations.length > 0 ? schoolsWithLocations : schools;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">School Information</h3>
        <Badge variant="secondary" className="text-xs">
          {displaySchools.length} school{displaySchools.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schools List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Schools List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displaySchools.map((school, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-base text-foreground">{school.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {school.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {school.grades && (
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">Grades:</span>
                        <p className="text-sm font-medium text-foreground">{school.grades}</p>
                      </div>
                    )}
                    {school.rating && (
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <p className="text-sm font-bold text-primary">{school.rating}/10</p>
                        </div>
                      </div>
                    )}
                    {school.distance && (
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">Distance:</span>
                        <p className="text-sm font-medium text-foreground">{school.distance}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schools Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Schools Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden border border-border">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading schools map...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Schools map unavailable</p>
                    <p className="text-xs">{error}</p>
                  </div>
                </div>
              )}
              
              <div ref={mapRef} className="w-full h-full" />
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span>Subject Property</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Schools</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolsSection;

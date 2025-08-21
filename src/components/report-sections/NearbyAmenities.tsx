
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Coffee, ShoppingBag, Trees, GraduationCap, Train, Star, Clock, Phone } from "lucide-react";
import { loadGoogleMapsAPI } from '@/lib/googleMapsLoader';

interface Amenity {
  id: string;
  name: string;
  category: string;
  distance: number;
  rating?: number;
  address: string;
  location: { lat: number; lng: number };
  phoneNumber?: string;
  website?: string;
  hours?: string;
}

interface NearbyAmenitiesProps {
  subjectProperty: any;
  userEnteredAddress?: string;
}

const categoryIcons = {
  restaurant: Coffee,
  shopping: ShoppingBag,
  park: Trees,
  school: GraduationCap,
  transit: Train,
  default: MapPin
};

const categoryColors = {
  restaurant: 'bg-orange-100 text-orange-800',
  shopping: 'bg-purple-100 text-purple-800',
  park: 'bg-green-100 text-green-800',
  school: 'bg-blue-100 text-blue-800',
  transit: 'bg-gray-100 text-gray-800'
};

const NearbyAmenities: React.FC<NearbyAmenitiesProps> = ({ 
  subjectProperty, 
  userEnteredAddress 
}) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['restaurant', 'shopping', 'park', 'school', 'transit']);
  const [error, setError] = useState<string | null>(null);

  const address = userEnteredAddress || subjectProperty?.address;

  useEffect(() => {
    if (!address) return;

    const findNearbyPlaces = async () => {
      try {
        setLoading(true);
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
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        const searchTypes = [
          { type: 'restaurant', category: 'restaurant' },
          { type: 'shopping_mall', category: 'shopping' },
          { type: 'store', category: 'shopping' },
          { type: 'park', category: 'park' },
          { type: 'school', category: 'school' },
          { type: 'subway_station', category: 'transit' },
          { type: 'train_station', category: 'transit' }
        ];

        const allAmenities: Amenity[] = [];

        for (const searchType of searchTypes) {
          try {
            const places = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
              service.nearbySearch({
                location,
                radius: 2000, // 2km radius
                type: searchType.type as any
              }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  resolve(results);
                } else {
                  resolve([]);
                }
              });
            });

            // Get detailed info for each place
            for (const place of places.slice(0, 3)) {
              if (place.place_id && place.name && place.geometry?.location) {
                try {
                  const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
                    service.getDetails({
                      placeId: place.place_id!,
                      fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'opening_hours']
                    }, (result, status) => {
                      if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                        resolve(result);
                      } else {
                        resolve(place);
                      }
                    });
                  });

                  const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    location,
                    place.geometry.location
                  ) / 1609.34; // Convert to miles

                  allAmenities.push({
                    id: place.place_id,
                    name: place.name,
                    category: searchType.category,
                    distance: Math.round(distance * 10) / 10,
                    rating: place.rating,
                    address: details.formatted_address || place.vicinity || '',
                    phoneNumber: details.formatted_phone_number,
                    website: details.website,
                    hours: details.opening_hours?.weekday_text?.[new Date().getDay()]?.replace(/^[a-zA-Z]+:\s*/, ''),
                    location: {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng()
                    }
                  });
                } catch (error) {
                  // Fallback to basic info if details fetch fails
                  const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    location,
                    place.geometry.location
                  ) / 1609.34;

                  allAmenities.push({
                    id: place.place_id,
                    name: place.name,
                    category: searchType.category,
                    distance: Math.round(distance * 10) / 10,
                    rating: place.rating,
                    address: place.vicinity || '',
                    location: {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng()
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to search for ${searchType.type}:`, error);
          }
        }

        // Sort by distance and remove duplicates
        const uniqueAmenities = allAmenities
          .filter((amenity, index, self) => 
            index === self.findIndex(a => a.name === amenity.name && a.category === amenity.category)
          )
          .sort((a, b) => a.distance - b.distance);

        setAmenities(uniqueAmenities);
        setError(null);
      } catch (err) {
        console.error('Error finding nearby places:', err);
        setError(err instanceof Error ? err.message : 'Failed to load nearby amenities');
      } finally {
        setLoading(false);
      }
    };

    findNearbyPlaces();
  }, [address]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredAmenities = amenities.filter(amenity => 
    selectedCategories.includes(amenity.category)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Nearby Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading nearby places...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Nearby Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Unable to load amenities: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Nearby Amenities</CardTitle>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.keys(categoryIcons).filter(cat => cat !== 'default').map(category => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category)}
                className="text-xs capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAmenities.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No amenities found in selected categories
              </div>
            ) : (
              filteredAmenities.slice(0, 12).map(amenity => {
                const IconComponent = categoryIcons[amenity.category as keyof typeof categoryIcons] || categoryIcons.default;
                const colorClass = categoryColors[amenity.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
                
                return (
                  <Dialog key={amenity.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <div className="flex items-start justify-between p-3 bg-muted/30 rounded-md border hover:shadow-sm transition-shadow cursor-pointer">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <h4 className="text-sm font-medium text-foreground truncate">{amenity.name}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{amenity.distance} mi</span>
                                {amenity.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{amenity.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className={`text-xs ${colorClass} ml-2 flex-shrink-0`}>
                              {amenity.category}
                            </Badge>
                          </div>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{amenity.name}</p>
                          <p className="text-xs text-muted-foreground">{amenity.address}</p>
                          <p className="text-xs">Distance: {amenity.distance} miles</p>
                          {amenity.rating && (
                            <p className="text-xs">Rating: {amenity.rating}/5</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          {amenity.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{amenity.address}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="text-sm font-medium">{amenity.distance} miles</p>
                          </div>
                          {amenity.rating && (
                            <div>
                              <p className="text-xs text-muted-foreground">Rating</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{amenity.rating}/5</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {amenity.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{amenity.phoneNumber}</span>
                          </div>
                        )}

                        {amenity.hours && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{amenity.hours}</span>
                          </div>
                        )}

                        {amenity.website && (
                          <div>
                            <a 
                              href={amenity.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}

                        <Badge className={colorClass}>
                          {amenity.category}
                        </Badge>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default NearbyAmenities;

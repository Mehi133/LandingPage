
import React, { useMemo, useState } from "react";
import PropertyMap from "./PropertyMap";
import PropertyHoverCard from "./PropertyHoverCard";
import MapLegend from "./MapLegend";
import { batchGeocodeAddresses, haversineDistance } from "@/services/geocodeService";
import { Card, CardContent } from "./ui/card";
import { MapPin, AlertTriangle } from "lucide-react";

interface ReportMapSectionProps {
  subject: any;
  activeListings: any[];
  recentSales: any[];
}

const ReportMapSection: React.FC<ReportMapSectionProps> = ({
  subject,
  activeListings,
  recentSales,
}) => {
  const [hoveredPin, setHoveredPin] = useState<string | number | null>(null);
  const [geoData, setGeoData] = React.useState<any>(null);
  const [geocodingError, setGeocodingError] = React.useState<string | null>(null);

  console.log('🗺️ ReportMapSection received:');
  console.log('🗺️ Subject:', subject);
  console.log('🗺️ Subject address:', subject?.address);

  React.useEffect(() => {
    const geocodeAddresses = async () => {
      try {
        console.log('🗺️ ReportMapSection preparing addresses for geocoding...');
        
        const addresses = [];
        
        // ENHANCED: Better address extraction with multiple fallbacks
        let subjectAddress = null;
        
        // Primary: Check for address field
        if (subject?.address && typeof subject.address === 'string' && subject.address.trim()) {
          subjectAddress = subject.address.trim();
          console.log('📍 ✅ Using subject.address:', subjectAddress);
        }
        // Secondary: Check for propertyAddress
        else if (subject?.propertyAddress && typeof subject.propertyAddress === 'string' && subject.propertyAddress.trim()) {
          subjectAddress = subject.propertyAddress.trim();
          console.log('📍 ✅ Using subject.propertyAddress:', subjectAddress);
        }
        // Tertiary: Check for streetAddress
        else if (subject?.streetAddress && typeof subject.streetAddress === 'string' && subject.streetAddress.trim()) {
          subjectAddress = subject.streetAddress.trim();
          console.log('📍 ✅ Using subject.streetAddress:', subjectAddress);
        }
        
        if (!subjectAddress) {
          console.error('❌ CRITICAL: No valid subject property address found!', {
            subjectKeys: subject ? Object.keys(subject) : 'null',
            addressField: subject?.address,
            propertyAddressField: subject?.propertyAddress,
            streetAddressField: subject?.streetAddress
          });
          setGeocodingError('Subject property address is missing or invalid');
          return;
        }
        
        console.log('📍 ✅ ADDING SUBJECT PROPERTY TO GEOCODING:', subjectAddress);
        addresses.push({ 
          ...subject, 
          id: "subject", 
          group: "subject",
          address: subjectAddress
        });
        
        // Add active listings
        if (activeListings && activeListings.length > 0) {
          activeListings.forEach((a, idx) => {
            if (a.address && typeof a.address === 'string' && a.address.trim()) {
              console.log(`📍 Adding active listing ${idx}:`, a.address);
              addresses.push({ ...a, id: `active-${a.id || idx}`, group: "active" });
            }
          });
        }
        
        // Add recent sales
        if (recentSales && recentSales.length > 0) {
          recentSales.forEach((s, idx) => {
            if (s.address && typeof s.address === 'string' && s.address.trim()) {
              console.log(`📍 Adding recent sale ${idx}:`, s.address);
              addresses.push({ ...s, id: `sold-${s.id || idx}`, group: "sold" });
            }
          });
        }
        
        console.log('📍 TOTAL ADDRESSES TO GEOCODE:', addresses.length);
        
        if (addresses.length === 0) {
          setGeocodingError('No valid addresses to geocode');
          return;
        }
        
        const results = await batchGeocodeAddresses(addresses);
        console.log('✅ GEOCODING RESULTS RECEIVED:', results);
        
        // CRITICAL CHECK: Ensure subject property geocoded successfully
        if (!results.subject) {
          console.error('❌ CRITICAL: Subject property failed to geocode!');
          setGeocodingError('Subject property failed to geocode');
          return;
        } else {
          console.log('✅ SUBJECT GEOCODED SUCCESSFULLY:', {
            id: results.subject.id,
            lat: results.subject.lat,
            lng: results.subject.lng,
            address: results.subject.address
          });
        }
        
        setGeoData(results);
        setGeocodingError(null);
      } catch (error) {
        console.error('❌ Error in batch geocoding:', error);
        setGeocodingError(error instanceof Error ? error.message : 'Unknown geocoding error');
      }
    };

    // Only geocode if we have a subject property with valid address
    if (subject && subject.address) {
      geocodeAddresses();
    } else {
      console.error('❌ No subject property or address provided to ReportMapSection', {
        hasSubject: !!subject,
        subjectAddress: subject?.address,
        subjectKeys: subject ? Object.keys(subject) : 'null'
      });
      setGeocodingError('Subject property or address is missing');
    }
  }, [subject, activeListings, recentSales]);

  // Show loading state
  if (!geoData && !geocodingError) {
    return (
      <Card className="shadow-lg border-gray-200">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Property & Comparables Map
          </h2>
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            Loading property map...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state with fallback
  if (geocodingError) {
    return (
      <Card className="shadow-lg border-gray-200">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Property & Comparables Map
          </h2>
          <div className="flex items-center justify-center h-40 text-orange-600 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-medium">Map temporarily unavailable</p>
              <p className="text-sm text-gray-600">Unable to load property locations: {geocodingError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare pins with enhanced debugging
  const pins = [];
  
  // CRITICAL: ALWAYS include subject pin if available
  if (geoData.subject) {
    console.log('📌 ✅ ADDING SUBJECT PIN:', geoData.subject);
    pins.push({
      id: geoData.subject.id,
      lat: geoData.subject.lat,
      lng: geoData.subject.lng,
      type: "subject",
      color: "#27ae60", // Green color for subject
      property: subject,
    });
  }
  
  // Add active listings pins
  if (geoData.active && Array.isArray(geoData.active)) {
    geoData.active.forEach((a: any) => {
      const originalListing = activeListings.find((x) => `active-${x.id || activeListings.indexOf(x)}` === a.id);
      pins.push({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        type: "active" as const,
        color: "#2773fa", // Blue color for active
        property: originalListing || {},
      });
    });
  }
  
  // Add sold listings pins
  if (geoData.sold && Array.isArray(geoData.sold)) {
    geoData.sold.forEach((s: any) => {
      const originalSale = recentSales.find((x) => `sold-${x.id || recentSales.indexOf(x)}` === s.id);
      pins.push({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        type: "sold" as const,
        color: "#e74c3c", // Red color for sold
        property: originalSale || {},
      });
    });
  }

  console.log('📌 FINAL PINS FOR MAP:', pins.length, 'pins');
  console.log('📌 SUBJECT PIN VERIFICATION:', pins.find(p => p.type === 'subject'));

  // If no pins can be rendered, show fallback
  if (pins.length === 0) {
    return (
      <Card className="shadow-lg border-gray-200">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Property & Comparables Map
          </h2>
          <div className="flex items-center justify-center h-40 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-medium">No locations available</p>
              <p className="text-sm">Unable to determine property locations for mapping</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find center (subject) for initial view, or fallback to first pin
  const subjectLoc = geoData.subject
    ? { lat: geoData.subject.lat, lng: geoData.subject.lng }
    : pins.length > 0 ? { lat: pins[0].lat, lng: pins[0].lng } : { lat: 0, lng: 0 };

  // Hovered Property
  const hoveredProp = pins.find((pin) => pin.id === hoveredPin)?.property || null;
  const hoveredType = pins.find((pin) => pin.id === hoveredPin)?.type || null;

  return (
    <Card className="shadow-lg border-gray-200">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-tight flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Property & Comparables Map
        </h2>
        <div className="relative rounded-lg overflow-hidden border">
          <PropertyMap
            center={subjectLoc}
            pins={pins}
            onPinHover={setHoveredPin}
            hoveredPinId={hoveredPin}
            legend={<MapLegend />}
            height={360}
          />
          {hoveredProp && (
            <div className="absolute right-2 top-2 z-30">
              <PropertyHoverCard property={hoveredProp} type={hoveredType} small />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMapSection;

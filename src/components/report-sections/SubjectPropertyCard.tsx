import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Home } from "lucide-react";
import { extractDisplayAddress } from './utils/propertyDisplayUtils';

interface SubjectPropertyCardProps {
  subjectProperty: any;
  fallbackImage: string;
}

const SubjectPropertyCard: React.FC<SubjectPropertyCardProps> = ({
  subjectProperty,
  fallbackImage
}) => {
  console.log('🏠 SubjectPropertyCard rendering:', subjectProperty);

  // FIXED: Format beds/baths to show exact decimal values (never round)
  const safeFormatBedsOrBaths = (value: any): string => {
    try {
      if (value === null || value === undefined || value === '') return 'N/A';
      
      // Convert to number and preserve decimals
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return 'N/A';
      
      // Show exact decimal value, no rounding
      return numValue.toString();
    } catch {
      return 'N/A';
    }
  };

  const safeFormatPrice = (price: any): string => {
    try {
      if (!price || price === 0) return 'N/A';
      const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
      if (isNaN(numPrice)) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numPrice);
    } catch (error) {
      console.error('❌ Error formatting price:', error);
      return 'N/A';
    }
  };

  const safeFormatSqft = (sqft: any): string => {
    try {
      if (!sqft || sqft === 0) return 'N/A';
      if (typeof sqft === 'string' && (sqft.includes('sq ft') || sqft.includes('acres'))) {
        return sqft;
      }
      const numSqft = typeof sqft === 'string' ? parseFloat(sqft.replace(/[^0-9.]/g, '')) : sqft;
      if (isNaN(numSqft)) return 'N/A';
      return new Intl.NumberFormat('en-US').format(numSqft) + ' sqft';
    } catch (error) {
      console.error('❌ Error formatting size:', error);
      return 'N/A';
    }
  };

  // Extract data with FIXED beds/baths formatting
  const displayAddress = extractDisplayAddress(subjectProperty);
  const displayPrice = safeFormatPrice(subjectProperty.price);
  const beds = safeFormatBedsOrBaths(subjectProperty.beds || subjectProperty.bedrooms);
  const baths = safeFormatBedsOrBaths(subjectProperty.baths || subjectProperty.bathrooms);
  const sqft = safeFormatSqft(subjectProperty.sqft);
  
  const primaryImage = subjectProperty.images?.[0] || subjectProperty.imgSrc || fallbackImage;

  return (
    <Card className="border-2 border-primary/50 bg-primary/5 relative overflow-hidden h-full flex flex-col">
      <Badge className="absolute top-3 left-3 z-10 bg-primary hover:bg-primary/90 text-primary-foreground">
        <Home className="h-3 w-3 mr-1" />
        Subject Property
      </Badge>
      
      <div className="relative overflow-hidden rounded-t-lg" style={{ height: '200px' }}>
        <img
          src={primaryImage}
          alt={displayAddress}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn(`🖼️ Subject property image failed to load, using fallback`);
            e.currentTarget.src = fallbackImage;
          }}
        />
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2 leading-5">
                {displayAddress}
              </p>
            </div>
            
            <div className="text-xl font-bold text-primary">
              {displayPrice}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{beds}</span>
              <span className="text-muted-foreground">bed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{baths}</span>
              <span className="text-muted-foreground">bath</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-xs">{sqft}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPropertyCard;

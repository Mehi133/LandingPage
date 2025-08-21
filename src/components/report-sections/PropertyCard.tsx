import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Calendar, Eye } from "lucide-react";
import { extractDisplayAddress, extractDisplayPrice } from './utils/propertyDisplayUtils';

interface PropertyCardProps {
  listing: any;
  index: number;
  currentPage: number;
  showSoldDate?: boolean;
  fallbackImage: string;
  onPropertyClick: (listing: any) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  index,
  currentPage,
  showSoldDate = false,
  fallbackImage,
  onPropertyClick
}) => {
  console.log(`🏠 PropertyCard ${index} rendering:`, listing);

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

  const safeFormatDate = (date: any): string => {
    try {
      if (!date) return 'N/A';
      
      if (typeof date === 'number' && date > 1000000000000) {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'N/A';
    }
  };

  // Extract data with FIXED beds/baths formatting
  const displayAddress = extractDisplayAddress(listing);
  const displayPrice = extractDisplayPrice(listing);
  const beds = safeFormatBedsOrBaths(listing.beds || listing.bedrooms);
  const baths = safeFormatBedsOrBaths(listing.baths || listing.bathrooms);
  const sqft = safeFormatSqft(listing.sqft);
  
  const primaryImage = listing.images?.[0] || listing.imgSrc || fallbackImage;
  
  const propertyStatus = listing.status?.toLowerCase();
  const isSold = propertyStatus === 'sold' || propertyStatus === 'closed' || propertyStatus === 'pending' || 
                 listing.event === 'Sold' || listing.event === 'sold' ||
                 listing.soldDate || listing.closedDate || listing.saleDate ||
                 listing.dateOfSale || listing['Sold Date'] || listing['Sale Date'];

  const soldDate = showSoldDate && isSold ? (
    listing.soldDate || listing.closedDate || listing.saleDate || 
    listing.dateOfSale || listing['Sold Date'] || listing['Sale Date'] || 
    listing.date
  ) : null;

  const handleClick = () => {
    console.log(`🏠 PropertyCard ${index} clicked:`, displayAddress);
    onPropertyClick(listing);
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-card h-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-lg" style={{ height: '200px' }}>
        <img
          src={primaryImage}
          alt={displayAddress}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.warn(`🖼️ Image failed to load for ${displayAddress}, using fallback`);
            e.currentTarget.src = fallbackImage;
          }}
        />
        
        {isSold && (
          <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700 text-white">
            Sold
          </Badge>
        )}
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={handleClick}
            size="sm"
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
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

          {soldDate && (
            <div className="flex items-center gap-1.5 text-sm pt-2 border-t border-border">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Sold:</span>
              <span className="font-medium">{safeFormatDate(soldDate)}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleClick}
          variant="outline"
          size="sm"
          className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;

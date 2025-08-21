import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Calendar, Navigation, ChevronDown, ChevronUp } from "lucide-react";
import PropertyImageCarousel from './PropertyImageCarousel';
import PropertyFeatureDisplay from './PropertyFeatureDisplay';
import EnhancedPriceHistoryChart from './property-modal/EnhancedPriceHistoryChart';
import EnhancedTaxHistoryChart from './property-modal/EnhancedTaxHistoryChart';
import CollapsibleSection from './property-modal/CollapsibleSection';
import GoogleMapDistance from './GoogleMapDistance';
import { ModalErrorBoundary } from './ModalErrorBoundary';
import { extractDisplayAddress } from './report-sections/utils/propertyDisplayUtils';
import { formatYearBuilt } from '@/utils/yearFormatter';
import { transformComparableForFeatureDisplay } from '@/utils/comparableDataTransformer';

interface PropertyDetailsModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  subjectProperty?: any;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  subjectProperty
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    financial: true,
    features: true
  });

  console.log('🏠 PropertyDetailsModal - Property data:', property);
  console.log('🏠 PropertyDetailsModal - Subject property data:', subjectProperty);

  if (!property) {
    console.warn('⚠️ PropertyDetailsModal: No property data provided');
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Safe value formatters with comprehensive error handling
  const safeFormatValue = (value: any, fallback: string = 'N/A'): string => {
    try {
      if (value === null || value === undefined || value === '') return fallback;
      return String(value);
    } catch {
      return fallback;
    }
  };

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

  const safeFormatSize = (sqft: any): string => {
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
      
      // Handle Unix timestamp in milliseconds
      if (typeof date === 'number' && date > 1000000000000) {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // Handle string dates
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

  // Enhanced property status detection
  const propertyStatus = property.status?.toLowerCase();
  const isSold = propertyStatus === 'sold' || propertyStatus === 'closed' || propertyStatus === 'pending' || 
                 property.event === 'Sold' || property.event === 'sold' ||
                 property.soldDate || property.closedDate || property.saleDate ||
                 property.dateOfSale || property['Sold Date'] || property['Sale Date'] ||
                 (property.id && String(property.id).includes('sold-'));
  
  const priceLabel = isSold ? 'Sold For' : 'Listed For';
  
  // Get the appropriate date based on status (REMOVED: On Market Date logic)
  let marketDate = null;
  if (isSold) {
    marketDate = property.soldDate || property.closedDate || property.saleDate || 
                 property.dateOfSale || property['Sold Date'] || property['Sale Date'] || 
                 property.date;
  } else {
    // For active listings, we'll only show sold date if it exists, not on market date
    marketDate = null;
  }
    
  const safeMarketDate = safeFormatDate(marketDate);
  const dateLabel = isSold ? 'Sold on' : 'Listed on Market';

  // Safe data extraction with FIXED beds/baths formatting
  const safeAddress = extractDisplayAddress(property) || 'Address not available';
  const safePrice = safeFormatPrice(property.price);
  const safeBeds = safeFormatBedsOrBaths(property.beds || property.bedrooms);
  const safeBaths = safeFormatBedsOrBaths(property.baths || property.bathrooms);
  const safeSqft = safeFormatSize(property.sqft);
  const safeYearBuilt = formatYearBuilt(property.yearBuilt);
  const safeLotSize = safeFormatValue(property.lotSize);

  // Transform property data for PropertyFeatureDisplay
  const transformedProperty = transformComparableForFeatureDisplay(property);

  // Extract historical data
  const priceHistory = property.priceHistory || [];
  const taxHistory = property.taxHistory || [];

  // UPDATED: Property data for sidebar - REMOVED On Market Date
  const basicData = [
    { label: 'Address', value: safeAddress },
    { label: 'Bedrooms', value: safeBeds },
    { label: 'Bathrooms', value: safeBaths },
    { label: 'Living Area', value: safeSqft },
    { label: 'Lot Size', value: safeLotSize },
    { label: 'Year Built', value: safeYearBuilt },
    { label: 'Property Type', value: property.propertyType || property.homeType || 'N/A' },
  ];

  // UPDATED: Financial data - only show sold date for sold properties, removed on market date
  const financialData = [
    { label: priceLabel, value: safePrice },
    ...(isSold && marketDate ? [{ label: dateLabel, value: safeMarketDate }] : []),
    { label: 'Property Status', value: isSold ? 'Sold' : 'Active' },
  ];

  // Additional features data
  const additionalFeatures = Object.entries(property || {})
    .filter(([key, value]) => {
      const excludeKeys = ['address', 'beds', 'baths', 'sqft', 'lotSize', 'yearBuilt', 'propertyType', 'homeType',
                          'bedrooms', 'bathrooms', 'price', 'images', 'priceHistory', 'taxHistory', 'schools', 
                          'status', 'soldDate', 'listDate', 'onMarketDate', 'ImgScr', 'imgScr', 'imgSrc'];
      return !excludeKeys.includes(key) && value !== 'N/A' && value !== null && value !== undefined && value !== '' && typeof value !== 'object';
    })
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: String(value)
    }));

  const renderSection = (title: string, data: any[], sectionKey: string) => {
    const validData = data.filter(item => item.value !== 'N/A' && item.value !== null && item.value !== undefined && item.value !== '');
    
    if (validData.length === 0) return null;

    return (
      <div className="border-b border-border last:border-b-0">
        <Button
          variant="ghost"
          onClick={() => toggleSection(sectionKey)}
          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-foreground">{title}</span>
          </div>
          {expandedSections[sectionKey] ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        
        {expandedSections[sectionKey] && (
          <div className="px-4 pb-4 space-y-3">
            {validData.map((item, index) => (
              <div 
                key={item.label} 
                className={`flex justify-between items-center py-2 ${
                  index !== validData.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <span className="text-sm text-muted-foreground font-medium">
                  {item.label}
                </span>
                <span className="text-sm text-foreground font-semibold text-right max-w-[60%] break-words">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <ModalErrorBoundary onClose={onClose}>
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
              <Home className="h-6 w-6" />
              Property Details
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-6">
            
            {/* Main Layout: 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar: Property Details */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-base font-semibold text-foreground mb-2">Property Details</h3>
                      <Badge variant="secondary" className="text-xs">
                        {isSold ? 'Recent Sale' : 'Active Listing'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-0">
                      {renderSection("Basic Information", basicData, "basic")}
                      {renderSection("Financial Information", financialData, "financial")}
                      {additionalFeatures.length > 0 && renderSection("Additional Features", additionalFeatures, "features")}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content: Images + Features */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Images */}
                  <div className="w-full rounded-lg overflow-hidden border border-border bg-muted/10" style={{ height: '350px', minHeight: '350px' }}>
                    <div className="w-full h-full">
                      <ModalErrorBoundary>
                        {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
                          <PropertyImageCarousel 
                            images={property.images} 
                            address={safeAddress} 
                            fallbackImage="/placeholder.svg" 
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center border border-border">
                            <p className="text-muted-foreground font-medium">No images available</p>
                          </div>
                        )}
                      </ModalErrorBoundary>
                    </div>
                  </div>

                  {/* Property Features Section */}
                  <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-primary mb-4">Property Features</h3>
                      <ModalErrorBoundary>
                        <PropertyFeatureDisplay displayData={transformedProperty} />
                      </ModalErrorBoundary>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Right Sidebar: Map & Distance */}
              <div className="lg:col-span-1">
                {subjectProperty && (
                  <div className="w-full rounded-lg overflow-hidden border border-border bg-muted/10" style={{ height: '350px', minHeight: '350px' }}>
                    <div className="w-full h-full">
                      <ModalErrorBoundary>
                        <GoogleMapDistance 
                          subjectProperty={subjectProperty}
                          comparableProperty={property}
                          propertyType={isSold ? 'sold' : 'active'}
                          height={320}
                        />
                      </ModalErrorBoundary>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Width Data Sections */}
            <div className="space-y-8">
              {/* Price History Section */}
              {priceHistory.length > 0 && (
                <ModalErrorBoundary>
                  <EnhancedPriceHistoryChart data={priceHistory} />
                </ModalErrorBoundary>
              )}

              {/* Tax History Section */}
              {taxHistory.length > 0 && (
                <ModalErrorBoundary>
                  <EnhancedTaxHistoryChart data={taxHistory} />
                </ModalErrorBoundary>
              )}
            </div>
          </div>
        </ModalErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;

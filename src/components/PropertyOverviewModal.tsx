
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Bed, Bath, Square, TreePine, Calendar, Building } from "lucide-react";

interface PropertyOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayData: any;
}

const PropertyOverviewModal: React.FC<PropertyOverviewModalProps> = ({
  isOpen,
  onClose,
  displayData
}) => {
  console.log('🏠 PropertyOverviewModal received data:', displayData);

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return value;
  };

  const formatSize = (sqft: any) => {
    if (!sqft || sqft === 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(sqft) + ' sqft';
  };

  const formatLotSize = (lotSize: any) => {
    if (!lotSize || lotSize === 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(lotSize) + ' sqft';
  };

  const formatBooleanValue = (value: any) => {
    return (value === 1 || value === '1' || value === true) ? 'Yes' : 'No';
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Try multiple possible locations for price history
  const getMarketDate = () => {
    // Try multiple possible locations for price history
    const priceHistory = displayData?.priceHistory || displayData?.price_history || [];
    
    console.log('🏠 PropertyOverviewModal - Price history:', priceHistory);
    
    if (!priceHistory || !Array.isArray(priceHistory) || priceHistory.length === 0) {
      return { date: 'N/A', label: 'Market Date' };
    }

    // Check if this is a sold property (has sold event in price history)
    const soldEvents = priceHistory.filter(item => 
      item.event && item.event.toLowerCase().includes('sold')
    );

    if (soldEvents.length > 0) {
      // For sold properties, find the most recent sold date (youngest)
      const mostRecentSold = soldEvents.reduce((latest, current) => {
        const currentDate = new Date(current.date);
        const latestDate = new Date(latest.date);
        return currentDate > latestDate ? current : latest;
      });
      
      console.log('🏠 PropertyOverviewModal - Most recent sold event:', mostRecentSold);
      
      return {
        date: formatDate(mostRecentSold.date),
        label: 'Sold on'
      };
    } else {
      // For active listings, find the most recent listing date (youngest)
      const listingEvents = priceHistory.filter(item => 
        item.event && (
          item.event.toLowerCase().includes('listed') ||
          item.event.toLowerCase().includes('list') ||
          item.event.toLowerCase().includes('for sale')
        )
      );

      if (listingEvents.length > 0) {
        const mostRecentListing = listingEvents.reduce((latest, current) => {
          const currentDate = new Date(current.date);
          const latestDate = new Date(latest.date);
          return currentDate > latestDate ? current : latest;
        });

        console.log('🏠 PropertyOverviewModal - Most recent listing event:', mostRecentListing);

        return {
          date: formatDate(mostRecentListing.date),
          label: 'Listed on'
        };
      }
    }

    return { date: 'N/A', label: 'Market Date' };
  };

  const marketInfo = getMarketDate();
  console.log('🏠 PropertyOverviewModal - Market info:', marketInfo);

  // Extract all available fields from displayData
  const basicDetails = [
    { icon: Bed, label: 'Bedrooms', value: formatValue(displayData?.Beds || displayData?.beds) },
    { icon: Bath, label: 'Bathrooms', value: formatValue(displayData?.Baths || displayData?.baths) },
    { icon: Square, label: 'Square Footage', value: formatSize(displayData?.SqFt || displayData?.sqft) },
    { icon: TreePine, label: 'Lot Size', value: formatLotSize(displayData?.LotSize || displayData?.lotSize) },
    { icon: Calendar, label: 'Year Built', value: formatValue(displayData?.YearBuilt || displayData?.yearBuilt) },
    { icon: Building, label: 'Property Type', value: formatValue(displayData?.AdvancedPropertyType || displayData?.homeType) }
  ];

  const additionalDetails = [
    { label: 'Lot Size (Acres)', value: displayData?.LotSizeAcres ? `${displayData.LotSizeAcres} acres` : 'N/A' },
    { label: 'Number of Units', value: formatValue(displayData?.Units) },
    { label: 'Number of Stories', value: formatValue(displayData?.Stories) },
    { label: 'Garage Size', value: displayData?.GarageSize ? `${displayData.GarageSize} cars` : 'N/A' },
    { label: 'HVAC System', value: formatBooleanValue(displayData?.HVAC) },
    { label: 'Air Conditioning', value: formatBooleanValue(displayData?.AirCond) },
    { label: 'Heating', value: formatBooleanValue(displayData?.Heating) },
    { label: 'Swimming Pool', value: formatBooleanValue(displayData?.Pool) },
    { label: 'Fireplace', value: formatBooleanValue(displayData?.Fireplace) },
    { label: 'View Type', value: formatValue(displayData?.ViewType) }
  ].filter(item => item.value !== 'N/A' && 
    // Filter out "At A Glance Facts" field
    !item.label.toLowerCase().includes('at a glance') &&
    !item.label.toLowerCase().includes('at aglance')
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Home className="h-6 w-6 text-primary" />
            Property Overview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market Date Information */}
          {marketInfo.date !== 'N/A' && (
            <Card className="shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-bold text-foreground">{marketInfo.label}</div>
                    <div className="text-lg font-normal text-foreground">{marketInfo.date}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Details */}
          <Card className="shadow-sm border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {basicDetails.map((detail, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <detail.icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-bold text-foreground">{detail.label}</div>
                      <div className="text-sm font-normal text-foreground">{detail.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {additionalDetails.length > 0 && (
            <Card className="shadow-sm border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {additionalDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm font-bold text-foreground">{detail.label}</span>
                      <span className="text-sm font-normal text-foreground">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyOverviewModal;

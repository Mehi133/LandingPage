
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyFeaturesStructuredProps {
  property: any;
}

const PropertyFeaturesStructured: React.FC<PropertyFeaturesStructuredProps> = ({ property }) => {
  console.log('🏠 PropertyFeaturesStructured - Property data:', property);

  // Helper functions
  const formatCurrency = (value: any): string => {
    if (!value || value === 0) return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) : value;
    return isNaN(numValue) ? '' : `$${numValue.toLocaleString()}`;
  };

  const formatSqft = (value: any): string => {
    if (!value || value === 0) return '';
    const numValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value;
    return isNaN(numValue) ? '' : `${numValue.toLocaleString()} sqft`;
  };

  const formatAcres = (value: any): string => {
    if (!value || value === 0) return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) : value;
    return isNaN(numValue) ? '' : `${numValue.toFixed(2)} ac`;
  };

  const formatPricePerSqft = (price: any, sqft: any): string => {
    if (!price || !sqft) return '';
    const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price;
    const sqftNum = typeof sqft === 'string' ? parseInt(sqft.replace(/[^\d]/g, '')) : sqft;
    if (isNaN(priceNum) || isNaN(sqftNum) || sqftNum === 0) return '';
    return `$${Math.round(priceNum / sqftNum)}/ft²`;
  };

  // Extract basic data
  const beds = property.beds || property.bedrooms || 0;
  const baths = property.baths || property.bathrooms || 0;
  const livingArea = property.sqft || property.livingArea || 0;
  const yearBuilt = property.yearBuilt || 0;
  const lotSize = property.lotSize || '';
  const price = property.price || 0;
  const pricePerSqft = formatPricePerSqft(price, livingArea);

  // Create highlights badges
  const highlights = [
    beds > 0 ? `${beds} bd` : '',
    baths > 0 ? `${baths} ba` : '',
    livingArea > 0 ? formatSqft(livingArea) : '',
    yearBuilt > 0 ? `Built ${yearBuilt}` : '',
    lotSize ? (lotSize.includes('ac') ? lotSize : formatAcres(lotSize)) : '',
    pricePerSqft
  ].filter(Boolean).slice(0, 6);

  // Section data preparation
  const sections = {
    atAGlance: {
      title: 'At a Glance',
      data: [
        { label: 'Property Type', value: property.propertyType || property.homeType },
        { label: 'Bedrooms', value: beds > 0 ? beds : null },
        { label: 'Bathrooms', value: baths > 0 ? baths : null },
        { label: 'Living Area', value: livingArea > 0 ? formatSqft(livingArea) : null },
        { label: 'Year Built', value: yearBuilt > 0 ? yearBuilt : null },
        { label: 'Lot Size', value: lotSize || null },
        { label: 'Price per ft²', value: pricePerSqft || null },
        { label: 'Days on Market', value: property.daysOnMarket > 0 ? property.daysOnMarket : null }
      ].filter(item => item.value)
    },
    interior: {
      title: 'Interior',
      data: [
        { label: 'Stories', value: property.numberOfStories || property.levels },
        { label: 'Rooms', value: property.rooms },
        { label: 'Basement', value: property.basementType || (property.hasBasement ? 'Yes' : null) },
        { label: 'Fireplace', value: property.fireplaceLocation || (property.hasFireplace ? 'Yes' : null) },
        { label: 'Flooring', value: property.flooring },
        { label: 'Appliances', value: Array.isArray(property.appliances) ? property.appliances.join(', ') : property.appliances },
        { label: 'Laundry', value: property.laundryLocation }
      ].filter(item => item.value)
    },
    exterior: {
      title: 'Exterior',
      data: [
        { label: 'Construction', value: property.exteriorWallType || property.construction },
        { label: 'Roof', value: property.roofType },
        { label: 'Outdoor Spaces', value: property.outdoorSpaces },
        { label: 'Fencing', value: property.fencing || (property.fencedYard ? 'Fenced' : null) },
        { label: 'Parking', value: property.parkingType },
        { label: 'Garage', value: property.garageSize > 0 ? `${property.garageSize} cars` : (property.hasGarage ? 'Yes' : null) }
      ].filter(item => item.value)
    },
    systems: {
      title: 'Systems & Utilities',
      data: [
        { label: 'Heating', value: property.heatingType || (property.hasHeating ? 'Yes' : null) },
        { label: 'Cooling', value: property.coolingType || (property.hasCooling ? 'Central' : null) },
        { label: 'Water & Sewer', value: property.waterSewer },
        { label: 'Sump Pump', value: property.sumpPump ? 'Yes' : null },
        { label: 'Home Warranty', value: property.hasHomeWarranty ? 'Yes' : null }
      ].filter(item => item.value)
    },
    lotZoning: {
      title: 'Lot & Zoning',
      data: [
        { label: 'Lot Size', value: lotSize },
        { label: 'Zoning', value: property.zoning },
        { label: 'Subdivision', value: property.subdivision },
        { label: 'Road Surface', value: property.roadSurface },
        { label: 'View/Terrain', value: property.view || property.terrain },
        { label: 'Horses Allowed', value: property.canRaiseHorses ? 'Yes' : null }
      ].filter(item => item.value)
    },
    schoolsFinancial: {
      title: 'Schools & Financial',
      data: [
        { label: 'Schools', value: property.schools ? (Array.isArray(property.schools) ? property.schools.join(', ') : property.schools) : null },
        { label: 'Annual Taxes', value: formatCurrency(property.annualTaxes) },
        { label: 'Assessed Value', value: formatCurrency(property.assessedValue) },
        { label: 'Listing Terms', value: property.listingTerms },
        { label: 'On Market Date', value: property.onMarketDate ? new Date(property.onMarketDate).toLocaleDateString() : null },
        { label: 'Special Conditions', value: property.specialConditions !== 'Standard' ? property.specialConditions : null }
      ].filter(item => item.value)
    }
  };

  // Feature chips for boolean features
  const featureChips = [
    property.hasBasement ? 'Basement' : '',
    property.hasFireplace ? 'Fireplace' : '',
    property.hasDeck ? 'Deck' : '',
    property.hasCoveredPorch ? 'Covered Porch' : '',
    property.fencedYard ? 'Fenced Yard' : '',
    property.hasGazebo ? 'Gazebo' : '',
    property.sharedDriveway ? 'Shared Driveway' : '',
    property.sumpPump ? 'Sump Pump' : '',
    property.windowAC ? 'Window A/C' : ''
  ].filter(Boolean);

  const renderSection = (section: any) => {
    if (!section.data.length) return null;

    return (
      <Card key={section.title} className="bg-white shadow-sm">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-3 text-sm">{section.title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.data.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-start py-1.5 border-b border-border/30 last:border-b-0">
                <span className="text-xs text-muted-foreground font-medium flex-shrink-0 w-2/5">
                  {item.label}
                </span>
                <span className="text-xs text-foreground font-medium text-right w-3/5 break-words">
                  {String(item.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Highlights Row */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {highlights.map((highlight, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-muted text-foreground">
              {highlight}
            </Badge>
          ))}
        </div>
      )}

      {/* Structured Sections */}
      <div className="space-y-4">
        {renderSection(sections.atAGlance)}
        {renderSection(sections.interior)}
        {renderSection(sections.exterior)}
        {renderSection(sections.systems)}
        {renderSection(sections.lotZoning)}
        {renderSection(sections.schoolsFinancial)}
      </div>

      {/* Feature Chips */}
      {featureChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {featureChips.map((chip, index) => (
            <Badge key={index} variant="outline" className="text-xs px-2 py-1">
              {chip}
            </Badge>
          ))}
        </div>
      )}

      {/* Notes Section */}
      {property.notes && (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium text-foreground mb-2 text-sm">Notes</h4>
            <p className="text-xs text-muted-foreground">
              {property.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyFeaturesStructured;

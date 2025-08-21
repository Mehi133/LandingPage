import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PropertySnapshotProps {
  subjectProperty: any;
  userEnteredAddress?: string;
}

const PropertySnapshot: React.FC<PropertySnapshotProps> = ({ 
  subjectProperty, 
  userEnteredAddress 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    financial: true,
    features: false
  });

  const address = userEnteredAddress || subjectProperty?.address || 'Property Address';

  // Basic property data
  const basicData = [
    { label: 'Address', value: address },
    { label: 'Bedrooms', value: subjectProperty?.beds || subjectProperty?.bedrooms || 'N/A' },
    { label: 'Bathrooms', value: subjectProperty?.baths || subjectProperty?.bathrooms || 'N/A' },
    { label: 'Living Area', value: subjectProperty?.sqft ? `${subjectProperty.sqft.toLocaleString()} sq ft` : subjectProperty?.['Building area'] ? `${subjectProperty['Building area'].toLocaleString()} sq ft` : 'N/A' },
    { label: 'Lot Size', value: subjectProperty?.lotSize ? `${subjectProperty.lotSize.toLocaleString()} sq ft` : subjectProperty?.['Lot size'] ? `${subjectProperty['Lot size']} acres` : 'N/A' },
    { label: 'Year Built', value: subjectProperty?.yearBuilt || subjectProperty?.['Year Built'] || 'N/A' },
    { label: 'Property Type', value: subjectProperty?.propertyType || subjectProperty?.['Property Type'] || 'N/A' },
    { label: 'Parking', value: subjectProperty?.garage || subjectProperty?.['Garage type and capacity'] || 'N/A' },
  ];

  // Enhanced financial data - include both root level and financials object data
  const financialData = [
    { label: 'Assessed Value (2025)', value: subjectProperty?.assessedValue ? `$${subjectProperty.assessedValue.toLocaleString()}` : subjectProperty?.financials?.assessedValue ? `$${subjectProperty.financials.assessedValue.toLocaleString()}` : 'N/A' },
    { label: 'Annual Taxes (2025)', value: subjectProperty?.annualTaxes ? `$${subjectProperty.annualTaxes.toLocaleString()}` : subjectProperty?.financials?.annualTaxes ? `$${subjectProperty.financials.annualTaxes.toLocaleString()}` : 'N/A' },
    { label: 'Previous Assessed Value', value: subjectProperty?.['Assessed Value'] || 'N/A' },
    { label: 'Previous Annual Taxes', value: subjectProperty?.['Annual Taxes'] || subjectProperty?.['Annual Tax Amount'] || 'N/A' },
    { label: 'Parcel Number', value: subjectProperty?.['Parcel Number'] || 'N/A' },
    { label: 'Price Per Sq Ft', value: subjectProperty?.['Price Per Square Foot'] || 'N/A' },
  ];

  // Additional features data
  const featuresData = Object.entries(subjectProperty || {})
    .filter(([key, value]) => {
      // Filter out basic fields already shown and system fields
      const excludeKeys = ['address', 'beds', 'baths', 'sqft', 'lotSize', 'yearBuilt', 'propertyType', 'garage', 
                          'bedrooms', 'bathrooms', 'price', 'images', 'priceHistory', 'taxHistory', 'schools', 
                          'climate', 'features', 'financials', 'ImgScr', 'imgScr', 'imgSrc',
                          'Assessed Value', 'Annual Taxes', 'Parcel Number', 'Price Per Square Foot', 'Annual Tax Amount',
                          'assessedValue', 'annualTaxes'];
      return !excludeKeys.includes(key) && value !== 'N/A' && value !== null && value !== undefined && value !== '';
    })
    .map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderSection = (title: string, data: any[], sectionKey: string, badge?: string) => {
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
            <span className="font-medium text-sm">{title}</span>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
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
                <span className="text-xs text-muted-foreground font-medium">
                  {item.label}
                </span>
                <span className="text-xs text-foreground font-semibold text-right max-w-[60%] break-words">
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
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground mb-2">Property Details</h3>
          <Badge variant="secondary" className="text-xs">
            Subject Property
          </Badge>
        </div>
        
        <div className="space-y-0">
          {renderSection("Basic Information", basicData, "basic", `${basicData.filter(item => item.value !== 'N/A').length} items`)}
          {renderSection("Financial Information", financialData, "financial", `${financialData.filter(item => item.value !== 'N/A').length} items`)}
          {featuresData.length > 0 && renderSection("Additional Features", featuresData, "features", `${featuresData.length} items`)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertySnapshot;

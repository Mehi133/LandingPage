
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, DollarSign, Heart, Clock, Percent, Banknote } from "lucide-react";
import { formatCurrency, formatPercentage } from './utils/propertyDataUtils';

interface PropertyInfoCardProps {
  property: any;
  additionalFeatures: any;
  yearBuilt: number | null;
  formattedPrice: string | null;
}

const PropertyInfoCard: React.FC<PropertyInfoCardProps> = ({
  property,
  additionalFeatures,
  yearBuilt,
  formattedPrice
}) => {
  return (
    <Card className="shadow-lg border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-purple-800 mb-4 tracking-tight">Property Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-500"><Home className="h-4 w-4 mr-2" />Property Type:</span>
                <span className="font-medium text-gray-800">{additionalFeatures?.homeType || additionalFeatures?.propertyTypeDimension || 'Single Family'}</span>
              </div>
              {yearBuilt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><Calendar className="h-4 w-4 mr-2" />Year Built:</span>
                  <span className="font-medium text-gray-800">{yearBuilt}</span>
                </div>
              )}
              {formattedPrice ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><DollarSign className="h-4 w-4 mr-2" />Price:</span>
                  <span className="text-lg font-bold text-purple-700">{formattedPrice}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><DollarSign className="h-4 w-4 mr-2" />Price:</span>
                  <span className="font-medium text-gray-800">Not available</span>
                </div>
              )}
              {additionalFeatures?.favoriteCount && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><Heart className="h-4 w-4 mr-2" />Favorite Count:</span>
                  <span className="font-medium text-gray-800">{additionalFeatures.favoriteCount}</span>
                </div>
              )}
              {additionalFeatures?.timeOnZillow && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><Clock className="h-4 w-4 mr-2" />Time on Zillow:</span>
                  <span className="font-medium text-gray-800">{additionalFeatures.timeOnZillow}</span>
                </div>
              )}
              {additionalFeatures?.propertyTaxRate && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><Percent className="h-4 w-4 mr-2" />Property Tax Rate:</span>
                  <span className="font-medium text-gray-800">{formatPercentage(additionalFeatures.propertyTaxRate)}</span>
                </div>
              )}
              {additionalFeatures?.annualHomeownersInsurance && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500"><Banknote className="h-4 w-4 mr-2" />Annual Home Insurance:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(additionalFeatures.annualHomeownersInsurance)}</span>
                </div>
              )}
            </div>
          </div>
          
          {property?.soldDate && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Sold {property.soldDate}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyInfoCard;

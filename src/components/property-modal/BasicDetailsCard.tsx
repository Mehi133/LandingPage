
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Home, Bed, Bath, Square, TreePine } from "lucide-react";
import { getBedrooms, getBathrooms } from './utils/propertyDataUtils';

interface BasicDetailsCardProps {
  property: any;
  additionalFeatures: any;
  formattedSize: string | null;
  formattedLotSize: string | null;
}

const BasicDetailsCard: React.FC<BasicDetailsCardProps> = ({
  property,
  additionalFeatures,
  formattedSize,
  formattedLotSize
}) => {
  return (
    <Card className="shadow-lg border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2 tracking-tight">
          <Home className="h-6 w-6" />
          Basic Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-base">
          <div className="flex items-center gap-3">
            <Bed className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm text-gray-500">Bedrooms</div>
              <div className="font-bold text-gray-800">{getBedrooms(property)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bath className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm text-gray-500">Bathrooms</div>
              <div className="font-bold text-gray-800">{getBathrooms(property)}</div>
            </div>
          </div>
          {formattedSize && (
            <div className="flex items-center gap-3">
              <Square className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-500">Sq. Ft.</div>
                <div className="font-bold text-gray-800">{formattedSize.replace(' sqft','')}</div>
              </div>
            </div>
          )}
          {formattedLotSize && (
            <div className="flex items-center gap-3">
              <TreePine className="h-5 w-5 text-purple-600" />
               <div>
                <div className="text-sm text-gray-500">Lot Size</div>
                <div className="font-bold text-gray-800">{formattedLotSize}</div>
              </div>
            </div>
          )}
        </div>
        
        {additionalFeatures?.subdivision && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm flex items-center gap-2">
              <span className="font-medium text-gray-500">Subdivision:</span> 
              <span className="font-bold text-gray-800">{additionalFeatures.subdivision}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicDetailsCard;


import React from 'react';
import { Home, AlertTriangle } from 'lucide-react';

const PropertyDetailsHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-border rounded-t-xl px-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Property Details</h1>
          <p className="text-secondary-foreground mt-1">
            Please review the available property information below and make adjustments if necessary.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-amber-800 font-medium mb-1">Important Notice</p>
          <p className="text-amber-700">
            Any changes you make to the property information can affect the final pricing and valuation accuracy. 
            Please ensure all details are correct before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsHeader;

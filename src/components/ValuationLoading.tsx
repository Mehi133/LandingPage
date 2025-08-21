
import React from 'react';
import { Clock } from 'lucide-react';

const ValuationLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative">
        <Clock className="h-16 w-16 text-realestate-blue animate-pulse" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-gray-800 tracking-tight">Awaiting Confirmation</h2>
      <p className="mt-4 text-gray-600 text-center max-w-md leading-relaxed">
        Please wait while we process your property information. 
        <span className="block mt-2 font-medium text-gray-700">You'll need to confirm some details to complete your valuation.</span>
      </p>
      <div className="mt-6 w-full max-w-md">
        <div className="h-2 bg-realestate-gray rounded animate-pulse-slow mb-3"></div>
        <div className="h-2 bg-realestate-gray rounded animate-pulse-slow w-5/6 mb-3"></div>
        <div className="h-2 bg-realestate-gray rounded animate-pulse-slow w-4/6"></div>
      </div>
    </div>
  );
};

export default ValuationLoading;

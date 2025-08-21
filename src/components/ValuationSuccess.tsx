
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ValuationSuccessProps {
  onReset: () => void;
}

const ValuationSuccess: React.FC<ValuationSuccessProps> = ({ onReset }) => {
  return (
    <div className="text-center py-8 space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-realestate-dark">Valuation Request Submitted</h2>
      <p className="text-gray-600">
        Thank you for using our AI-powered home valuation tool. Your property assessment 
        has been submitted for processing. You will receive the valuation report shortly.
      </p>
      <Button 
        onClick={onReset}
        className="mt-4 bg-realestate-blue hover:bg-realestate-light-blue transition-colors"
      >
        Submit Another Valuation
      </Button>
    </div>
  );
};

export default ValuationSuccess;

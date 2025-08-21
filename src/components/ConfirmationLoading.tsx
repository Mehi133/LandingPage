
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface ConfirmationLoadingProps {
  estimatedWaitTime?: number;
  elapsedTime?: number;
}

const ConfirmationLoading: React.FC<ConfirmationLoadingProps> = ({ 
  estimatedWaitTime = 120,
  elapsedTime = 0
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / 40); // Increment every 3 seconds for 2 minutes (40 intervals)
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Generating Your Property Report
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Your report is on the way! You can stick around and watch the bar move — or just kick back and wait for that inbox ping.
        </p>
      </div>
      
      <div className="w-full max-w-md mx-auto space-y-2">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Processing...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationLoading;

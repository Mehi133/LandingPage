
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ConfirmationLoadingModalProps {
  isOpen: boolean;
  estimatedWaitTime?: number;
  elapsedTime?: number;
}

const ConfirmationLoadingModal: React.FC<ConfirmationLoadingModalProps> = ({ 
  isOpen,
  estimatedWaitTime = 120,
  elapsedTime = 0
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Slower progress: increment every 8 seconds for 2 minutes (15 intervals)
        return prev + (100 / 15); 
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-screen h-screen max-w-none rounded-none border-0 p-0 [&>button]:hidden">
        <div className="w-full h-full bg-white flex flex-col items-center justify-center space-y-8 px-8">
          <div className="text-center space-y-4 max-w-lg">
            <h3 className="text-3xl font-semibold text-gray-900">
              Generating Your Property Report
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your report is on the way! You can stick around and watch the bar move — or just kick back and wait for that inbox ping.
            </p>
          </div>
          
          <div className="w-full max-w-md space-y-4">
            <Progress value={progress} className="h-4" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationLoadingModal;

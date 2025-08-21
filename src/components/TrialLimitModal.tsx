
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TrialLimitModalProps {
  isOpen: boolean;
  firstName: string;
  onClose?: () => void;
}

const TrialLimitModal: React.FC<TrialLimitModalProps> = ({ 
  isOpen, 
  firstName, 
  onClose 
}) => {
  // Load Calendly script when modal opens
  useEffect(() => {
    if (isOpen) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Cleanup script when modal closes
        const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none rounded-none border-0 p-0 [&>button]:hidden">
        <div className="w-full h-full bg-white flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Hey {firstName},
              </h2>
              <div className="text-lg text-gray-700 space-y-3">
                <p>Thanks for using Valora earlier!</p>
                <p>
                  Your trial's over—but the market's moving fast. Let's set you up with the tools to keep up. Book a call here:
                </p>
              </div>
            </div>
            
            <div className="w-full">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/agency-mehiverseai/valora-consultation" 
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialLimitModal;

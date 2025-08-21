
import { useState } from 'react';
import { sendPropertyConfirmation } from '@/utils/webhook/propertyConfirmationApi';
import { parseWebhookResponse } from '@/utils/webhook/responseParser';
import { useToast } from "@/hooks/use-toast";

interface UsePropertyConfirmationProps {
  displayData: any;
  addressData?: any;
  originalFormData?: any;
  onConfirmReport: (responseData?: any) => void;
  setPdfUrl: (url: string | null) => void;
  startPolling: (jobId: string) => void;
  setIsProcessingConfirmation: (processing: boolean) => void;
}

export const usePropertyConfirmation = ({
  displayData,
  addressData,
  originalFormData,
  onConfirmReport,
  setPdfUrl,
  startPolling,
  setIsProcessingConfirmation
}: UsePropertyConfirmationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    console.log('🚀 ========== PROPERTY CONFIRMATION STARTED ==========');
    console.log('🚀 Display data being confirmed:', displayData);
    console.log('🚀 Address data:', addressData);
    console.log('🚀 Original form data:', originalFormData);
    
    setIsSubmitting(true);
    setIsProcessingConfirmation(true);
    
    try {
      // Prepare the confirmation data including user data and images
      const confirmationData = {
        ...displayData,
        streetAddress: addressData?.streetAddress || originalFormData?.streetAddress,
        city: addressData?.city || originalFormData?.city,
        state: addressData?.state || originalFormData?.state,
        zipCode: addressData?.zipCode || originalFormData?.zipCode,
        // Include user data (name/email) in the webhook request
        userData: originalFormData?.userData || null,
        // Include images if available
        imageUrls: originalFormData?.imageUrls || [],
      };

      console.log('🚀 Final confirmation data with user info:', confirmationData);
      console.log('🚀 User data being sent:', confirmationData.userData);
      console.log('🚀 Image URLs being sent:', confirmationData.imageUrls);
      
      const response = await sendPropertyConfirmation(confirmationData);
      console.log('🚀 Property confirmation response:', response);
      
      if (response.isProcessing && response.jobId) {
        console.log('🚀 Starting polling for job:', response.jobId);
        startPolling(response.jobId);
        
        toast({
          title: "Processing Started",
          description: "Your property report is being generated. This may take a few minutes.",
        });
      } else if (response.pdfUrl) {
        console.log('🚀 PDF URL received immediately:', response.pdfUrl);
        setPdfUrl(response.pdfUrl);
        
        // Parse the webhook response before passing it to onConfirmReport
        const parsedResponse = parseWebhookResponse(response);
        console.log('🚀 Parsed webhook response for immediate PDF:', parsedResponse);
        
        onConfirmReport(parsedResponse);
        setIsProcessingConfirmation(false);
        
        toast({
          title: "Report Generated",
          description: "Your property report is ready for download.",
        });
      } else {
        console.log('🚀 Full report data received:', response);
        
        // Parse the webhook response before passing it to onConfirmReport
        const parsedResponse = parseWebhookResponse(response);
        console.log('🚀 Parsed webhook response for full report:', parsedResponse);
        console.log('🚀 Parsed pricing data structure:', parsedResponse.pricingData);
        
        onConfirmReport(parsedResponse);
        setIsProcessingConfirmation(false);
        
        toast({
          title: "Analysis Complete",
          description: "Your property analysis has been completed successfully.",
        });
      }
      
    } catch (error) {
      console.error('🚀 ❌ Property confirmation failed:', error);
      setIsProcessingConfirmation(false);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process property confirmation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('🚀 ========== PROPERTY CONFIRMATION ENDED ==========');
    }
  };

  return {
    isSubmitting,
    handleConfirm
  };
};

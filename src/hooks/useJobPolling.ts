
import { useState, useEffect, useCallback, useRef } from 'react';
import { checkWebhookJobStatus } from '@/utils/webhook/propertyConfirmationApi';
import { parseWebhookResponse } from '@/utils/webhook/responseParser';
import { useToast } from "@/hooks/use-toast";

interface UseJobPollingProps {
  onConfirmReport: (responseData?: any) => void;
  setPdfUrl: (url: string | null) => void;
}

export const useJobPolling = ({ onConfirmReport, setPdfUrl }: UseJobPollingProps) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<string>('');
  const { toast } = useToast();

  // Stable references
  const onConfirmReportRef = useRef(onConfirmReport);
  const toastRef = useRef(toast);

  // Update refs when props change
  useEffect(() => {
    onConfirmReportRef.current = onConfirmReport;
    toastRef.current = toast;
  }, [onConfirmReport, toast]);

  // Enhanced polling function with comprehensive debugging and parsing
  const pollJobStatus = useCallback(async (jobId: string, startTime: number): Promise<boolean> => {
    try {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.log(`[POLLING DEBUG] Checking job ${jobId} - Elapsed: ${elapsedSeconds}s`);
      
      // Maximum polling time: 10 minutes
      if (elapsedSeconds > 600) {
        console.log(`[POLLING DEBUG] TIMEOUT - Stopping polling for job ${jobId}`);
        setActiveJobId(null);
        toastRef.current({
          title: "Processing Timeout",
          description: "The report generation is taking longer than expected. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check job status from database
      const jobStatusResponse = await checkWebhookJobStatus(jobId);
      console.log(`[POLLING DEBUG] Job ${jobId} status:`, jobStatusResponse.status);
      console.log(`[POLLING DEBUG] Job ${jobId} response_data exists:`, !!jobStatusResponse.response_data);
      
      // CRITICAL: Check if response_data exists and is not null
      if (jobStatusResponse.response_data !== null && jobStatusResponse.response_data !== undefined) {
        console.log(`[POLLING DEBUG] SUCCESS! Job ${jobId} completed with response data`);
        console.log(`[POLLING DEBUG] Raw response data keys:`, Object.keys(jobStatusResponse.response_data || {}));
        
        // Stop polling immediately
        setActiveJobId(null);
        
        // FIXED: Parse webhook response using the same parser as property confirmation
        let parsedData;
        try {
          console.log('[POLLING DEBUG] ======= PARSING DATABASE RESPONSE =======');
          parsedData = parseWebhookResponse(jobStatusResponse.response_data);
          console.log('[POLLING DEBUG] Parsed webhook data successfully:', !!parsedData);
          console.log('[POLLING DEBUG] Active listings count:', parsedData?.activeListings?.length || 0);
          console.log('[POLLING DEBUG] Recent sales count:', parsedData?.recentSales?.length || 0);
          console.log('[POLLING DEBUG] Market data available:', !!parsedData?.marketData);
          console.log('[POLLING DEBUG] Pricing data available:', !!parsedData?.pricingData);
          console.log('[POLLING DEBUG] Pricing data structure:', parsedData?.pricingData);
          console.log('[POLLING DEBUG] PricingStrategy length:', parsedData?.pricingData?.PricingStrategy?.length || 0);
        } catch (parseError) {
          console.error('[POLLING DEBUG] ERROR parsing webhook response:', parseError);
          console.error('[POLLING DEBUG] Raw response data:', jobStatusResponse.response_data);
          // Create fallback parsed data
          parsedData = {
            success: false,
            message: 'Error parsing response data',
            activeListings: [],
            recentSales: [],
            marketData: null,
            pricingData: null,
            pdfUrl: null
          };
        }
        
        // Set PDF URL if available
        if (parsedData.pdfUrl) {
          console.log('[POLLING DEBUG] Setting PDF URL:', parsedData.pdfUrl);
          setPdfUrl(parsedData.pdfUrl);
        }
        
        // Create response data for the full report including parsed pricing data
        const baseResponseData = jobStatusResponse.response_data && typeof jobStatusResponse.response_data === 'object' ? jobStatusResponse.response_data : {};
        const responseData = {
          ...baseResponseData,
          // Use parsed data structures
          activeListings: parsedData.activeListings,
          recentSales: parsedData.recentSales,
          marketData: parsedData.marketData,
          pricingData: parsedData.pricingData,
          pdfUrl: parsedData.pdfUrl
        };
        
        console.log('[POLLING DEBUG] Calling onConfirmReport with parsed data');
        console.log('[POLLING DEBUG] Final response data pricing structure:', responseData.pricingData);
        onConfirmReportRef.current(responseData);
        
        toastRef.current({
          title: "Report Ready",
          description: "Your property report has been generated successfully.",
        });
        
        return false; // Stop polling
      }
      
      // Check for error status
      if (jobStatusResponse.status === 'failed' || jobStatusResponse.status === 'error') {
        console.log(`[POLLING DEBUG] ERROR - Job ${jobId} failed:`, jobStatusResponse.error);
        setActiveJobId(null);
        toastRef.current({
          title: "Error",
          description: `Report generation failed: ${jobStatusResponse.error || 'Unknown error'}`,
          variant: "destructive",
        });
        return false; // Stop polling
      }
      
      // Continue polling - job is still processing
      console.log(`[POLLING DEBUG] Job ${jobId} still processing, status: ${jobStatusResponse.status || 'pending'}`);
      return true;
      
    } catch (error) {
      console.error(`[POLLING DEBUG] ERROR checking job status:`, error);
      // Continue polling on error, but log it
      return true;
    }
  }, [setPdfUrl]);

  // Polling effect - simplified with minimal dependencies
  useEffect(() => {
    if (!activeJobId || !pollingStartTime) {
      console.log('[POLLING DEBUG] No active job or start time, skipping polling');
      return;
    }

    console.log(`[POLLING DEBUG] Starting polling for job ${activeJobId}`);
    
    let intervalId: NodeJS.Timeout;
    
    const startPolling = async () => {
      // Initial check after 2 seconds
      setTimeout(async () => {
        const shouldContinue = await pollJobStatus(activeJobId, pollingStartTime);
        
        if (shouldContinue) {
          // Set up interval for subsequent checks every 5 seconds
          intervalId = setInterval(async () => {
            const continuePolling = await pollJobStatus(activeJobId, pollingStartTime);
            if (!continuePolling) {
              console.log(`[POLLING DEBUG] Stopping interval for job ${activeJobId}`);
              clearInterval(intervalId);
            }
          }, 5000);
        }
      }, 2000);
    };
    
    startPolling();
    
    // Cleanup
    return () => {
      if (intervalId) {
        console.log(`[POLLING DEBUG] Cleaning up interval for job ${activeJobId}`);
        clearInterval(intervalId);
      }
    };
  }, [activeJobId, pollingStartTime, pollJobStatus]);

  const startPolling = (jobId: string) => {
    const startTime = Date.now();
    console.log(`[POLLING DEBUG] Starting polling for job ${jobId} at ${new Date(startTime).toISOString()}`);
    setActiveJobId(jobId);
    setPollingStartTime(startTime);
    setEstimatedWaitTime('Processing your report...');
  };

  const stopPolling = () => {
    console.log('[POLLING DEBUG] Manually stopping polling');
    setActiveJobId(null);
    setPollingStartTime(null);
    setEstimatedWaitTime('');
  };

  return {
    activeJobId,
    pollingStartTime,
    estimatedWaitTime,
    startPolling,
    stopPolling
  };
};

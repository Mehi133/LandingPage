
import { supabase } from "@/integrations/supabase/client";

export const sendPropertyConfirmation = async (data: any) => {
  console.log('[PROPERTY CONFIRMATION API] ======= SENDING CONFIRMATION =======');
  console.log('[PROPERTY CONFIRMATION API] Data being sent:', data);

  try {
    // Use the correct edge function with proper request type
    const { data: result, error } = await supabase.functions.invoke('Lovable-N8n-Test', {
      body: {
        requestType: 'property-confirmation',
        data: data
      }
    });

    console.log('[PROPERTY CONFIRMATION API] ======= RESPONSE RECEIVED =======');
    console.log('[PROPERTY CONFIRMATION API] Raw response:', result);
    console.log('[PROPERTY CONFIRMATION API] Error (if any):', error);

    if (error) {
      console.error('[PROPERTY CONFIRMATION API] ❌ Supabase function error:', error);
      throw new Error(`Webhook failed: ${error.message}`);
    }

    // Check if response indicates processing started
    if (result && result.jobId) {
      console.log('[PROPERTY CONFIRMATION API] ✅ Processing job created:', result.jobId);
      return {
        isProcessing: true,
        jobId: result.jobId,
        message: result.message || 'Processing started'
      };
    }

    // Return the actual response from the webhook
    return result;

  } catch (error) {
    console.error('[PROPERTY CONFIRMATION API] ❌ Network/parsing error:', error);
    throw error;
  }
};

export const checkWebhookJobStatus = async (jobId: string) => {
  console.log('[WEBHOOK JOB STATUS] Checking status for job:', jobId);

  try {
    const { data, error } = await supabase
      .from('webhook_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('[WEBHOOK JOB STATUS] Database error:', error);
      throw error;
    }

    console.log('[WEBHOOK JOB STATUS] Job status retrieved:', {
      jobId,
      status: data?.status,
      hasResponseData: !!data?.response_data
    });

    return data;
  } catch (error) {
    console.error('[WEBHOOK JOB STATUS] Error checking job status:', error);
    throw error;
  }
};

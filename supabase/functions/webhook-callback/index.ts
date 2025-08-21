
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Gets the current project domain with improved fallback handling
 * Updated to use development domain format
 */
const getCurrentProjectDomain = (): string => {
  // Check for custom environment variable first
  const customDomain = Deno.env.get('APPLICATION_DOMAIN');
  if (customDomain) {
    console.log('[WEBHOOK CALLBACK] Using custom domain from environment:', customDomain);
    return customDomain;
  }
  
  // Use development domain format instead of production
  const developmentDomain = 'https://e7e5a8c7-96c6-4482-973a-1a8a0909b232.lovableproject.com';
  console.log('[WEBHOOK CALLBACK] Using development project domain:', developmentDomain);
  return developmentDomain;
};

/**
 * Determines the correct application domain for report viewing
 * This dynamically detects the current deployment domain with improved fallback
 */
const getApplicationDomain = (request?: Request): string => {
  console.log('[WEBHOOK CALLBACK] ======= DOMAIN DETECTION STARTED =======');
  
  // Method 1: Try to get domain from request headers
  if (request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    console.log('[WEBHOOK CALLBACK] Request origin:', origin);
    console.log('[WEBHOOK CALLBACK] Request referer:', referer);
    
    if (origin && origin.includes('lovableproject.com')) {
      console.log('[WEBHOOK CALLBACK] Using origin domain:', origin);
      return origin;
    }
    
    if (referer && referer.includes('lovableproject.com')) {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;
      console.log('[WEBHOOK CALLBACK] Using referer domain:', refererOrigin);
      return refererOrigin;
    }
  }
  
  // Method 2: Try to detect from environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  console.log('[WEBHOOK CALLBACK] Supabase URL:', supabaseUrl);
  
  if (supabaseUrl) {
    // Extract project ID from Supabase URL: https://PROJECT_ID.supabase.co
    const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (projectIdMatch) {
      const projectId = projectIdMatch[1];
      console.log('[WEBHOOK CALLBACK] Detected project ID:', projectId);
      
      // Use current project domain
      const detectedDomain = getCurrentProjectDomain();
      console.log('[WEBHOOK CALLBACK] Using detected project domain:', detectedDomain);
      return detectedDomain;
    }
  }
  
  // Method 3: Use improved fallback with warning
  const fallbackDomain = getCurrentProjectDomain();
  console.warn('[WEBHOOK CALLBACK] ⚠️ Using fallback domain (no headers or environment detection):', fallbackDomain);
  console.log('[WEBHOOK CALLBACK] ======= DOMAIN DETECTION COMPLETE =======');
  return fallbackDomain;
};

/**
 * Generates a unique report view URL using the application's report viewing route
 * Updated to use query parameter format instead of route path
 * @param jobId - The unique job ID from the webhook processing
 * @param request - Optional request object for domain detection
 * @returns A complete URL for viewing the generated report in the application
 */
const generateReportViewUrl = (jobId: string, request?: Request): string => {
  const applicationDomain = getApplicationDomain(request);
  // Updated format: use query parameter instead of route path
  const reportViewUrl = `${applicationDomain}/?jobId=${jobId}`;
  console.log('[WEBHOOK CALLBACK] Generated application report view URL:', reportViewUrl);
  return reportViewUrl;
};

/**
 * Checks if a job has already been processed to prevent duplicate updates
 * @param jobId - The job ID to check
 * @returns Promise<boolean> - True if job is already completed
 */
const isJobAlreadyProcessed = async (jobId: string): Promise<boolean> => {
  console.log('[WEBHOOK CALLBACK] Checking if job is already processed:', jobId);
  
  try {
    const { data: job, error } = await supabaseClient
      .from('webhook_jobs')
      .select('status, response_data')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('[WEBHOOK CALLBACK] Error checking job status:', error);
      return false;
    }

    const isCompleted = job?.status === 'completed' && job?.response_data;
    console.log('[WEBHOOK CALLBACK] Job already processed:', isCompleted);
    return isCompleted;

  } catch (error) {
    console.error('[WEBHOOK CALLBACK] Unexpected error checking job status:', error);
    return false;
  }
};

/**
 * Updates the report_Url in the Prop_Info table for the row matching the CallBackUrl
 * SIMPLIFIED VERSION - Always updates regardless of current value
 * @param callbackUrl - The CallBackUrl to match against in the database
 * @param reportUrl - The generated report view URL to store
 * @returns Promise<boolean> - Success status of the update operation
 */
const updateReportUrlInDatabase = async (callbackUrl: string, reportUrl: string): Promise<boolean> => {
  console.log('[WEBHOOK CALLBACK] ======= STARTING DATABASE UPDATE =======');
  console.log('[WEBHOOK CALLBACK] Callback URL to match:', callbackUrl);
  console.log('[WEBHOOK CALLBACK] Report URL to store:', reportUrl);

  try {
    // First, find the existing row with the matching CallBackUrl
    const { data: existingRows, error: selectError } = await supabaseClient
      .from('Prop_Info')
      .select('id, CallBackUrl, report_Url')
      .eq('CallBackUrl', callbackUrl);

    if (selectError) {
      console.error('[WEBHOOK CALLBACK] ❌ Error checking existing rows:', selectError);
      return false;
    }

    console.log('[WEBHOOK CALLBACK] Found existing rows:', existingRows);

    if (!existingRows || existingRows.length === 0) {
      console.warn('[WEBHOOK CALLBACK] ⚠️ No matching row found for CallBackUrl:', callbackUrl);
      return false;
    }

    const existingRow = existingRows[0];
    console.log('[WEBHOOK CALLBACK] Current report_Url:', existingRow.report_Url);
    console.log('[WEBHOOK CALLBACK] New report_Url:', reportUrl);

    // SIMPLIFIED UPDATE: Always update the report_Url regardless of current value
    console.log('[WEBHOOK CALLBACK] Proceeding with update...');
    
    const { data: updatedData, error: updateError } = await supabaseClient
      .from('Prop_Info')
      .update({ 'report_Url': reportUrl } as any)
      .eq('CallBackUrl', callbackUrl)
      .select();

    if (updateError) {
      console.error('[WEBHOOK CALLBACK] ❌ Error updating report URL:', updateError);
      return false;
    }

    console.log('[WEBHOOK CALLBACK] ✅ Successfully updated report URL:', updatedData);
    console.log('[WEBHOOK CALLBACK] Updated rows count:', updatedData?.length || 0);
    console.log('[WEBHOOK CALLBACK] ======= DATABASE UPDATE COMPLETE =======');
    return true;

  } catch (error) {
    console.error('[WEBHOOK CALLBACK] ❌ Unexpected error during database update:', error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook callback received:', req.method);
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract job ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[pathParts.length - 1];
    
    if (!jobId || jobId === 'webhook-callback') {
      return new Response(
        JSON.stringify({ error: 'Job ID required in URL path' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing callback for job ID: ${jobId}`);

    // ======= IDEMPOTENCY CHECK =======
    const alreadyProcessed = await isJobAlreadyProcessed(jobId);
    if (alreadyProcessed) {
      console.log('[WEBHOOK CALLBACK] ⚠️ Job already processed, returning early to prevent duplicate processing');
      
      // Generate the report URL for response consistency (now with request context)
      const reportViewUrl = generateReportViewUrl(jobId, req);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Job already processed successfully',
          jobId: jobId,
          reportUrlUpdated: true,
          reportUrl: reportViewUrl,
          duplicate: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the response data from the webhook
    const responseData = await req.json();
    console.log('Callback response data received, keys:', Object.keys(responseData || {}));

    // Update the job with the response data
    const { data: updatedJob, error: updateError } = await supabaseClient
      .from('webhook_jobs')
      .update({
        status: 'completed',
        response_data: responseData,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating job:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update job',
          details: updateError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully updated job ${jobId} with response data`);

    // ======= REPORT URL GENERATION AND DATABASE UPDATE =======
    console.log('[WEBHOOK CALLBACK] ======= STARTING REPORT URL PROCESSING =======');
    
    // Generate the report view URL using the job ID - now with dynamic domain detection
    const reportViewUrl = generateReportViewUrl(jobId, req);
    
    // Construct the callback URL that was used for this job
    const callbackUrl = `https://gtupuqdengqiutgipeik.supabase.co/functions/v1/webhook-callback/${jobId}`;
    console.log('[WEBHOOK CALLBACK] Callback URL for matching:', callbackUrl);
    
    // Update the Prop_Info table with the report URL (simplified version)
    const updateSuccess = await updateReportUrlInDatabase(callbackUrl, reportViewUrl);
    
    if (updateSuccess) {
      console.log('[WEBHOOK CALLBACK] ✅ Successfully processed report URL in Prop_Info table');
    } else {
      console.warn('[WEBHOOK CALLBACK] ⚠️ Failed to update report URL in Prop_Info table');
    }
    
    console.log('[WEBHOOK CALLBACK] ======= REPORT URL PROCESSING COMPLETE =======');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Job updated successfully',
        jobId: jobId,
        reportUrlUpdated: updateSuccess,
        reportUrl: reportViewUrl,
        duplicate: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook callback error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

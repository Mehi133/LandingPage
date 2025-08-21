
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook URLs for different request types
const WEBHOOK_URLS = {
  'property-features': 'https://mehiverseai.app.n8n.cloud/webhook/d8ecfb8c-8619-435d-8f0a-569426a49b33',
  'property-confirmation': 'https://mehiverseai.app.n8n.cloud/webhook/495c4e00-56ea-4ded-abe5-108b78f81999'
};

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge Function received request:', req.method);
    
    // For POST requests, process new webhook requests
    if (req.method === 'POST') {
      const { requestType, data } = await req.json();
      console.log('Request type:', requestType);
      console.log('Request data keys:', Object.keys(data || {}));
      console.log('Image URLs in request:', data?.imageUrls?.length || 0);
      console.log('User type in request:', data?.userType);

      // Validate request type
      if (!requestType || !WEBHOOK_URLS[requestType]) {
        console.error('Invalid or missing request type:', requestType);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid request type. Must be "property-features" or "property-confirmation"' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get the appropriate webhook URL
      const webhookUrl = WEBHOOK_URLS[requestType];
      console.log('Routing to webhook:', webhookUrl);

      // For property-features type, we can process synchronously as it's usually fast
      if (requestType === 'property-features') {
        try {
          // Make a direct request for property features (usually fast)
          console.log('Making direct webhook request for property features...');
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error(`Webhook responded with status: ${response.status}`);
          }

          // Parse and return the webhook response
          const responseData = await response.json();
          console.log('Webhook response received for property features');

          return new Response(
            JSON.stringify(responseData),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Error in direct webhook request:', error);
          return new Response(
            JSON.stringify({ 
              error: error.message || 'Webhook request failed',
              details: error.toString()
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } 
      // For property-confirmation type, we use async processing with callback
      else if (requestType === 'property-confirmation') {
        // ENHANCED: Log all data being processed
        console.log('PROPERTY CONFIRMATION - Full data received:', JSON.stringify(data, null, 2));
        console.log('PROPERTY CONFIRMATION - Image URLs:', data.imageUrls);
        console.log('PROPERTY CONFIRMATION - User type:', data.userType);
        console.log('PROPERTY CONFIRMATION - Address data:', {
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        });
        
        // Create a new job in the database
        const { data: job, error: jobError } = await supabaseClient
          .from('webhook_jobs')
          .insert({
            request_type: requestType,
            request_data: data,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (jobError) {
          console.error('Error creating job:', jobError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create job',
              details: jobError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        const jobId = job.id;
        console.log(`Created job with ID ${jobId}, preparing webhook request with callback`);
        
        // Generate callback URL
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const callbackUrl = `${supabaseUrl}/functions/v1/webhook-callback/${jobId}`;
        console.log('Generated callback URL:', callbackUrl);
        
        // ENHANCED: Prepare webhook data with callback URL - ensure all data is included
        const webhookData = {
          ...data,
          callbackUrl: callbackUrl,
          // Ensure these critical fields are preserved
          imageUrls: data.imageUrls || [],
          userType: data.userType,
          jobId: jobId
        };
        
        console.log('WEBHOOK DATA BEING SENT:', JSON.stringify(webhookData, null, 2));
        console.log('Final webhook data - Image URLs count:', webhookData.imageUrls?.length || 0);
        console.log('Final webhook data - User type:', webhookData.userType);
        
        // Update job status to processing
        await supabaseClient.from('webhook_jobs').update({
          status: 'processing',
          updated_at: new Date().toISOString()
        }).eq('id', jobId);
        
        // Make the webhook request with callback URL
        try {
          console.log(`Making webhook request with callback for job ${jobId}`);
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData)
          });

          // Log the response but don't wait for completion
          console.log(`Webhook request initiated for job ${jobId}, status: ${response.status}`);
          
          if (!response.ok) {
            console.log(`Webhook returned non-OK status ${response.status}, but callback will handle results`);
          }
          
          // Don't wait for the response - the callback will handle it
          // Just log that we've initiated the request
          console.log(`Webhook request sent for job ${jobId}, waiting for callback...`);
          
        } catch (error) {
          console.error(`Error making webhook request for job ${jobId}:`, error);
          // Update job status to error
          await supabaseClient.from('webhook_jobs').update({
            status: 'error',
            error: error.message,
            updated_at: new Date().toISOString()
          }).eq('id', jobId);
        }
        
        // Return immediate response with job ID
        return new Response(
          JSON.stringify({ 
            jobId,
            message: 'Webhook job created and request initiated with callback',
            status: 'processing',
            estimatedWaitTime: 'Processing with callback...',
            callbackUrl: callbackUrl
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // If we reach here, it's an unsupported method or endpoint
    return new Response(
      JSON.stringify({ error: 'Method not supported' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge Function error:', error);
    
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

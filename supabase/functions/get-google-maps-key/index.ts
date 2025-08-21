
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or your specific frontend domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY is not set in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    return new Response(JSON.stringify({ apiKey }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in get-google-maps-key function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

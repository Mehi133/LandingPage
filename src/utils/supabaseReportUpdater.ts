
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the report_Url in the Prop_Info table for the row matching the CallBackUrl
 * @param callbackUrl - The CallBackUrl to match against in the database
 * @param reportUrl - The generated report view URL to store
 * @returns Promise<boolean> - Success status of the update operation
 */
export const updateReportUrlInDatabase = async (callbackUrl: string, reportUrl: string): Promise<boolean> => {
  console.log('[SUPABASE REPORT UPDATER] ======= STARTING DATABASE UPDATE =======');
  console.log('[SUPABASE REPORT UPDATER] Callback URL to match:', callbackUrl);
  console.log('[SUPABASE REPORT UPDATER] Report URL to store:', reportUrl);

  try {
    // First, let's check if a row exists with the matching CallBackUrl
    const { data: existingRows, error: selectError } = await supabase
      .from('Prop_Info')
      .select('id, CallBackUrl, report_Url')
      .eq('CallBackUrl', callbackUrl);

    if (selectError) {
      console.error('[SUPABASE REPORT UPDATER] ❌ Error checking existing rows:', selectError);
      return false;
    }

    console.log('[SUPABASE REPORT UPDATER] Found existing rows:', existingRows);

    if (!existingRows || existingRows.length === 0) {
      console.warn('[SUPABASE REPORT UPDATER] ⚠️ No matching row found for CallBackUrl:', callbackUrl);
      return false;
    }

    // Update the report_Url for the matching row(s) using a more flexible approach
    const { data: updatedData, error: updateError } = await supabase
      .from('Prop_Info')
      .update({ 'report_Url': reportUrl } as any)
      .eq('CallBackUrl', callbackUrl)
      .select();

    if (updateError) {
      console.error('[SUPABASE REPORT UPDATER] ❌ Error updating report URL:', updateError);
      return false;
    }

    console.log('[SUPABASE REPORT UPDATER] ✅ Successfully updated report URL:', updatedData);
    console.log('[SUPABASE REPORT UPDATER] ======= DATABASE UPDATE COMPLETE =======');
    return true;

  } catch (error) {
    console.error('[SUPABASE REPORT UPDATER] ❌ Unexpected error during database update:', error);
    return false;
  }
};

/**
 * Extracts the job ID from a callback URL
 * @param callbackUrl - The full callback URL
 * @returns The extracted job ID or null if not found
 */
export const extractJobIdFromCallbackUrl = (callbackUrl: string): string | null => {
  try {
    // Expected format: https://gtupuqdengqiutgipeik.supabase.co/functions/v1/webhook-callback/{jobId}
    const url = new URL(callbackUrl);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[pathParts.length - 1];
    
    console.log('[SUPABASE REPORT UPDATER] Extracted job ID from callback URL:', jobId);
    return jobId;
  } catch (error) {
    console.error('[SUPABASE REPORT UPDATER] Error extracting job ID from callback URL:', error);
    return null;
  }
};

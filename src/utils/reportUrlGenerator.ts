/**
 * Gets the current project domain with improved fallback handling
 */
const getCurrentProjectDomain = (): string => {
  // Use consistent current project domain across all utilities
  return 'https://valora1.lovable.app';
};

/**
 * Generates a unique report view URL based on the current application URL
 * @param jobId - The unique job ID from the webhook processing
 * @returns A complete URL for viewing the generated report
 */
export const generateReportViewUrl = (jobId: string): string => {
  // Check if we're in the browser environment
  if (typeof window !== 'undefined') {
    // Get the current application's base URL
    const baseUrl = window.location.origin;
    
    // Generate a unique report view URL pointing to the application's report route
    const reportUrl = `${baseUrl}/report/view/${jobId}`;
    
    console.log('[REPORT URL GENERATOR] Generated application report URL:', reportUrl);
    return reportUrl;
  }
  
  // Improved fallback for server-side or when window is not available
  const fallbackBaseUrl = getCurrentProjectDomain();
  const reportUrl = `${fallbackBaseUrl}/report/view/${jobId}`;
  
  console.warn('[REPORT URL GENERATOR] ⚠️ Using fallback domain (window not available):', fallbackBaseUrl);
  console.log('[REPORT URL GENERATOR] Generated fallback report URL:', reportUrl);
  return reportUrl;
};

/**
 * Alternative report URL generator that uses the n8n webhook URL format
 * This creates a direct link to view the full report UI
 * @param jobId - The unique job ID from the webhook processing
 * @returns A complete URL for viewing the generated report via n8n
 * @deprecated Use generateReportViewUrl instead for application-based viewing
 */
export const generateN8nReportViewUrl = (jobId: string): string => {
  // Use the n8n webhook URL for viewing the full report
  const reportViewUrl = `https://mehiverseai.app.n8n.cloud/webhook/495c4e00-56ea-4ded-abe5-108b78f81999?jobId=${jobId}`;
  
  console.log('[N8N REPORT URL GENERATOR] Generated n8n report view URL:', reportViewUrl);
  return reportViewUrl;
};

/**
 * Gets the current deployment domain for report URLs
 * Enhanced with better error handling and consistency
 */
export const getCurrentDeploymentDomain = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Use consistent project domain with warning
  const fallbackDomain = getCurrentProjectDomain();
  console.warn('[DEPLOYMENT DOMAIN] ⚠️ Using fallback domain (window not available):', fallbackDomain);
  return fallbackDomain;
};

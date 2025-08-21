
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ReportViewer = () => {
  const { jobId } = useParams();

  useEffect(() => {
    console.log('🔄 [REPORT VIEWER] Starting redirect for job ID:', jobId);
    console.log('🔄 [REPORT VIEWER] useParams result:', { jobId });
    console.log('🔄 [REPORT VIEWER] Current URL:', window.location.href);
    
    // Add timestamp for cache busting
    const timestamp = new Date().getTime();
    console.log('🔄 [REPORT VIEWER] Cache bust timestamp:', timestamp);
    
    if (jobId && jobId.trim().length > 0) {
      try {
        // Get the current base URL
        const baseUrl = window.location.origin;
        
        // Create redirect URL with job ID parameter and cache busting
        // FIXED: Properly encode the jobId parameter
        const encodedJobId = encodeURIComponent(jobId.trim());
        const redirectUrl = `${baseUrl}/?jobId=${encodedJobId}&t=${timestamp}`;
        
        console.log('🔄 [REPORT VIEWER] Original jobId:', jobId);
        console.log('🔄 [REPORT VIEWER] Encoded jobId:', encodedJobId);
        console.log('🔄 [REPORT VIEWER] Final redirect URL:', redirectUrl);
        
        // Use window.location.replace to prevent back button issues
        window.location.replace(redirectUrl);
      } catch (error) {
        console.error('❌ [REPORT VIEWER] Redirect error:', error);
        // Fallback to home page
        window.location.replace(window.location.origin);
      }
    } else {
      console.error('❌ [REPORT VIEWER] No valid job ID provided:', jobId);
      console.error('❌ [REPORT VIEWER] jobId type:', typeof jobId);
      console.error('❌ [REPORT VIEWER] jobId length:', jobId?.length);
      // Redirect to home page if no valid job ID
      window.location.replace(window.location.origin);
    }
  }, [jobId]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <div className="text-lg font-medium text-foreground">
          Loading your report...
        </div>
        <div className="text-sm text-muted-foreground">
          Job ID: {jobId || 'Not found'}
        </div>
        <div className="text-sm text-muted-foreground">
          Redirecting to report viewer
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;

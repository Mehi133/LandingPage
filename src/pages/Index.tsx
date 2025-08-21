import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ValuationLoading from "@/components/ValuationLoading";
import PropertyReport from "@/components/PropertyReport";
import ValuationResult from "@/components/ValuationResult";
import CenteredValuationForm from "@/components/CenteredValuationForm";
import WelcomeForm from "@/components/WelcomeForm";
import TrialLimitModal from "@/components/TrialLimitModal";
import { useToast } from "@/hooks/use-toast";
import { checkWebhookJobStatus } from '@/utils/webhook/propertyConfirmationApi';
import { parseWebhookResponse } from '@/utils/webhook/responseParser';

// Force production rebuild - updated timestamp
const INDEX_CACHE_BUST = `v2.2.${Date.now()}`;
console.log(`🔄 [PRODUCTION INDEX] ${INDEX_CACHE_BUST} LOADED - ${new Date().toISOString()}`);

const Index = () => {
  const [searchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [valuationData, setValuationData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [webhookResponseData, setWebhookResponseData] = useState<any>(null);
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [userData, setUserData] = useState<{ fullName: string; email: string } | null>(null);
  const [showTrialLimit, setShowTrialLimit] = useState(false);

  // NEW: States for handling view links
  const [isViewLinkMode, setIsViewLinkMode] = useState(false);
  const [viewLinkError, setViewLinkError] = useState<string | null>(null);

  const { toast } = useToast();

  // Enhanced view link jobId parameter handling with production build
  useEffect(() => {
    console.log(`🔍 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] ========== URL PARAMETER CHECK ==========`);
    console.log('🔍 [PRODUCTION VIEW LINK] Current URL:', window.location.href);
    console.log('🔍 [PRODUCTION VIEW LINK] useSearchParams entries:', Array.from(searchParams.entries()));
    
    const jobId = searchParams.get('jobId');
    console.log('🔍 [PRODUCTION VIEW LINK] searchParams.get("jobId") result:', jobId);
    
    if (jobId && jobId.trim().length > 0) {
      console.log('🔍 [PRODUCTION VIEW LINK] ✅ Valid jobId detected, entering view link mode');
      setIsViewLinkMode(true);
      setIsLoading(true);
      setShowWelcome(false);
      
      fetchReportFromJobId(jobId.trim());
    } else {
      console.log('🔍 [PRODUCTION VIEW LINK] ❌ No valid jobId found');
    }
  }, [searchParams]);

const fetchReportFromJobId = async (jobId: string) => {
  console.log(`📊 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] ======= FETCHING REPORT FROM JOB ID =======`);
  console.log('📊 [PRODUCTION VIEW LINK] Job ID:', jobId);
  
  try {
    // Force production build recognition
    const cacheBustParam = `_cb=${Date.now()}`;
    console.log('📊 [PRODUCTION VIEW LINK] Using cache-bust parameter:', cacheBustParam);
    
    // Fetch the stored webhook response data
    const jobStatusResponse = await checkWebhookJobStatus(jobId);
    console.log('📊 [PRODUCTION VIEW LINK] Job status response:', jobStatusResponse);
    
    if (!jobStatusResponse?.response_data) {
      throw new Error('No report data found for this job ID');
    }
    
    // Parse the webhook response using the updated PRODUCTION parser
    console.log('📊 [PRODUCTION VIEW LINK] Parsing webhook response with PRODUCTION parser...');
    const parsedData = parseWebhookResponse(jobStatusResponse.response_data);
    console.log('📊 [PRODUCTION VIEW LINK] Parsed data:', parsedData);
    console.log('📊 [PRODUCTION VIEW LINK] Pricing data structure:', parsedData?.pricingData);
    
    if (!parsedData.success) {
      throw new Error(parsedData.message || 'Failed to parse report data');
    }
    
    // Production build double-nesting fix with verification
    if (parsedData.pricingData?.PricingStrategy?.length > 0) {
      const firstItem = parsedData.pricingData.PricingStrategy[0] as any;
      console.log(`📊 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] Checking first item of PricingStrategy array...`);
      console.log('📊 [PRODUCTION VIEW LINK] First item:', JSON.stringify(firstItem, null, 2));
      
      // Check if the first item ONLY has a PricingStrategy key (indicating double-nesting)
      if (firstItem && 
          typeof firstItem === 'object' && 
          Object.keys(firstItem).length === 1 && 
          'PricingStrategy' in firstItem &&
          Array.isArray(firstItem.PricingStrategy) &&
          firstItem.PricingStrategy.length > 0) {
        
        console.log('📊 [PRODUCTION VIEW LINK] Found double-nested PricingStrategy, unwrapping...');
        // Use the inner array directly
        parsedData.pricingData.PricingStrategy = firstItem.PricingStrategy;
        console.log('📊 [PRODUCTION VIEW LINK] Fixed pricing data:', JSON.stringify(parsedData.pricingData, null, 2));
      }
    }
    
    // CRITICAL FIX: Use subjectProperty from response_data instead of reconstructing from request_data
    console.log('📊 [PRODUCTION VIEW LINK] ======= EXTRACTING SUBJECT PROPERTY FROM RESPONSE DATA =======');
    
    let subjectProperty = null;
    
    // Type check and cast response_data
    const responseData = jobStatusResponse.response_data;
    if (typeof responseData === 'object' && responseData !== null && !Array.isArray(responseData)) {
      const typedResponseData = responseData as { [key: string]: any };
      
      // First try to get subjectProperty from the response_data (the webhook response)
      if (typedResponseData.subjectProperty) {
        console.log('📊 [PRODUCTION VIEW LINK] ✅ Found subjectProperty in response_data:', typedResponseData.subjectProperty);
        subjectProperty = typedResponseData.subjectProperty;
      } else {
        console.log('📊 [PRODUCTION VIEW LINK] ⚠️ No subjectProperty in response_data, falling back to request_data construction');
        
        // FALLBACK: Get the original request data from the correct database column with proper type handling
        const requestDataString = typeof jobStatusResponse.request_data === 'string' 
          ? jobStatusResponse.request_data 
          : JSON.stringify(jobStatusResponse.request_data || {});
        const originalRequestData = JSON.parse(requestDataString);
        console.log('📊 [PRODUCTION VIEW LINK] Original request data:', originalRequestData);
        
        // Construct proper address from request data
        const streetAddress = originalRequestData.streetAddress || '';
        const city = originalRequestData.city || '';
        const state = originalRequestData.state || '';
        const zipCode = originalRequestData.zipCode || '';
        
        // Build full address string
        const fullAddress = [streetAddress, city, state, zipCode]
          .filter(part => part && part.trim().length > 0)
          .join(', ');
        
        console.log('📊 [PRODUCTION VIEW LINK] Constructed full address:', fullAddress);
        
        // Create subject property from request data with proper mapping
        subjectProperty = {
          address: fullAddress,
          // Map the request data fields to the expected format
          Beds: originalRequestData.Beds || originalRequestData.beds,
          Baths: originalRequestData.Baths || originalRequestData.baths,
          'Square Footage': originalRequestData['Square Footage'] || originalRequestData.sqft,
          'Year Built': originalRequestData['Year Built'] || originalRequestData.yearBuilt,
          AdvancedPropertyType: originalRequestData.AdvancedPropertyType || originalRequestData.propertyType,
          Units: originalRequestData.Units || originalRequestData.units,
          HVAC: originalRequestData.HVAC === 'yes' ? 1 : 0,
          AirCond: originalRequestData.AirCond === 'yes' ? 1 : 0,
          Heating: originalRequestData.Heating === 'yes' ? 1 : 0,
          Pool: originalRequestData.Pool === 'yes' ? 1 : 0,
          Fireplace: originalRequestData.Fireplace === 'yes' ? 1 : 0,
          BasementType: originalRequestData.BasementType,
          ConstructionType: originalRequestData.ConstructionType,
          ExteriorWallType: originalRequestData.ExteriorWallType,
          RoofType: originalRequestData.RoofType,
          ViewType: originalRequestData.ViewType,
          
          // Keep all original data for compatibility
          ...originalRequestData
        };
      }
    } else {
      throw new Error('Invalid response data format');
    }
    
    console.log('📊 [PRODUCTION VIEW LINK] Final subject property:', subjectProperty);
    
    // Create address data for the report
    const addressData = {
      fullAddress: subjectProperty?.address || 'Address not available'
    };
    
    console.log(`📊 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] Setting up report display...`);
    console.log('📊 [PRODUCTION VIEW LINK] Subject property address:', addressData.fullAddress);
    console.log('📊 [PRODUCTION VIEW LINK] Final pricing data:', parsedData.pricingData);
    
    setValuationData(subjectProperty);
    setAddressData(addressData);
    setWebhookResponseData(parsedData);
    setShowFullReport(true);
    setIsLoading(false);
    
    console.log(`📊 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] ✅ Report setup complete, should display full report`);
    
  } catch (error) {
    console.error(`📊 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] ❌ Error fetching report:`, error);
    setViewLinkError(error.message || 'Failed to load report');
    setIsLoading(false);
    
    toast({
      title: "Error Loading Report",
      description: error.message || "The report could not be loaded. The link may be invalid or expired.",
      variant: "destructive",
    });
  }
};

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleSuccess = (data: any, address: any) => {
    // Check if trial limit was reached
    if (data?.trialLimitReached) {
      console.log('[TRIAL LIMIT] Showing trial limit modal');
      setShowTrialLimit(true);
      setIsLoading(false);
      return;
    }

    // Store original form data including imageUrls and user data
    setOriginalFormData({
      imageUrls: data.imageUrls || [],
      userData: userData
    });
    
    setValuationData(data);
    setAddressData(address);
    setShowFullReport(false);
    setWebhookResponseData(null);
    setIsLoading(false);
  };

  const handleConfirmReport = (responseData?: any) => {
    setWebhookResponseData(responseData);
    setShowFullReport(true);
  };
  
  const handleReset = () => {
    setValuationData(null);
    setAddressData(null);
    setShowFullReport(false);
    setWebhookResponseData(null);
    setOriginalFormData(null);
    setShowTrialLimit(false);
    setIsViewLinkMode(false);
    setViewLinkError(null);
  };

  const handleWelcomeComplete = (userInfo: { fullName: string; email: string }) => {
    setUserData(userInfo);
    setShowWelcome(false);
  };

  const handleTrialLimitClose = () => {
    setShowTrialLimit(false);
  };

  // FIXED: Helper function to construct reportData for PropertyReport - use webhook response subject property when available
  const constructReportData = () => {
    console.log('[CONSTRUCT REPORT DATA] ======= CONSTRUCTING REPORT DATA =======');
    console.log('[CONSTRUCT REPORT DATA] webhookResponseData available:', !!webhookResponseData);
    console.log('[CONSTRUCT REPORT DATA] webhookResponseData.subjectProperty:', webhookResponseData?.subjectProperty);
    console.log('[CONSTRUCT REPORT DATA] valuationData (fallback):', valuationData);
    
    // CRITICAL FIX: Use subject property from webhook response if available (has all the detailed data)
    // Only fall back to valuationData if webhook response doesn't have subject property
    const subjectProperty = webhookResponseData?.subjectProperty || valuationData;
    
    console.log('[CONSTRUCT REPORT DATA] Final subject property to use:', subjectProperty);
    
    return {
      success: true,
      message: 'Report loaded successfully',
      subjectProperty: subjectProperty,
      activeListings: webhookResponseData?.activeListings || [],
      recentSales: webhookResponseData?.recentSales || [],
      marketData: webhookResponseData?.marketData,
      pricingData: webhookResponseData?.pricingData,
      pdfUrl: webhookResponseData?.pdfUrl
    };
  };

  // Show trial limit modal (highest priority)
  if (showTrialLimit) {
    return (
      <TrialLimitModal 
        isOpen={showTrialLimit} 
        firstName={userData?.fullName?.split(' ')[0] || 'Friend'} 
        onClose={handleTrialLimitClose}
      />
    );
  }

  // Handle view link error state
  if (isViewLinkMode && viewLinkError) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="text-red-500 text-lg font-medium">
            Report Not Available
          </div>
          <div className="text-muted-foreground max-w-md">
            {viewLinkError}
          </div>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <ValuationLoading />
      </div>
    );
  }

  // Show full report for view links (highest priority after loading)
  if (isViewLinkMode && valuationData && showFullReport) {
    console.log(`📊 [PRODUCTION VIEW LINK ${INDEX_CACHE_BUST}] Rendering full report for view link`);
    return (
      <div className="h-screen w-screen bg-background overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <PropertyReport 
            reportData={constructReportData()}
            onBack={handleReset}
            showBackButton={true}
            isEmbedded={false}
          />
        </div>
      </div>
    );
  }

  // Show full report for main app flow
  if (valuationData && showFullReport && !isViewLinkMode) {
    console.log('[MAIN APP FLOW] Rendering full report for main app');
    console.log('[MAIN APP FLOW] constructReportData() result:', constructReportData());
    return (
      <div className="h-screen w-screen bg-background overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <PropertyReport 
            reportData={constructReportData()}
            onBack={handleReset}
            showBackButton={true}
            isEmbedded={false}
          />
        </div>
      </div>
    );
  }

  // Show valuation result for main app flow
  if (valuationData && !showFullReport && !isViewLinkMode) {
    return (
      <div className="min-h-screen w-screen bg-background overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <ValuationResult 
            data={valuationData}
            addressData={addressData}
            originalFormData={originalFormData}
            onReset={handleReset}
            onConfirmReport={handleConfirmReport}
          />
        </div>
      </div>
    );
  }

  // Show welcome form first (only for main app flow)
  if (showWelcome && !isViewLinkMode) {
    return (
      <>
        <div className="h-screen w-screen bg-background">
          <CenteredValuationForm
            userType="buyer"
            onSuccess={handleSuccess}
            onLoading={handleLoading}
            userData={userData}
          />
        </div>
        <WelcomeForm onComplete={handleWelcomeComplete} />
      </>
    );
  }

  // Show centered valuation form (after welcome, only for main app flow)
  if (!isViewLinkMode) {
    return (
      <div className="h-screen w-screen bg-background">
        <CenteredValuationForm
          userType="buyer"
          onSuccess={handleSuccess}
          onLoading={handleLoading}
          userData={userData}
        />
      </div>
    );
  }

  // Fallback - should not reach here
  return null;
};

export default Index;

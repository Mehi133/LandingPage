import React, { useState, useEffect } from 'react';
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { extractPriceFromProperty } from '@/utils/webhook/parsers/priceParser';
import { mapActiveListingFromWebhook, mapRecentSaleFromWebhook, mapSubjectPropertyFromWebhook } from '@/utils/webhook/parsers/propertyMapper';
import { extractPropertiesFromNumericKeys } from '@/utils/webhook/parsers/numericKeyExtractor';
import { extractMarketData } from '@/utils/webhook/parsers/marketDataExtractor';
import SideBySideSection from './report-sections/SideBySideSection';
import PricingStrategy from './report-sections/PricingStrategy';
import PropertyOverview from './report-sections/PropertyOverview';
import ComparableSection from './report-sections/ComparableSection';
import MarketConditions from './report-sections/MarketConditions';
import ReportMapSection from './ReportMapSection';
import ReportHeader from './report-sections/ReportHeader';
import { WebhookResponse, ConfirmationResponse, MarketDataUnion } from '@/utils/webhook/types';

interface PropertyReportProps {
  reportData: ConfirmationResponse;
  onBack?: () => void;
  showBackButton?: boolean;
  isEmbedded?: boolean;
}

const PropertyReport: React.FC<PropertyReportProps> = ({ 
  reportData, 
  onBack, 
  showBackButton = true,
  isEmbedded = false 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [subjectProperty, setSubjectProperty] = useState<any>(null);
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<MarketDataUnion | undefined>(undefined);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[PROPERTY REPORT] ======= PROCESSING REPORT DATA =======');
    console.log('[PROPERTY REPORT] Full reportData received:', reportData);
    console.log('[PROPERTY REPORT] reportData keys:', Object.keys(reportData || {}));
    console.log('[PROPERTY REPORT] reportData type:', typeof reportData);
    console.log('[PROPERTY REPORT] reportData structure check:', {
      hasSubjectProperty: 'subjectProperty' in (reportData || {}),
      hasActiveListings: 'activeListings' in (reportData || {}),
      hasRecentSales: 'recentSales' in (reportData || {}),
      hasMarketData: 'marketData' in (reportData || {}),
      hasPdfUrl: 'pdfUrl' in (reportData || {}),
      hasError: 'error' in (reportData || {})
    });
    
    if (reportData) {
      setIsLoading(false);
      setPdfUrl(reportData.pdfUrl || null);
      setError(reportData.error || null);
      
      // CRITICAL DEBUGGING: Log the exact subjectProperty structure
      console.log('[PROPERTY REPORT] ======= SUBJECT PROPERTY RAW DATA =======');
      console.log('[PROPERTY REPORT] Raw subjectProperty:', JSON.stringify(reportData.subjectProperty, null, 2));
      console.log('[PROPERTY REPORT] subjectProperty type:', typeof reportData.subjectProperty);
      console.log('[PROPERTY REPORT] subjectProperty keys:', Object.keys(reportData.subjectProperty || {}));
      
      // Check if subjectProperty has address field directly
      if (reportData.subjectProperty) {
        console.log('[PROPERTY REPORT] Direct address field:', reportData.subjectProperty.address);
        console.log('[PROPERTY REPORT] Direct beds field:', reportData.subjectProperty.beds);
        console.log('[PROPERTY REPORT] Direct baths field:', reportData.subjectProperty.baths);
        console.log('[PROPERTY REPORT] Direct price field:', reportData.subjectProperty.price);
        console.log('[PROPERTY REPORT] Direct images field:', reportData.subjectProperty.images);
        console.log('[PROPERTY REPORT] Images array check:', Array.isArray(reportData.subjectProperty.images));
        console.log('[PROPERTY REPORT] Images length:', reportData.subjectProperty.images?.length);
        
        // Log all available fields for debugging
        console.log('[PROPERTY REPORT] ALL SUBJECT PROPERTY FIELDS:');
        Object.keys(reportData.subjectProperty).forEach(key => {
          console.log(`[PROPERTY REPORT] ${key}:`, reportData.subjectProperty[key]);
        });
      }
      
      let mappedSubject = null;
      
      if (reportData.subjectProperty) {
        console.log('[PROPERTY REPORT] ======= CALLING MAPPER FUNCTION =======');
        try {
          mappedSubject = mapSubjectPropertyFromWebhook(reportData.subjectProperty);
          console.log('[PROPERTY REPORT] ======= MAPPER FUNCTION RESULT =======');
          console.log('[PROPERTY REPORT] MAPPED SUBJECT RESULT:', mappedSubject);
          console.log('[PROPERTY REPORT] Mapped subject keys:', Object.keys(mappedSubject || {}));
          console.log('[PROPERTY REPORT] Mapped subject address:', mappedSubject?.address);
          console.log('[PROPERTY REPORT] Mapped subject images:', mappedSubject?.images);
          console.log('[PROPERTY REPORT] Mapped subject images length:', mappedSubject?.images?.length);
          console.log('[PROPERTY REPORT] Mapped subject beds/baths:', { beds: mappedSubject?.beds, baths: mappedSubject?.baths });
          console.log('[PROPERTY REPORT] Mapped subject price:', mappedSubject?.price);
          
          // CRITICAL: Verify the mapped data has essential fields
          if (!mappedSubject?.address || mappedSubject.address === 'Address not available') {
            console.error('[PROPERTY REPORT] ❌ CRITICAL: Address mapping failed!');
          }
          if (!mappedSubject?.images || mappedSubject.images.length === 0) {
            console.error('[PROPERTY REPORT] ❌ CRITICAL: Images mapping failed!');
          }
          if (!mappedSubject?.beds && !mappedSubject?.baths) {
            console.error('[PROPERTY REPORT] ❌ CRITICAL: Beds/baths mapping failed!');
          }
          
          setSubjectProperty(mappedSubject);
        } catch (error) {
          console.error('[PROPERTY REPORT] ❌ ERROR in mapSubjectPropertyFromWebhook:', error);
          setSubjectProperty(null);
        }
      } else {
        console.error('[PROPERTY REPORT] ❌ ERROR: No subjectProperty found in reportData');
        setSubjectProperty(null);
      }
      
      if (reportData.activeListings && Array.isArray(reportData.activeListings)) {
        const mappedActiveListings = reportData.activeListings.map((property, index) => mapActiveListingFromWebhook(property, index));
        setActiveListings(mappedActiveListings);
      } else if (reportData.activeListings) {
        // Handle numeric-keyed active listings
        const numericActiveListings = extractPropertiesFromNumericKeys(reportData.activeListings);
        const mappedNumericActiveListings = numericActiveListings.map((property, index) => mapActiveListingFromWebhook(property, index));
        setActiveListings(mappedNumericActiveListings);
      }
      
      if (reportData.recentSales && Array.isArray(reportData.recentSales)) {
        const mappedRecentSales = reportData.recentSales.map((property, index) => mapRecentSaleFromWebhook(property, index));
        setRecentSales(mappedRecentSales);
      } else if (reportData.recentSales) {
        // Handle numeric-keyed recent sales
        const numericRecentSales = extractPropertiesFromNumericKeys(reportData.recentSales);
        const mappedNumericRecentSales = numericRecentSales.map((property, index) => mapRecentSaleFromWebhook(property, index));
        setRecentSales(mappedNumericRecentSales);
      }
      
      if (reportData.marketData) {
        setMarketData(extractMarketData(reportData));
      }
      
      console.log('[PROPERTY REPORT] ======= FINAL STATE WILL BE =======');
      console.log('[PROPERTY REPORT] Final subjectProperty state:', mappedSubject);
      console.log('[PROPERTY REPORT] Final activeListings count:', reportData.activeListings?.length || 0);
      console.log('[PROPERTY REPORT] Final recentSales count:', reportData.recentSales?.length || 0);
      console.log('[PROPERTY REPORT] ======= END PROCESSING =======');
      
    } else {
      console.error('[PROPERTY REPORT] ❌ ERROR: No reportData provided');
      setIsLoading(true);
    }
  }, [reportData]);

  const handleDownloadPdf = (pdfData: string): boolean => {
    if (pdfData) {
      window.open(pdfData, '_blank');
      return true;
    } else {
      toast({
        title: "PDF not available",
        description: "The PDF report could not be generated.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePropertyClick = (property: any) => {
    console.log('Property clicked:', property);
  };

  // Add debugging before render
  console.log('[PROPERTY REPORT] ======= RENDER DEBUG =======');
  console.log('[PROPERTY REPORT] About to render with subjectProperty:', !!subjectProperty);
  console.log('[PROPERTY REPORT] subjectProperty address:', subjectProperty?.address);
  console.log('[PROPERTY REPORT] subjectProperty images count:', subjectProperty?.images?.length || 0);
  console.log('[PROPERTY REPORT] subjectProperty beds/baths:', { beds: subjectProperty?.beds, baths: subjectProperty?.baths });
  console.log('[PROPERTY REPORT] isLoading:', isLoading);

  return (
    <div className={isEmbedded ? "min-h-screen bg-background" : "min-h-screen bg-background"}>
      {/* Report Header */}
      <ReportHeader 
        onReset={onBack}
        subjectProperty={subjectProperty}
        pdfUrl={pdfUrl}
        onPdfDownload={handleDownloadPdf}
      />

      <div className="container mx-auto p-4">
        {showBackButton && (
          <Button variant="ghost" onClick={onBack || (() => window.history.back())} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="comparables">Comparables</TabsTrigger>
            <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <Skeleton className="w-[400px] h-[400px]" />
            ) : (
              <>
                {console.log('[PROPERTY REPORT] ======= RENDERING PropertyOverview =======', { 
                  subjectProperty: !!subjectProperty, 
                  hasAddress: !!subjectProperty?.address,
                  hasImages: !!subjectProperty?.images?.length,
                  activeListings: activeListings.length, 
                  recentSales: recentSales.length 
                })}
                <PropertyOverview 
                  subjectProperty={subjectProperty} 
                  activeListings={activeListings}
                  recentSales={recentSales}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <MarketConditions 
              marketData={marketData}
            />
          </TabsContent>

          <TabsContent value="comparables" className="space-y-6">
            <div className="space-y-8">
              <ComparableSection 
                title="Active Listings"
                activeListings={activeListings}
                subjectProperty={subjectProperty}
                showSoldDate={false}
              />
              <ComparableSection 
                title="Recent Sales"
                recentSales={recentSales}
                subjectProperty={subjectProperty}
                showSoldDate={true}
              />
              <ReportMapSection
                subject={subjectProperty}
                activeListings={activeListings}
                recentSales={recentSales}
              />
            </div>
          </TabsContent>

          <TabsContent value="side-by-side" className="space-y-6">
            <SideBySideSection 
              activeListings={activeListings} 
              recentSales={recentSales} 
              subjectProperty={subjectProperty}
              onPropertyClick={handlePropertyClick}
            />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingStrategy 
              propertyData={reportData.subjectProperty} 
              pricingData={reportData.pricingData}
              activeListings={reportData.activeListings}
              recentSales={reportData.recentSales}
              marketData={reportData.marketData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyReport;

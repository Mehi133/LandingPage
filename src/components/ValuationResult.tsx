
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import PropertyFeatureDisplay from './PropertyFeatureDisplay';
import PropertyFeatureEditor from './PropertyFeatureEditor';
import { usePropertyData } from '@/hooks/usePropertyData';
import ActionButtons from './valuation-result/ActionButtons';
import ConfirmationDialog from './valuation-result/ConfirmationDialog';
import ConfirmationLoadingModal from './ConfirmationLoadingModal';
import { useToast } from "@/hooks/use-toast";
import PdfDownloadSection from './valuation-result/PdfDownloadSection';
import PropertyDetailsHeader from './valuation-result/PropertyDetailsHeader';
import { useJobPolling } from '@/hooks/useJobPolling';
import { usePropertyConfirmation } from '@/hooks/usePropertyConfirmation';
import { usePdfFetcher } from '@/hooks/usePdfFetcher';

interface ValuationResultProps {
  data: any;
  addressData?: any;
  originalFormData?: any;
  onReset?: () => void;
  onConfirmReport: (responseData?: any) => void;
}

const ValuationResult: React.FC<ValuationResultProps> = ({ 
  data, 
  addressData, 
  originalFormData,
  onReset, 
  onConfirmReport 
}) => {
  const { displayData, updateDisplayData, hasUserEdits } = usePropertyData(data);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessingConfirmation, setIsProcessingConfirmation] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { toast } = useToast();
  
  // Create a ref to access the editor's save function
  const editorRef = useRef<{ triggerSave: () => void }>(null);

  // Filter out backend-only fields for display
  const getDisplayOnlyData = (data: Record<string, any>) => {
    const backendOnlyFields = ['userType', 'imageUrls', 'userData'];
    const filteredData = { ...data };
    
    backendOnlyFields.forEach(field => {
      delete filteredData[field];
    });
    
    // Also filter out any object values that would show as [Object object]
    Object.keys(filteredData).forEach(key => {
      const value = filteredData[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        delete filteredData[key];
      }
    });
    
    return filteredData;
  };

  const displayOnlyData = getDisplayOnlyData(displayData);

  console.log('📋 ValuationResult - Filtered display data:', displayOnlyData);

  // Use custom hooks
  const {
    activeJobId,
    pollingStartTime,
    estimatedWaitTime,
    startPolling,
    stopPolling
  } = useJobPolling({ 
    onConfirmReport: (responseData) => {
      // When report is ready, set progress to 100% and proceed
      setLoadingProgress(100);
      setTimeout(() => {
        setIsProcessingConfirmation(false);
        onConfirmReport(responseData);
      }, 500);
    }, 
    setPdfUrl 
  });

  const { 
    pdfUrl: fetcherPdfUrl, 
    isPdfFetching, 
    fetchProgress, 
    fetchLatestPdfUrl, 
    handlePdfDownload 
  } = usePdfFetcher();

  const { isSubmitting, handleConfirm } = usePropertyConfirmation({
    displayData, // This now includes user edits
    addressData,
    originalFormData,
    onConfirmReport: (responseData) => {
      // When report is ready, set progress to 100% and proceed
      setLoadingProgress(100);
      setTimeout(() => {
        setIsProcessingConfirmation(false);
        onConfirmReport(responseData);
      }, 500);
    },
    setPdfUrl: (url) => {
      setPdfUrl(url);
      if (url) {
        fetchLatestPdfUrl(url);
      }
    },
    startPolling,
    setIsProcessingConfirmation
  });

  // Update loading progress when activeJobId changes
  useEffect(() => {
    if (activeJobId) {
      setLoadingProgress(10);
    }
  }, [activeJobId]);

  const activePdfUrl = fetcherPdfUrl || pdfUrl;

  const handleEdit = () => {
    console.log('🔧 Edit button clicked, toggling edit mode from:', isEditing, 'to:', !isEditing);
    setIsEditing(!isEditing);
  };

  const handleSave = (editedData?: Record<string, any>) => {
    console.log('💾 ========== SAVING USER EDITS ==========');
    
    if (editedData) {
      console.log('💾 Edited data received from PropertyFeatureEditor:', editedData);
      console.log('💾 Previous displayData:', displayData);
      
      updateDisplayData(editedData);
      setIsEditing(false);
      
      console.log('💾 User edits saved, displayData should now be updated');
      
      toast({
        title: "Changes saved",
        description: "Your property features have been updated and will be included in the full report.",
      });
      
      console.log('💾 ========== SAVE COMPLETE ==========');
    } else {
      // Trigger save from the editor component
      if (editorRef.current) {
        editorRef.current.triggerSave();
      }
    }
  };

  const handleConfirmClick = () => {
    console.log('✅ ========== CONFIRM BUTTON CLICKED ==========');
    console.log('✅ Current displayData (includes user edits):', displayData);
    console.log('✅ Has user edits flag:', hasUserEdits);
    console.log('✅ Starting confirmation process with this data');
    
    setShowConfirmDialog(false);
    setLoadingProgress(0);
    handleConfirm();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <PropertyDetailsHeader />

      <Card className="shadow-md bg-card border-border">
        <CardContent className="pt-6">
          <ActionButtons 
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onEdit={handleEdit}
            onConfirm={() => {
              console.log('🔔 Action button confirm clicked, showing dialog');
              setShowConfirmDialog(true);
            }}
            onSave={() => handleSave()}
          />

          {isEditing ? (
            <PropertyFeatureEditor
              ref={editorRef}
              formData={displayOnlyData}
              onSave={handleSave}
              onCancel={() => {
                console.log('❌ Edit cancelled');
                setIsEditing(false);
              }}
            />
          ) : (
            <>
              <PropertyFeatureDisplay 
                displayData={displayOnlyData}
              />
              
              {/* Only show PDF download section when NOT processing confirmation */}
              {!isProcessingConfirmation && (
                <PdfDownloadSection
                  pdfUrl={activePdfUrl}
                  isPdfFetching={isPdfFetching}
                  fetchProgress={fetchProgress}
                  isSubmitting={isSubmitting}
                  onPdfDownload={handlePdfDownload}
                />
              )}
            </>
          )}

          <ConfirmationDialog
            isOpen={showConfirmDialog}
            isSubmitting={isSubmitting}
            onOpenChange={(open) => {
              console.log('🔔 Confirmation dialog state changed to:', open);
              setShowConfirmDialog(open);
            }}
            onConfirm={handleConfirmClick}
            onEdit={handleEdit}
          />

          {/* Loading Modal - Shows as full-screen overlay */}
          <ConfirmationLoadingModal
            isOpen={isProcessingConfirmation}
            estimatedWaitTime={120}
            elapsedTime={pollingStartTime ? Math.floor((Date.now() - pollingStartTime) / 1000) : 0}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuationResult;

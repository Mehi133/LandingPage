
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2 } from 'lucide-react';

interface PdfDownloadSectionProps {
  pdfUrl: string | null;
  isPdfFetching: boolean;
  fetchProgress: number;
  isSubmitting: boolean;
  onPdfDownload?: (pdfData: string) => boolean;
}

const PdfDownloadSection: React.FC<PdfDownloadSectionProps> = ({ 
  pdfUrl, 
  isPdfFetching, 
  fetchProgress,
  isSubmitting,
  onPdfDownload
}) => {
  console.log('📄 PdfDownloadSection rendered with:');
  console.log('📄 - pdfUrl:', pdfUrl?.substring(0, 100) + '...');
  console.log('📄 - isPdfFetching:', isPdfFetching);
  console.log('📄 - fetchProgress:', fetchProgress);
  console.log('📄 - isSubmitting:', isSubmitting);

  if (!pdfUrl && !isPdfFetching && !isSubmitting) {
    console.log('📄 No PDF URL and not fetching/submitting - hiding section');
    return null;
  }

  const handleDownloadClick = () => {
    console.log('📄 Download button clicked with URL:', pdfUrl?.substring(0, 100) + '...');
    if (pdfUrl && onPdfDownload) {
      const success = onPdfDownload(pdfUrl);
      if (!success) {
        console.warn('📄 PDF download failed');
      }
    } else {
      console.warn('📄 Download clicked but no PDF URL or download handler available');
    }
  };

  return (
    <div className="mt-6">
      {pdfUrl ? (
        <Button
          variant="default"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleDownloadClick}
        >
          <Download className="h-4 w-4" /> Download PDF Report
        </Button>
      ) : isPdfFetching ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Generating PDF report...</p>
            <p className="text-sm font-medium text-gray-500">{fetchProgress}%</p>
          </div>
          <Progress value={fetchProgress} className="h-2" />
        </div>
      ) : null}
    </div>
  );
};

export default PdfDownloadSection;

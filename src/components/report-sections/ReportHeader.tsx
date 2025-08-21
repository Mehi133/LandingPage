
import React from 'react';
import { Download, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReportHeaderProps {
  onReset?: () => void;
  subjectProperty?: any;
  userEnteredAddress?: string;
  propertyAddress?: string;
  pdfUrl?: string;
  onPdfDownload?: (pdfData: string) => boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  onReset,
  subjectProperty,
  userEnteredAddress,
  propertyAddress,
  pdfUrl,
  onPdfDownload
}) => {
  const displayAddress = userEnteredAddress || subjectProperty?.address || propertyAddress || 'Property Address';

  const handleDownloadClick = () => {
    if (pdfUrl && onPdfDownload) {
      const success = onPdfDownload(pdfUrl);
      if (!success) {
        console.warn('PDF download failed');
      }
    }
  };

  return (
    <div className="border-b border-border bg-card shadow-sm">
      <div className="report-container px-6 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs font-medium">
                <FileText className="w-3 h-3 mr-1" />
                Property Valuation Report
              </Badge>
            </div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-3 truncate">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">{displayAddress}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {pdfUrl ? (
              <Button 
                onClick={handleDownloadClick}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" /> 
                Download PDF
              </Button>
            ) : (
              <Button 
                disabled
                size="sm"
                variant="outline"
                className="text-muted-foreground"
              >
                <Download className="mr-2 h-4 w-4" /> 
                Processing...
              </Button>
            )}
            
            {onReset && (
              <Button 
                onClick={onReset}
                variant="outline"
                size="sm"
              >
                New Report
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;


import { useState } from 'react';

export const usePdfFetcher = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfFetching, setIsPdfFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);

  // Helper function to check if string is base64
  const isBase64 = (str: string): boolean => {
    try {
      // Check if it's a data URL with base64
      if (str.startsWith('data:')) {
        return str.includes('base64,');
      }
      // Check if it's just base64 encoded content
      return btoa(atob(str)) === str;
    } catch (error) {
      return false;
    }
  };

  // Helper function to download base64 as PDF
  const downloadBase64AsPdf = (base64String: string, filename: string = 'property-valuation-report.pdf') => {
    try {
      console.log('[PDF FETCHER] 🔄 Starting base64 to PDF download');
      
      let base64Data = base64String;
      let mimeType = 'application/pdf';

      // Handle data URLs
      if (base64String.startsWith('data:')) {
        const [header, data] = base64String.split(',');
        base64Data = data;
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }

      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      
      console.log('[PDF FETCHER] ✅ Base64 PDF download triggered successfully');
      return true;
    } catch (error) {
      console.error('[PDF FETCHER] ❌ Error downloading base64 PDF:', error);
      return false;
    }
  };

  // Function to handle PDF download when user clicks
  const handlePdfDownload = (pdfData: string) => {
    console.log('[PDF FETCHER] 🖱️ PDF download clicked');
    console.log('[PDF FETCHER] PDF data type:', typeof pdfData);
    console.log('[PDF FETCHER] PDF data preview:', pdfData?.substring(0, 100) + '...');

    if (!pdfData) {
      console.warn('[PDF FETCHER] ⚠️ No PDF data available for download');
      return false;
    }

    // Handle base64 format
    if (isBase64(pdfData)) {
      console.log('[PDF FETCHER] 📄 Detected base64 format, converting and downloading');
      return downloadBase64AsPdf(pdfData);
    }
    
    // Handle direct URL format
    console.log('[PDF FETCHER] 🔗 Detected URL format, opening in new tab');
    try {
      // Handle Google Docs URLs
      if (pdfData.includes('docs.google.com')) {
        const downloadUrl = pdfData.includes('/export?') ? pdfData : `${pdfData}/export?format=pdf`;
        window.open(downloadUrl, '_blank');
      } else {
        window.open(pdfData, '_blank');
      }
      return true;
    } catch (error) {
      console.error('[PDF FETCHER] ❌ Error opening PDF URL:', error);
      return false;
    }
  };

  const fetchLatestPdfUrl = async (webhookPdfUrl?: any) => {
    console.log('[PDF FETCHER] Starting PDF fetch with URL:', webhookPdfUrl);
    console.log('[PDF FETCHER] Webhook PDF URL type:', typeof webhookPdfUrl);
    
    setIsPdfFetching(true);
    setPdfUrl(null);
    setFetchProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setFetchProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 600);

    try {
      let actualPdfUrl: string | undefined;
      
      // Handle different PDF URL formats from webhook
      if (webhookPdfUrl) {
        // Handle object format: { "_type": "String", "value": "data:application/pdf;base64,..." }
        if (typeof webhookPdfUrl === 'object' && webhookPdfUrl._type === 'String' && webhookPdfUrl.value) {
          console.log('[PDF FETCHER] ✓ Found PDF URL in object format');
          actualPdfUrl = webhookPdfUrl.value;
        }
        // Handle direct string format
        else if (typeof webhookPdfUrl === 'string') {
          console.log('[PDF FETCHER] ✓ Found PDF URL in string format');
          actualPdfUrl = webhookPdfUrl;
        }
        
        if (actualPdfUrl && actualPdfUrl.length > 0) {
          console.log('[PDF FETCHER] ✓ Processing PDF data:', actualPdfUrl.substring(0, 100) + '...');
          
          clearInterval(progressInterval);
          setFetchProgress(100);
          
          // Store the raw PDF data (base64 or URL) for later download
          setPdfUrl(actualPdfUrl);
          setIsPdfFetching(false);
          
          console.log('[PDF FETCHER] ✅ PDF URL state updated successfully');
          return actualPdfUrl;
        }
      }
      
      console.log('[PDF FETCHER] ❌ No valid PDF URL found, PDF will not be available');
      clearInterval(progressInterval);
      setIsPdfFetching(false);
      return null;
    } catch (error) {
      console.error("[PDF FETCHER] ❌ Error fetching PDF:", error);
      clearInterval(progressInterval);
      setIsPdfFetching(false);
      throw error;
    }
  };

  return {
    pdfUrl,
    isPdfFetching,
    fetchProgress,
    fetchLatestPdfUrl,
    handlePdfDownload
  };
};

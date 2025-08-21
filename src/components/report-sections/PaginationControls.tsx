
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onNextPage,
  onPrevPage
}) => {
  console.log('📄 PaginationControls props:', {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  });

  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  const handlePrevClick = () => {
    console.log('⬅️ Previous page clicked, current page:', currentPage);
    onPrevPage();
  };

  const handleNextClick = () => {
    console.log('➡️ Next page clicked, current page:', currentPage);
    onNextPage();
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <div className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {totalItems} properties
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevClick}
          disabled={currentPage === 0}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-600 px-2">
          Page {currentPage + 1} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextClick}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;

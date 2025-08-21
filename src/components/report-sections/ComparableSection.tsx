
import React, { useState } from 'react';
import PropertyDetailsModal from '../PropertyDetailsModal';
import PropertyCard from './PropertyCard';
import PaginationControls from './PaginationControls';
import { ErrorBoundary } from '../ErrorBoundary';
import { Listing, transformListingForModal } from './utils/propertyDisplayUtils';
import { useToast } from "@/hooks/use-toast";

interface ComparableSectionProps {
  title: string;
  activeListings?: any[];
  recentSales?: any[];
  subjectProperty?: any;
  listings?: Listing[];
  showSoldDate?: boolean;
}

const ComparableSection: React.FC<ComparableSectionProps> = ({ 
  title,
  activeListings,
  recentSales,
  subjectProperty,
  listings,
  showSoldDate = false 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Combine activeListings and recentSales into listings if provided separately
  const combinedListings = listings || [
    ...(activeListings || []),
    ...(recentSales || [])
  ];
  
  console.log(`🏠 ComparableSection "${title}" DETAILED DEBUG:`);
  console.log(`🏠 combinedListings:`, combinedListings);
  console.log(`🏠 combinedListings length:`, combinedListings?.length);
  console.log(`🏠 subjectProperty:`, subjectProperty);

  // Reset currentPage when listings change to prevent out-of-bounds state
  React.useEffect(() => {
    setCurrentPage(0);
  }, [combinedListings]);

  // FIXED: Back to 3 items per page for smaller cards
  const itemsPerPage = 3;
  
  // Enhanced error handling - return early for invalid data
  if (!combinedListings || !Array.isArray(combinedListings)) {
    console.error(`❌ ComparableSection "${title}" - Invalid listings data:`, { 
      combinedListings, 
      type: typeof combinedListings 
    });
    return (
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">{title}</h2>
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
          <p className="font-semibold">Error: Invalid listings data</p>
          <p className="text-sm mt-1">Listings data type: {typeof combinedListings}</p>
        </div>
      </section>
    );
  }

  if (combinedListings.length === 0) {
    console.warn(`⚠️ ComparableSection "${title}" - No listings to display`);
    return (
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">{title}</h2>
        <div className="text-center py-8 text-gray-500">
          No comparable properties available.
        </div>
      </section>
    );
  }

  // Safe pagination calculations with guards
  const totalPages = Math.max(1, Math.ceil(combinedListings.length / itemsPerPage));
  const safeCurrent = Math.min(currentPage, totalPages - 1);
  const currentListings = combinedListings.slice(
    safeCurrent * itemsPerPage, 
    (safeCurrent + 1) * itemsPerPage
  );
  
  console.log(`🏠 ComparableSection "${title}" pagination:`, {
    totalListings: combinedListings.length,
    totalPages,
    currentPage: safeCurrent,
    currentListingsCount: currentListings.length
  });
  
  // Safe pagination functions with guards
  const nextPage = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handlePropertyClick = async (listing: Listing) => {
    console.log('🏠 Property card clicked for Full Report!', {
      address: listing.address,
      id: listing.id,
      subjectProperty: subjectProperty
    });
    
    if (isLoading) {
      console.log('⏳ Modal already loading, ignoring click');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting property transformation...');
      const transformedProperty = transformListingForModal(listing);
      console.log('✅ Property transformed successfully:', transformedProperty);
      
      setSelectedProperty(transformedProperty);
      setIsModalOpen(true);
      
      toast({
        title: "Property details loaded",
        description: "Opening property information...",
      });
      
    } catch (error) {
      console.error('❌ Error opening property modal:', error);
      
      toast({
        title: "Error loading property",
        description: "Sorry, there was an error loading the property details. Please try again.",
        variant: "destructive",
      });
      
      // Reset states on error
      setSelectedProperty(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    console.log('❌ Closing modal');
    try {
      setIsModalOpen(false);
      setSelectedProperty(null);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error closing modal:', error);
      // Force reset even if error occurs
      setIsModalOpen(false);
      setSelectedProperty(null);
      setIsLoading(false);
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop";

  return (
    <>
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-primary mb-4">{title}</h2>
        
        <ErrorBoundary fallback={
          <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
            <p className="font-semibold">Error loading property cards</p>
            <p className="text-sm mt-1">Please refresh the page to try again</p>
          </div>
        }>
          {/* FIXED: Back to grid-cols-3 for 3 cards per row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {currentListings.map((listing, index) => {
              console.log(`🏠 Rendering PropertyCard ${index}:`, listing);
              return (
                <ErrorBoundary key={`${listing.id || 'listing'}-${safeCurrent}-${index}`}>
                  <PropertyCard
                    listing={listing}
                    index={index}
                    currentPage={safeCurrent}
                    showSoldDate={showSoldDate}
                    fallbackImage={fallbackImage}
                    onPropertyClick={handlePropertyClick}
                  />
                </ErrorBoundary>
              );
            })}
          </div>
        </ErrorBoundary>
        
        <PaginationControls
          currentPage={safeCurrent}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={combinedListings.length}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </section>
      
      {selectedProperty && (
        <ErrorBoundary fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <p className="font-semibold text-red-600 mb-2">Error loading property details</p>
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        }>
          <PropertyDetailsModal
            property={selectedProperty}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            subjectProperty={subjectProperty}
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default ComparableSection;

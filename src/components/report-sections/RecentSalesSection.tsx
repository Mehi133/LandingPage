
import React, { useState } from 'react';
import PropertyDetailsModal from '../PropertyDetailsModal';
import PropertyCard from './PropertyCard';
import PaginationControls from './PaginationControls';
import { Listing, transformListingForModal } from './utils/propertyDisplayUtils';

interface RecentSalesSectionProps {
  recentSales: any[];
  subjectProperty?: any;
}

const RecentSalesSection: React.FC<RecentSalesSectionProps> = ({ 
  recentSales,
  subjectProperty
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  console.log('🏠 RecentSalesSection received:', recentSales?.length, 'sales');
  
  if (!recentSales || recentSales.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">Recent Sales</h2>
        <div className="text-center py-8 text-gray-500">
          No recent sales available.
        </div>
      </section>
    );
  }

  // Fixed: Changed from 2 to 3 to match ActiveListingsSection
  const itemsPerPage = 3;
  const totalPages = Math.ceil(recentSales.length / itemsPerPage);
  const currentListings = recentSales.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  const nextPage = () => {
    console.log('📄 Recent sales next page clicked');
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    console.log('📄 Recent sales prev page clicked');
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handlePropertyClick = (listing: Listing) => {
    console.log('🏠 Recent sale clicked:', listing.address);
    try {
      const transformedProperty = transformListingForModal(listing);
      setSelectedProperty(transformedProperty);
      setIsModalOpen(true);
    } catch (error) {
      console.error('❌ Error opening property modal:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop";

  return (
    <>
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-primary mb-4">Recent Sales ({recentSales.length})</h2>
        
        {/* Fixed: Changed to match ActiveListingsSection grid layout exactly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentListings.map((listing, index) => (
            <PropertyCard
              key={`recent-${listing.id || 'listing'}-${currentPage}-${index}`}
              listing={listing}
              index={index}
              currentPage={currentPage}
              showSoldDate={true}
              fallbackImage={fallbackImage}
              onPropertyClick={handlePropertyClick}
            />
          ))}
        </div>
        
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={recentSales.length}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </section>
      
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          subjectProperty={subjectProperty}
        />
      )}
    </>
  );
};

export default RecentSalesSection;

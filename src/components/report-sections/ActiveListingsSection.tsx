
import React, { useState } from 'react';
import PropertyDetailsModal from '../PropertyDetailsModal';
import PropertyCard from './PropertyCard';
import PaginationControls from './PaginationControls';
import { Listing, transformListingForModal } from './utils/propertyDisplayUtils';

interface ActiveListingsSectionProps {
  activeListings: any[];
  subjectProperty?: any;
}

const ActiveListingsSection: React.FC<ActiveListingsSectionProps> = ({ 
  activeListings,
  subjectProperty
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  console.log('🏠 ActiveListingsSection received:', activeListings?.length, 'listings');
  
  if (!activeListings || activeListings.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">Active Listings</h2>
        <div className="text-center py-8 text-gray-500">
          No active listings available.
        </div>
      </section>
    );
  }

  const itemsPerPage = 3;
  const totalPages = Math.ceil(activeListings.length / itemsPerPage);
  const currentListings = activeListings.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  const nextPage = () => {
    console.log('📄 Active listings next page clicked');
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    console.log('📄 Active listings prev page clicked');
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handlePropertyClick = (listing: Listing) => {
    console.log('🏠 Active listing clicked:', listing.address);
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
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">Active Listings ({activeListings.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentListings.map((listing, index) => (
            <PropertyCard
              key={`active-${listing.id || 'listing'}-${currentPage}-${index}`}
              listing={listing}
              index={index}
              currentPage={currentPage}
              showSoldDate={false}
              fallbackImage={fallbackImage}
              onPropertyClick={handlePropertyClick}
            />
          ))}
        </div>
        
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={activeListings.length}
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

export default ActiveListingsSection;

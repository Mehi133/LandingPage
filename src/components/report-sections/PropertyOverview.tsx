
import React from 'react';
import PropertyImageCarousel from '../PropertyImageCarousel';
import PropertySnapshot from './PropertySnapshot';
import PropertyMapPanel from './PropertyMapPanel';
import NearbyAmenities from './NearbyAmenities';
import SchoolsSection from './SchoolsSection';
import EnhancedPriceHistoryChart from '../property-modal/EnhancedPriceHistoryChart';
import EnhancedTaxHistoryChart from '../property-modal/EnhancedTaxHistoryChart';

interface PropertyOverviewProps {
  subjectProperty?: any;
  userEnteredAddress?: string;
  activeListings?: any[];
  recentSales?: any[];
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({ 
  subjectProperty, 
  userEnteredAddress,
  activeListings = [],
  recentSales = []
}) => {
  console.log('🏠 PropertyOverview - Full Subject Property Data:', subjectProperty);
  console.log('🏠 PropertyOverview - Raw images data:', subjectProperty?.images);
  console.log('🏠 PropertyOverview - Type of images:', typeof subjectProperty?.images);
  console.log('🏠 PropertyOverview - Is images array?', Array.isArray(subjectProperty?.images));
  console.log('🏠 PropertyOverview - Images length:', subjectProperty?.images?.length);

  if (!subjectProperty || Object.keys(subjectProperty).length === 0) {
    console.log('🏠 No subject property data available');
    return (
      <div className="report-container px-6 py-8">
        <div className="text-center py-16 text-muted-foreground">
          <p>No property data available.</p>
        </div>
      </div>
    );
  }

  // Let's check ALL possible image fields for debugging
  console.log('🏠 DEBUG - All possible image fields:', {
    images: subjectProperty.images,
    ImgScr: subjectProperty.ImgScr,
    imgScr: subjectProperty.imgScr,
    imgSrc: subjectProperty.imgSrc,
    imageUrls: subjectProperty.imageUrls,
    propertyImages: subjectProperty.propertyImages
  });

  // Use the already-parsed images array directly
  let propertyImages = [];
  
  if (subjectProperty.images && Array.isArray(subjectProperty.images) && subjectProperty.images.length > 0) {
    propertyImages = subjectProperty.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    console.log('🏠 Using parsed images array:', propertyImages);
  } else {
    console.log('🏠 No valid images array found, checking raw fields...');
    
    // Emergency fallback: try to parse from raw fields if parsed array is empty
    const rawImageField = subjectProperty.ImgScr || subjectProperty.imgScr || subjectProperty.imgSrc;
    if (rawImageField && typeof rawImageField === 'string') {
      propertyImages = rawImageField.split(',').map(url => url.trim()).filter(url => {
        if (!url || url === 'undefined' || url === 'null') return false;
        return url.startsWith('http') || url.startsWith('/');
      });
      console.log('🏠 Emergency fallback - parsed from raw field:', propertyImages);
    } else {
      console.log('🏠 No raw image fields available either');
    }
  }

  console.log('🏠 Final images for carousel:', propertyImages);
  console.log('🏠 Images count:', propertyImages.length);

  const priceHistory = subjectProperty?.priceHistory || [];
  
  // Enhanced tax history with 2025 data
  let taxHistory = subjectProperty?.taxHistory || [];
  
  // Add 2025 data from subjectProperty if available
  console.log('🧾 Checking for 2025 tax data in subjectProperty:', {
    assessedValue: subjectProperty?.assessedValue,
    annualTaxes: subjectProperty?.annualTaxes,
    financials: subjectProperty?.financials
  });
  
  if (subjectProperty?.assessedValue && subjectProperty?.annualTaxes) {
    const taxData2025 = {
      year: 2025,
      assessedValue: subjectProperty.assessedValue,
      taxPaid: subjectProperty.annualTaxes
    };
    console.log('🧾 Adding 2025 tax data:', taxData2025);
    taxHistory = [taxData2025, ...taxHistory];
  }
  
  // Also check financials object for 2025 data
  if (subjectProperty?.financials?.assessedValue && subjectProperty?.financials?.annualTaxes) {
    const financialsTaxData2025 = {
      year: 2025,
      assessedValue: subjectProperty.financials.assessedValue,
      taxPaid: subjectProperty.financials.annualTaxes
    };
    console.log('🧾 Adding 2025 tax data from financials:', financialsTaxData2025);
    // Only add if we haven't already added 2025 data
    if (!taxHistory.some(item => item.year === 2025)) {
      taxHistory = [financialsTaxData2025, ...taxHistory];
    }
  }
  
  const schools = subjectProperty?.schools || [];

  // Additional features for the new column
  const additionalFeatures = Object.entries(subjectProperty || {})
    .filter(([key, value]) => {
      // Filter out basic fields already shown and system fields
      const excludeKeys = ['address', 'beds', 'baths', 'sqft', 'lotSize', 'yearBuilt', 'propertyType', 'garage', 
                          'bedrooms', 'bathrooms', 'price', 'images', 'priceHistory', 'taxHistory', 'schools', 
                          'climate', 'features', 'ImgScr', 'imgScr', 'imgSrc', 'assessedValue', 'annualTaxes'];
      return !excludeKeys.includes(key) && value !== 'N/A' && value !== null && value !== undefined && value !== '' && typeof value !== 'object';
    })
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: String(value)
    }));

  return (
    <div className="report-container px-6 py-8">
      <div className="space-y-8">
        
        {/* Main Layout: 3-Column Grid */}
        <div className="report-grid">
          {/* Left Sidebar: Property Snapshot */}
          <div className="report-sidebar">
            <PropertySnapshot 
              subjectProperty={subjectProperty}
              userEnteredAddress={userEnteredAddress}
            />
          </div>
          
          {/* Main Content: Images */}
          <div className="report-main">
            <div className="w-full rounded-lg overflow-hidden border border-border bg-muted/10" style={{ height: '400px', minHeight: '400px' }}>
              <div className="w-full h-full">
                <PropertyImageCarousel
                  images={propertyImages}
                  address={subjectProperty?.address || userEnteredAddress || 'Property'}
                  fallbackImage="/placeholder.svg"
                />
              </div>
            </div>
            
            {/* Additional Features Column beneath images */}
            {additionalFeatures.length > 0 && (
              <div className="mt-6 bg-card rounded-lg border border-border p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Additional Features</h4>
                <div className="space-y-3">
                  {additionalFeatures.map((item, index) => (
                    <div key={item.label} className={`flex justify-between items-center py-2 ${
                      index !== additionalFeatures.length - 1 ? 'border-b border-border/50' : ''
                    }`}>
                      <span className="text-sm text-muted-foreground font-medium">
                        {item.label}
                      </span>
                      <span className="text-sm text-foreground font-semibold text-right max-w-[60%] break-words">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar: Map & Amenities */}
          <div className="report-aside space-y-6">
            {/* Property Map */}
            <div className="w-full rounded-lg overflow-hidden border border-border bg-muted/10" style={{ height: '400px', minHeight: '400px' }}>
              <div className="w-full h-full">
                <PropertyMapPanel 
                  subjectProperty={subjectProperty}
                  userEnteredAddress={userEnteredAddress}
                />
              </div>
            </div>
            
            {/* Nearby Amenities - in the same section */}
            <NearbyAmenities 
              subjectProperty={subjectProperty}
              userEnteredAddress={userEnteredAddress}
            />
          </div>
        </div>

        {/* Full Width Data Sections */}
        <div className="space-y-12">
          {/* Price History Section */}
          {priceHistory.length > 0 && (
            <EnhancedPriceHistoryChart data={priceHistory} />
          )}

          {/* Tax History Section */}
          {taxHistory.length > 0 && (
            <EnhancedTaxHistoryChart data={taxHistory} />
          )}

          {/* Schools Section */}
          {schools.length > 0 && (
            <SchoolsSection 
              schools={schools}
              subjectProperty={subjectProperty}
              userEnteredAddress={userEnteredAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;

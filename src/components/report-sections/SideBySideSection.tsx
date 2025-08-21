
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import SubjectPropertyCard from './SubjectPropertyCard';
import PropertyCard from './PropertyCard';
import ComparisonTable from './ComparisonTable';

interface SideBySideSectionProps {
  subjectProperty: any;
  activeListings: any[];
  recentSales: any[];
  onPropertyClick: (property: any) => void;
}

const SideBySideSection: React.FC<SideBySideSectionProps> = ({
  subjectProperty,
  activeListings,
  recentSales,
  onPropertyClick
}) => {
  console.log('🏠 SideBySideSection rendering:', { subjectProperty, activeListings, recentSales });

  // Pagination state for each section
  const [activeListingsPage, setActiveListingsPage] = useState(0);
  const [recentSalesPage, setRecentSalesPage] = useState(0);
  
  const fallbackImage = "/placeholder.svg";
  const itemsPerPage = 3; // Changed from 4 to 3

  // Pagination calculations for Active Listings
  const activeListingsTotalPages = Math.ceil((activeListings?.length || 0) / itemsPerPage);
  const currentActiveListings = activeListings?.slice(
    activeListingsPage * itemsPerPage,
    (activeListingsPage + 1) * itemsPerPage
  ) || [];

  // Pagination calculations for Recent Sales
  const recentSalesTotalPages = Math.ceil((recentSales?.length || 0) / itemsPerPage);
  const currentRecentSales = recentSales?.slice(
    recentSalesPage * itemsPerPage,
    (recentSalesPage + 1) * itemsPerPage
  ) || [];

  // Pagination handlers for Active Listings
  const nextActiveListingsPage = () => {
    if (activeListingsPage < activeListingsTotalPages - 1) {
      setActiveListingsPage(activeListingsPage + 1);
    }
  };

  const prevActiveListingsPage = () => {
    if (activeListingsPage > 0) {
      setActiveListingsPage(activeListingsPage - 1);
    }
  };

  // Pagination handlers for Recent Sales
  const nextRecentSalesPage = () => {
    if (recentSalesPage < recentSalesTotalPages - 1) {
      setRecentSalesPage(recentSalesPage + 1);
    }
  };

  const prevRecentSalesPage = () => {
    if (recentSalesPage > 0) {
      setRecentSalesPage(recentSalesPage - 1);
    }
  };

  // Enhanced property click handler
  const handlePropertyClick = (property: any) => {
    console.log('🏠 SideBySideSection - Property clicked:', property);
    onPropertyClick(property);
  };

  return (
    <div className="space-y-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <GitCompare className="h-8 w-8 text-primary" />
          Side by Side Comparison
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Compare the subject property directly with active listings and recent sales in the area.
        </p>
      </div>

      {/* Active Listings Row */}
      {activeListings && activeListings.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-primary">
                  Active Listings Comparison
                </CardTitle>
                {activeListingsTotalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevActiveListingsPage}
                      disabled={activeListingsPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {activeListingsPage + 1} of {activeListingsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextActiveListingsPage}
                      disabled={activeListingsPage >= activeListingsTotalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Subject Property */}
                <div className="lg:col-span-1">
                  <div className="transform scale-105 origin-center">
                    <SubjectPropertyCard 
                      subjectProperty={subjectProperty}
                      fallbackImage={fallbackImage}
                    />
                  </div>
                </div>
                
                {/* Comparable Active Listings - 3 columns now */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentActiveListings.map((listing, index) => (
                      <div key={listing.id || `active-${activeListingsPage}-${index}`} className="h-full transform hover:scale-102 transition-transform duration-200">
                        <PropertyCard
                          listing={listing}
                          index={index}
                          currentPage={activeListingsPage}
                          showSoldDate={false}
                          fallbackImage={fallbackImage}
                          onPropertyClick={handlePropertyClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Comparison Table for Current Active Listings */}
              <div className="mt-8">
                <ComparisonTable 
                  subjectProperty={subjectProperty}
                  comparableProperties={currentActiveListings}
                  title="Active Listings"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sales Row */}
      {recentSales && recentSales.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-primary">
                  Recent Sales Comparison
                </CardTitle>
                {recentSalesTotalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevRecentSalesPage}
                      disabled={recentSalesPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {recentSalesPage + 1} of {recentSalesTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextRecentSalesPage}
                      disabled={recentSalesPage >= recentSalesTotalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Subject Property */}
                <div className="lg:col-span-1">
                  <div className="transform scale-105 origin-center">
                    <SubjectPropertyCard 
                      subjectProperty={subjectProperty}
                      fallbackImage={fallbackImage}
                    />
                  </div>
                </div>
                
                {/* Comparable Recent Sales - 3 columns now */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentRecentSales.map((sale, index) => (
                      <div key={sale.id || `sale-${recentSalesPage}-${index}`} className="h-full transform hover:scale-102 transition-transform duration-200">
                        <PropertyCard
                          listing={sale}
                          index={index}
                          currentPage={recentSalesPage}
                          showSoldDate={true}
                          fallbackImage={fallbackImage}
                          onPropertyClick={handlePropertyClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Comparison Table for Current Recent Sales */}
              <div className="mt-8">
                <ComparisonTable 
                  subjectProperty={subjectProperty}
                  comparableProperties={currentRecentSales}
                  title="Recent Sales"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data Message */}
      {(!activeListings || activeListings.length === 0) && (!recentSales || recentSales.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Comparable Properties Found</h3>
            <p className="text-muted-foreground">
              There are no active listings or recent sales available for comparison at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SideBySideSection;

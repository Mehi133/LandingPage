
import React, { useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportImage {
  src: string;
  alt: string;
  label: string;
  description: string;
}

const reportImages: ReportImage[] = [
  {
    src: "/lovable-uploads/47adaf86-4e7a-40c0-94c8-ece8d5f9e93f.png",
    alt: "Property Details - Generate Report",
    label: "Property Details",
    description: "Complete property information with generate report button"
  },
  {
    src: "/lovable-uploads/fd002687-1abd-412b-b6d5-7bb129d0328c.png",
    alt: "Property Details - Editable State",
    label: "Property Details",
    description: "Editable property data for accurate valuations"
  },
  {
    src: "/lovable-uploads/f3eb6059-5205-427d-b7bf-b90f4bb8cc3c.png",
    alt: "Overview - Property & Location",
    label: "Overview",
    description: "Property overview with images and interactive map"
  },
  {
    src: "/lovable-uploads/60f98592-a4af-44af-aef1-4ad94f9ca9e3.png",
    alt: "Overview - Price Trends & Events",
    label: "Overview",
    description: "Price history trends and notable market events"
  },
  {
    src: "/lovable-uploads/60f98592-a4af-44af-aef1-4ad94f9ca9e3.png",
    alt: "Overview - Tax History Analysis",
    label: "Overview", 
    description: "Tax history with KPIs and detailed charts"
  },
  {
    src: "/lovable-uploads/7ea88b43-896b-422d-8136-84d1229a2bef.png",
    alt: "Overview - School Information",
    label: "Overview",
    description: "Local schools with ratings and interactive map"
  },
  {
    src: "/lovable-uploads/34bb4c8f-75fd-480d-b9b7-5bdd1a017875.png",
    alt: "Market Conditions - Trends & KPIs",
    label: "Market",
    description: "Market overview with trend analysis and key metrics"
  },
  {
    src: "/lovable-uploads/f590c402-0408-4bb6-b1c1-63104ec78aa2.png",
    alt: "Market Conditions - Analysis Deep Dive",
    label: "Market",
    description: "Square footage, bedroom, and property type analysis"
  },
  {
    src: "/lovable-uploads/481a51a9-fde1-46d4-801f-dc9cbebcea49.png",
    alt: "Comparables - Sales & Map",
    label: "Comparables",
    description: "Active listings and recent sales with map visualization"
  },
  {
    src: "/lovable-uploads/1c944208-9d76-4ed7-adc5-ae1e4229cfd2.png",
    alt: "Side-by-Side Comparison",
    label: "Side-by-Side",
    description: "Direct property comparisons and analysis tables"
  }
];

const ReportPreviewGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const openLightbox = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const newIndex = direction === 'prev' 
      ? (selectedImage - 1 + reportImages.length) % reportImages.length
      : (selectedImage + 1) % reportImages.length;
    
    setSelectedImage(newIndex);
  }, [selectedImage]);

  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  }, []);

  return (
    <>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Professional Property Reports
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the comprehensive analysis and insights included in every Valora report
            </p>
          </div>
          
          {/* Masonry-style grid for better visual hierarchy */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {reportImages.map((image, index) => (
              <Card 
                key={index} 
                className="group break-inside-avoid cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-white border-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden">
                  {/* Label pill */}
                  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {image.label}
                  </div>
                  
                  {/* Professional image container with aspect ratio */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <picture>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                        style={{
                          filter: 'contrast(1.03) brightness(1.01) saturate(1.02)',
                        }}
                        loading={index < 3 ? "eager" : "lazy"}
                        onLoad={() => handleImageLoad(index)}
                      />
                    </picture>
                    
                    {/* Loading state */}
                    {!imageLoaded[index] && (
                      <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                    )}
                    
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {image.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl w-full h-[95vh] p-0 border-0 bg-white rounded-3xl overflow-hidden">
          <div className="relative w-full h-full bg-white">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-30 bg-white/90 hover:bg-white border border-gray-200 shadow-lg rounded-full w-12 h-12"
              onClick={closeLightbox}
            >
              <X className="h-5 w-5 text-gray-700" />
            </Button>
            
            {selectedImage !== null && (
              <>
                {/* Navigation buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white border border-gray-200 shadow-lg rounded-full w-12 h-12"
                  onClick={() => navigateLightbox('prev')}
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white border border-gray-200 shadow-lg rounded-full w-12 h-12"
                  onClick={() => navigateLightbox('next')}
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </Button>
                
                {/* Main image container */}
                <div className="w-full h-full flex items-center justify-center p-12 pt-20 pb-28">
                  <div className="max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={reportImages[selectedImage].src}
                      alt={reportImages[selectedImage].alt}
                      className="max-w-full max-h-full object-contain"
                      style={{
                        filter: 'contrast(1.02) brightness(1.01)',
                      }}
                    />
                  </div>
                </div>
                
                {/* Image info bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-6">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                          {reportImages[selectedImage].label}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm max-w-2xl">
                        {reportImages[selectedImage].description}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {selectedImage + 1} / {reportImages.length}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportPreviewGallery;

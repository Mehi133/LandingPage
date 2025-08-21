
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PropertyImageCarouselProps {
  images: string[];
  address: string;
  fallbackImage: string;
  onImageClick?: () => void;
}

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({ 
  images, 
  address, 
  fallbackImage,
  onImageClick 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  console.log('🖼️ PropertyImageCarousel - Received images prop:', images);
  console.log('🖼️ PropertyImageCarousel - Images type:', typeof images);
  console.log('🖼️ PropertyImageCarousel - Is array:', Array.isArray(images));
  console.log('🖼️ PropertyImageCarousel - Images length:', images?.length);
  console.log('🖼️ PropertyImageCarousel - Individual images:', images?.map((img, i) => `${i}: ${img}`));
  
  // Validate and filter images
  const validImages = React.useMemo(() => {
    if (!images || !Array.isArray(images)) {
      console.log('🖼️ No valid images array provided');
      return [];
    }
    
    const filtered = images.filter((img, index) => {
      console.log(`🖼️ Validating image ${index}:`, img);
      
      if (!img || typeof img !== 'string') {
        console.log(`🖼️ Invalid image ${index}: not a string`);
        return false;
      }
      
      if (img === 'undefined' || img === 'null' || img.trim() === '') {
        console.log(`🖼️ Invalid image ${index}: empty or null`);
        return false;
      }
      
      // Check if it's a valid URL
      const isValidUrl = img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/') || img.startsWith('data:');
      console.log(`🖼️ Image ${index} URL validation:`, isValidUrl);
      
      return isValidUrl;
    });
    
    console.log('🖼️ Final valid images:', filtered);
    return filtered;
  }, [images]);
  
  // Determine what to display
  const hasValidImages = validImages.length > 0;
  const displayImages = hasValidImages ? validImages : [fallbackImage];
  const hasMultipleImages = displayImages.length > 1;
  
  console.log('🖼️ Display state:', {
    hasValidImages,
    displayImages,
    hasMultipleImages,
    currentIndex: currentImageIndex
  });
  
  const nextImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };
  
  const prevImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick();
    }
  };
  
  const currentImage = displayImages[currentImageIndex];
  console.log('🖼️ Rendering image:', currentImage);
  
  return (
    <div className="relative w-full h-full group bg-muted/5">
      <img 
        src={currentImage}
        alt={hasValidImages ? `Property at ${address} - Image ${currentImageIndex + 1}` : 'Property placeholder'}
        className="object-cover w-full h-full cursor-pointer"
        onError={(e) => {
          console.log('🖼️ Image failed to load:', currentImage);
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackImage && hasValidImages) {
            console.log('🖼️ Switching to fallback image');
            target.src = fallbackImage;
          }
        }}
        onLoad={() => {
          console.log('🖼️ Image loaded successfully:', currentImage);
        }}
        onClick={handleImageClick}
      />
      
      {/* Navigation arrows - only show if there are multiple valid images */}
      {hasMultipleImages && hasValidImages && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-border opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-border opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        </>
      )}
      
      {/* Status indicator */}
      {!hasValidImages && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground text-sm font-medium">No images available</p>
        </div>
      )}
      
      {hasValidImages && (
        <div className="absolute top-2 left-2 bg-green-600/80 text-white text-xs px-2 py-1 rounded">
          {validImages.length} image{validImages.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default PropertyImageCarousel;

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  images: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesChange, images }) => {
  const [uploading, setUploading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Upload a single file to Supabase Storage
  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `property-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image file.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 5MB.`;
    }
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast({
        variant: "destructive",
        title: "Upload Limit Reached",
        description: `You can only upload up to ${MAX_IMAGES} photos.`,
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const fileNames = filesToProcess.map(f => f.name);
    
    setUploading(true);
    setProcessingFiles(fileNames);

    try {
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate all files first
      for (const file of filesToProcess) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      // Show validation errors
      if (errors.length > 0) {
        errors.forEach(error => {
          toast({
            variant: "destructive",
            title: "Invalid File",
            description: error,
          });
        });
      }

      if (validFiles.length === 0) {
        return;
      }

      // Upload all valid files to Supabase Storage
      const uploadPromises = validFiles.map(file => uploadFileToStorage(file));
      const newImageUrls = await Promise.all(uploadPromises);

      // Update images state with new URLs
      const updatedImages = [...images, ...newImageUrls];
      onImagesChange(updatedImages);

      toast({
        title: "Upload Successful",
        description: `${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} uploaded successfully.`,
      });

    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload some files. Please try again.",
      });
    } finally {
      setUploading(false);
      setProcessingFiles([]);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract file path from URL to delete from storage
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get 'property-photos/filename'
      
      // Delete from Supabase Storage
      await supabase.storage
        .from('property-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      // Continue with removing from UI even if storage deletion fails
    }

    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    
    toast({
      title: "Photo Removed",
      description: "Photo has been removed from your upload.",
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const remainingSlots = MAX_IMAGES - images.length;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload Property Photos</h3>
        <p className="text-sm text-secondary-foreground mb-2">
          Add up to {MAX_IMAGES} photos to help us provide a more accurate valuation (optional)
        </p>
        <p className="text-xs text-secondary-foreground">
          {images.length} of {MAX_IMAGES} photos uploaded • {remainingSlots} slots remaining
        </p>
      </div>

      {/* Upload Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileSelect}
          disabled={uploading || remainingSlots <= 0}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {remainingSlots > 0 ? `Choose Photos (${remainingSlots} remaining)` : 'Maximum Photos Reached'}
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Processing Status */}
      {processingFiles.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-secondary-foreground">
            Uploading: {processingFiles.join(', ')}
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded">
                  <img
                    src={imageUrl}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card className="border-dashed border-2 hover:bg-accent/50 transition-colors cursor-pointer" onClick={triggerFileSelect}>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-secondary-foreground mx-auto mb-4" />
            <p className="text-secondary-foreground">
              No photos uploaded yet. Click "Choose Photos" to add some.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;

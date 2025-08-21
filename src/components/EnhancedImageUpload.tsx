import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface EnhancedImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  images: string[];
}
const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  onImagesChange,
  images
}) => {
  const [uploading, setUploading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Upload a single file to Supabase Storage
  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `property-photos/${fileName}`;
    const {
      error: uploadError
    } = await supabase.storage.from('property-images').upload(filePath, file);
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const {
      data: {
        publicUrl
      }
    } = supabase.storage.from('property-images').getPublicUrl(filePath);
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
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setUploading(true);
    setProcessingFiles(fileArray.map(f => f.name));
    try {
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate all files first
      for (const file of fileArray) {
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
            description: error
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
        description: `${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} uploaded successfully.`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload some files. Please try again."
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
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(e.dataTransfer.files);
    }
  }, [images, onImagesChange]);
  const removeImage = async (index: number) => {
    const imageUrl = images[index];

    // Extract file path from URL to delete from storage
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get 'property-photos/filename'

      // Delete from Supabase Storage
      await supabase.storage.from('property-images').remove([filePath]);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      // Continue with removing from UI even if storage deletion fails
    }
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    toast({
      title: "Photo Removed",
      description: "Photo has been removed from your upload."
    });
  };
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  return <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload Property Photos</h3>
        <p className="text-sm text-secondary-foreground mb-2">
          Add photos to help us provide a more accurate valuation (optional)
        </p>
        
        <p className="text-xs text-secondary-foreground">
          {images.length} photo{images.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {/* Upload Button */}
      <div className="flex justify-center">
        <Button type="button" variant="outline" onClick={triggerFileSelect} disabled={uploading} className="flex items-center gap-2">
          {uploading ? <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </> : <>
              <Upload className="h-4 w-4" />
              Choose Photos
            </>}
        </Button>
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Drag and Drop Zone */}
      <Card className={`border-dashed border-2 transition-colors cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-accent/50'}`} onClick={triggerFileSelect} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        <CardContent className="p-8 text-center">
          <ImageIcon className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-secondary-foreground'}`} />
          {dragActive ? <p className="text-primary font-medium">Drop your images here</p> : <>
              <p className="text-secondary-foreground mb-2">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-secondary-foreground">
                PNG, JPG up to 5MB each
              </p>
            </>}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {processingFiles.length > 0 && <div className="text-center">
          <p className="text-sm text-secondary-foreground">
            Uploading: {processingFiles.join(', ')}
          </p>
        </div>}

      {/* Image Preview Grid */}
      {images.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {images.map((imageUrl, index) => <Card key={index} className="relative">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded">
                  <img src={imageUrl} alt={`Property photo ${index + 1}`} className="w-full h-full object-cover" />
                  <Button type="button" variant="destructive" size="sm" className="absolute top-1 right-1 h-6 w-6 rounded-full p-0" onClick={() => removeImage(index)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
};
export default EnhancedImageUpload;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ValuationForm from './ValuationForm';
import EnhancedImageUpload from './EnhancedImageUpload';

interface CenteredValuationFormProps {
  userType: 'buyer' | 'seller';
  onSuccess: (data: any, address: any) => void;
  onLoading: (isLoading: boolean) => void;
  userData?: { fullName: string; email: string } | null;
}

const CenteredValuationForm: React.FC<CenteredValuationFormProps> = ({
  userType,
  onSuccess,
  onLoading,
  userData
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleSuccess = (data: any, address: any) => {
    // Pass uploaded images and user data along with other data
    const enhancedData = {
      ...data,
      userType,
      imageUrls: uploadedImages,
      userData: userData
    };
    onSuccess(enhancedData, address);
  };

  const handleImagesChange = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Main Form Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Get Property Valuation
            </CardTitle>
            <p className="text-secondary-foreground">
              Get market insights and valuation data for any property.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Image Upload Section - Now First */}
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold">Property Photos</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {userType === 'seller' 
                      ? "📸 If you're selling your home, upload photos to improve the valuation accuracy and get better insights." 
                      : "ℹ️ If you're buying, photos aren't needed - just enter the address below to get started."}
                  </p>
                </div>
              </div>
              <EnhancedImageUpload
                onImagesChange={handleImagesChange}
                images={uploadedImages}
              />
            </div>

            {/* Address Input Section - Now Below Photos */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-center">Property Address</h3>
              
              {/* Address Format Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Please enter the address in the following format:
                </p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>Single Family Residence:</strong> Address, City, State Zip Code 
                    <br />
                    <span className="text-blue-600 italic">eg. 123 Main Street, New York, NY 07008</span>
                  </p>
                  <p>
                    <strong>Condo or Apartment:</strong> Address APTNumber, City, State Zip Code 
                    <br />
                    <span className="text-blue-600 italic">eg. 123 Main Street APT123, New York, NY 07008</span>
                  </p>
                </div>
              </div>

              <ValuationForm
                onSuccess={handleSuccess}
                onLoading={onLoading}
                userType={userType}
                imageUrls={uploadedImages}
                userData={userData}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CenteredValuationForm;

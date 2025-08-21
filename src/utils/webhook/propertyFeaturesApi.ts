
import { PropertyFeatures } from './types';

const WEBHOOK_URL = "https://mehiverseai.app.n8n.cloud/webhook/d8ecfb8c-8619-435d-8f0a-569426a49b33";

export interface PropertyDataRequest {
  userType: 'buyer' | 'seller';
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  imageUrls?: string[];
  propertyFeatures?: PropertyFeatures;
  userData?: { fullName: string; email: string } | null;
  [key: string]: any;
}

/**
 * Send initial property data request to webhook
 */
export const sendWebhookRequest = async (editableFields: string, propertyData: PropertyDataRequest) => {
  console.log('[WEBHOOK API] ======= SENDING INITIAL PROPERTY REQUEST =======');
  console.log('[WEBHOOK API] Property data:', propertyData);
  console.log('[WEBHOOK API] User type:', propertyData.userType);
  console.log('[WEBHOOK API] Image URLs count:', propertyData.imageUrls?.length || 0);
  console.log('[WEBHOOK API] User data:', propertyData.userData);
  console.log('[WEBHOOK API] New n8n webhook URL:', WEBHOOK_URL);
  
  const requestPayload = {
    editableFields: editableFields || "",
    // Send address components separately as originally designed
    userType: propertyData.userType,
    streetAddress: propertyData.streetAddress,
    city: propertyData.city,
    state: propertyData.state,
    zipCode: propertyData.zipCode,
    imageUrls: propertyData.imageUrls || [],
    userData: propertyData.userData || null
  };

  console.log('[WEBHOOK API] Full request payload:', requestPayload);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WEBHOOK API] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('[WEBHOOK API] SUCCESS: Received response:', responseData);
    console.log('[WEBHOOK API] Response keys:', Object.keys(responseData));
    
    // Enhanced logging for user type and image URLs in response
    if (responseData.userType) {
      console.log('[WEBHOOK API] Response includes user type:', responseData.userType);
    }
    if (responseData.imageUrls) {
      console.log('[WEBHOOK API] Response includes image URLs:', responseData.imageUrls.length);
    }
    if (responseData.userData) {
      console.log('[WEBHOOK API] Response includes user data:', responseData.userData);
    }
    
    console.log('[WEBHOOK API] ======= END INITIAL PROPERTY REQUEST =======');
    return responseData;
    
  } catch (error) {
    console.error('[WEBHOOK API] ERROR in sendWebhookRequest:', error);
    console.error('[WEBHOOK API] Request payload that failed:', requestPayload);
    throw error;
  }
};

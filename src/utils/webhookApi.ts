import { WebhookPropertyData, WebhookResponse } from "@/utils/webhook/types";

export const sendWebhookRequest = async (propertyData: WebhookPropertyData): Promise<WebhookResponse> => {
  console.log('[WEBHOOK API] ======= SENDING INITIAL PROPERTY REQUEST =======');
  console.log('[WEBHOOK API] Property data:', propertyData);
  
  const webhookUrl = 'https://mehiverseai.app.n8n.cloud/webhook/d8ecfb8c-8619-435d-8f0a-569426a49b33';
  console.log('[WEBHOOK API] Webhook URL:', webhookUrl);
  
  const payload = {
    ...propertyData,
    timestamp: new Date().toISOString()
  };
  
  console.log('[WEBHOOK API] Request payload:', payload);
  console.log('[WEBHOOK API] Address components:');
  console.log('[WEBHOOK API] - streetAddress:', payload.streetAddress);
  console.log('[WEBHOOK API] - city:', payload.city);
  console.log('[WEBHOOK API] - state:', payload.state);
  console.log('[WEBHOOK API] - zipCode:', payload.zipCode);
  console.log('[WEBHOOK API] - userData:', payload.userData);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[WEBHOOK API] Response status:', response.status);
    console.log('[WEBHOOK API] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('[WEBHOOK API] Response text:', responseText);
    console.log('[WEBHOOK API] Response length:', responseText.length);
    
    // Check for trial limit message in plain text response
    if (responseText.includes("User already used up their trial reports")) {
      console.log('[WEBHOOK API] Trial limit detected in plain text response');
      return {
        body: responseText,
        trialLimitReached: true
      };
    }
    
    // Try to parse as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
      console.log('[WEBHOOK API] Successfully parsed JSON response');
    } catch (parseError) {
      console.error('[WEBHOOK API] JSON parsing failed:', parseError);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
    
    if (!response.ok) {
      console.error('[WEBHOOK API] Request failed with status:', response.status);
      throw new Error(`Webhook request failed with status ${response.status}`);
    }
    
    return jsonData;
  } catch (error) {
    console.error('[WEBHOOK API] Request failed:', error);
    console.error('[WEBHOOK API] Failed payload:', payload);
    throw error;
  }
};

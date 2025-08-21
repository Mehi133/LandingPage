
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal, Loader2 } from "lucide-react";
import { sendWebhookRequest } from "@/utils/webhookApi";
import { loadGoogleMapsAPI } from '@/lib/googleMapsLoader';

interface ValuationFormProps {
  onSuccess: (data: any, address: any) => void;
  onLoading: (isLoading: boolean) => void;
  userType?: 'buyer' | 'seller';
  imageUrls?: string[];
  userData?: { fullName: string; email: string } | null;
}

const ValuationForm: React.FC<ValuationFormProps> = ({
  onSuccess,
  onLoading,
  userType = 'buyer',
  imageUrls = [],
  userData
}) => {
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);
  const lastPlaceRef = useRef<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        const google = await loadGoogleMapsAPI();
        if (autocompleteInputRef.current && !autocompleteInstanceRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
            types: ['address'],
            componentRestrictions: {
              country: 'us'
            }
          });
          autocompleteInstanceRef.current = autocomplete;
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            lastPlaceRef.current = place;
            if (place && place.formatted_address) {
              setAddress(place.formatted_address);
            } else if (place && place.name) {
              setAddress(place.name);
            }
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps for Autocomplete:", error);
        toast({
          variant: "destructive",
          title: "Autocomplete Error",
          description: "Could not load address suggestions. Please type the address manually."
        });
      }
    };
    initAutocomplete();
    return () => {
      if (autocompleteInstanceRef.current) {
        // Cleanup handled by React unmounting
      }
    };
  }, [toast]);

  const parseAddress = (fullAddress: string) => {
    console.log('[ADDRESS PARSE] Starting address parsing for:', fullAddress);

    // Remove USA suffix
    const cleanedAddress = fullAddress.replace(/,\s*USA\s*$/i, '').trim();
    let streetAddress = "";
    let city = "";
    let state = "";
    let zipCode = "";

    // FIRST: Try Google Places address_components (most accurate)
    if (lastPlaceRef.current && lastPlaceRef.current.address_components) {
      console.log('[ADDRESS PARSE] Using Google Places components');
      const components = lastPlaceRef.current.address_components;
      let streetNumber = "";
      let route = "";
      components.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (types.includes('route')) {
          route = component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      // Combine street number and route
      streetAddress = streetNumber && route ? `${streetNumber} ${route}` : route || streetNumber || "";
    }

    // IMPROVED FALLBACK: Manual parsing with better regex patterns
    if (!streetAddress || !city || !state || !zipCode) {
      console.log('[ADDRESS PARSE] Using improved fallback manual parsing');
      const parts = cleanedAddress.split(',').map(p => p.trim());
      console.log('[ADDRESS PARSE] Split parts:', parts);
      
      if (parts.length >= 3) {
        // Format: "Street Address, City, State ZIP"
        if (!streetAddress) streetAddress = parts[0];
        if (!city) city = parts[1];

        // FIXED: Better state and zip extraction from last part
        const lastPart = parts[parts.length - 1];
        console.log('[ADDRESS PARSE] Processing last part:', lastPart);
        
        // Multiple patterns to catch different formats
        const patterns = [
          /^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/,           // "NY 10022" or "NY 10022-1234"
          /^([A-Za-z\s]+),?\s+([A-Z]{2})\s+(\d{5}(-\d{4})?)$/,  // "New York, NY 10022"
          /([A-Z]{2})\s+(\d{5}(-\d{4})?)$/,           // Extract from end: "something NY 10022"
          /\b([A-Z]{2})\b.*?(\d{5}(-\d{4})?)$/        // Find state code and zip anywhere
        ];
        
        let matched = false;
        for (const pattern of patterns) {
          const match = lastPart.match(pattern);
          if (match) {
            console.log('[ADDRESS PARSE] Pattern matched:', pattern, 'Result:', match);
            if (pattern.toString().includes('([A-Za-z\\s]+)')) {
              // Pattern with city included
              if (!state) state = match[2];
              if (!zipCode) zipCode = match[3];
            } else {
              // Pattern without city
              if (!state) state = match[1];
              if (!zipCode) zipCode = match[2];
            }
            matched = true;
            break;
          }
        }
        
        // If no pattern matched, try simple extraction
        if (!matched) {
          console.log('[ADDRESS PARSE] No pattern matched, trying simple extraction');
          const zipMatch = lastPart.match(/\b(\d{5}(-\d{4})?)\b/);
          const stateMatch = lastPart.match(/\b([A-Z]{2})\b/);
          if (zipMatch && !zipCode) {
            zipCode = zipMatch[1];
            console.log('[ADDRESS PARSE] Found zip via simple match:', zipCode);
          }
          if (stateMatch && !state) {
            state = stateMatch[1];
            console.log('[ADDRESS PARSE] Found state via simple match:', state);
          }
        }
      } else if (parts.length === 2) {
        // Handle simpler formats like "Street Address, City State Zip"
        if (!streetAddress) streetAddress = parts[0];
        const secondPart = parts[1];
        
        // Try to extract city, state, zip from second part
        const cityStateZipMatch = secondPart.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(-\d{4})?)$/);
        if (cityStateZipMatch) {
          if (!city) city = cityStateZipMatch[1].trim();
          if (!state) state = cityStateZipMatch[2];
          if (!zipCode) zipCode = cityStateZipMatch[3];
        }
      }
    }

    // FINAL FALLBACK: If we still don't have critical components, try one more time
    if (!state || !zipCode) {
      console.log('[ADDRESS PARSE] Final fallback parsing for state/zip');
      const stateZipPattern = /\b([A-Z]{2})\s*,?\s*(\d{5}(-\d{4})?)/;
      const match = cleanedAddress.match(stateZipPattern);
      if (match) {
        if (!state) state = match[1];
        if (!zipCode) zipCode = match[2];
        console.log('[ADDRESS PARSE] Final fallback found:', { state, zipCode });
      }
    }

    // ENHANCED: Better fallbacks for missing city - don't default to "N/A"
    if (!city || city.trim() === '') {
      console.log('[ADDRESS PARSE] City not found, trying alternative extraction');
      
      // Try to find city in the middle parts of the address
      const addressParts = cleanedAddress.split(',').map(p => p.trim());
      for (let i = 1; i < addressParts.length - 1; i++) {
        const part = addressParts[i];
        // If this part doesn't contain numbers and isn't a state code, it might be a city
        if (part && !part.match(/\d/) && !part.match(/^[A-Z]{2}$/)) {
          city = part;
          console.log('[ADDRESS PARSE] Found potential city in middle part:', city);
          break;
        }
      }
      
      // If still no city found, leave it empty rather than "N/A"
      if (!city || city.trim() === '') {
        city = "";
        console.log('[ADDRESS PARSE] No city found, leaving empty');
      }
    }

    const result = {
      streetAddress: streetAddress || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      fullAddress: cleanedAddress
    };
    
    console.log('[ADDRESS PARSE] Final result:', result);
    console.log('[ADDRESS PARSE] Original input was:', fullAddress);
    
    // Additional validation logging
    if (!result.city) {
      console.warn('[ADDRESS PARSE] WARNING: City extraction failed for address:', fullAddress);
      console.warn('[ADDRESS PARSE] Cleaned address was:', cleanedAddress);
      console.warn('[ADDRESS PARSE] Split parts were:', cleanedAddress.split(',').map(p => p.trim()));
    }
    
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please enter a property address to generate a valuation."
      });
      return;
    }

    setIsSubmitting(true);
    onLoading(true);

    try {
      // Auto-convert to Google's formatted address if available
      let finalAddress = address;
      if (lastPlaceRef.current && lastPlaceRef.current.formatted_address) {
        finalAddress = lastPlaceRef.current.formatted_address;
        console.log('[ADDRESS CONVERSION] Converting to Google formatted address:', finalAddress);
        setAddress(finalAddress); // Update the input field
      }

      const parsedAddress = parseAddress(finalAddress);

      // Validate that we have at least street address and one other component
      if (!parsedAddress.streetAddress && !parsedAddress.zipCode) {
        toast({
          variant: "destructive",
          title: "Address Incomplete",
          description: "Please enter a complete address with street and zip code."
        });
        onLoading(false);
        setIsSubmitting(false);
        return;
      }

      console.log('[WEBHOOK REQUEST] Sending to webhook:', parsedAddress);
      console.log('[WEBHOOK REQUEST] Including user data:', userData);
      
      const responseData = await sendWebhookRequest({
        editableFields: "",
        userType: userType,
        streetAddress: parsedAddress.streetAddress,
        city: parsedAddress.city,
        state: parsedAddress.state,
        zipCode: parsedAddress.zipCode,
        imageUrls: imageUrls || [],
        userData: userData
      });

      console.log('[WEBHOOK RESPONSE] Received:', responseData);
      
      // Check for trial limit - this can be set directly in the response or detected from the body
      if (responseData?.trialLimitReached || 
          (responseData?.body && responseData.body.includes("User already used up their trial reports"))) {
        
        console.log('[TRIAL LIMIT] Trial limit reached for user');
        
        // Pass trial limit info to parent component
        onSuccess({ 
          trialLimitReached: true,
          userData: userData 
        }, parsedAddress);
        
        return;
      }
      
      onSuccess(responseData, parsedAddress);
      
      toast({
        title: "Property Data Received",
        description: "Your property information is ready for review."
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Data Fetch Error",
        description: "There was a problem retrieving property data. Please try again."
      });
      onLoading(false);
    } finally {
      setIsSubmitting(false);
      lastPlaceRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitting && !!address.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full font-sans">
      <div className="relative">
        <Input
          ref={autocompleteInputRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter property address..."
          className="w-full py-3 pl-4 pr-12 border border-border rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent h-12 placeholder:text-secondary-foreground placeholder:font-normal transition"
          disabled={isSubmitting}
          type="text"
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Button
            type="submit"
            className="rounded-lg h-8 w-8 flex items-center justify-center bg-primary hover:bg-primary/90 p-0"
            disabled={isSubmitting || !address.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="mt-2">
        
      </div>
    </form>
  );
};

export default ValuationForm;

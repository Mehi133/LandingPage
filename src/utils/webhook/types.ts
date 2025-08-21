export interface PropertyFeatures {
  "Lot size": string;
  "Building area (square footage)": string;
  "Number of bedrooms": number;
  "Number of bathrooms": number;
  "Garage type and capacity": string;
  "Presence of a swimming pool": string;
  "Age of the property": number;
  "Roof material and condition": string;
  "HVAC system type and condition": string;
  "Kitchen quality and upgrades": string;
}

export interface WebhookPropertyData {
  editableFields: string;
  userType: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  imageUrls: string[];
  userData?: { fullName: string; email: string } | null;
}

export interface PropertyListing {
  id: number;
  address: string;
  beds: number;
  baths: number;
  price: string;
  lotSize: string;
  sqft: number;
  soldDate?: string;
  imgSrc?: string;
  images?: string[];
}

// Legacy market data structure for backward compatibility
export interface MarketData {
  "Median Price": string;
  "Current For Sale Inventory": string;
  "Days on Market in the Last 6 Months": Record<string, string>;
  "Median Price Last 6 months": Record<string, string>;
}

// Enhanced market data structure with new fields including bedroom-specific data
export interface EnhancedMarketData {
  zipCode: string;
  medianPrice: number;
  bedroomsRequested: number;
  medianPriceBedrooms: number;
  totalListingsGeneral: number;
  propertyTypeRequested: string;
  totalListingsBedrooms: number;
  propertyTypeNormalized: string;
  currentInventory: number;
  medianPriceLast6Months: Record<string, number>;
  medianPricePropertyType: number;
  totalListingsLast6Months: Record<string, number>;
  totalListingsPropertyType: number;
  averageDaysOnMarketGeneral: number;
  averageDaysOnMarketBedrooms: number;
  averagePricePerSqFtGeneral: number;
  averagePricePerSqFtBedrooms: number;
  daysOnMarketLast6Months: Record<string, number>;
  averageDaysOnMarketPropertyType: number;
  averagePricePerSqFtLast6Months: Record<string, number>;
  averagePricePerSqFtPropertyType: number;
  daysOnMarket: Record<string, number>;
  priceHistory: Record<string, number>;
  
  // New bedroom-specific historical data
  medianPriceBedroomsLast6Months: Record<string, number>;
  daysOnMarketBedroomsLast6Months: Record<string, number>;
  averagePricePerSqFtBedroomsLast6Months: Record<string, number>;
  totalListingsBedroomsLast6Months: Record<string, number>;
  
  // New property type historical data
  medianPricePropertyTypeLast6Months: Record<string, number>;
  daysOnMarketPropertyTypeLast6Months: Record<string, number>;
  averagePricePerSqFtPropertyTypeLast6Months: Record<string, number>;
  totalListingsPropertyTypeLast6Months: Record<string, number>;
}

// Union type to support both old and new market data formats
export type MarketDataUnion = MarketData | EnhancedMarketData;

export interface PricingStrategy {
  // Support both suggested_price and suggestedPrice
  suggestedPrice?: number;
  suggested_price?: string;
  "suggested price"?: number;
  
  // Support both "Price Range" and PriceRange formats
  PriceRange?: {
    low: number | string;
    high: number | string;
  };
  "Price Range"?: {
    low: string;
    high: string;
  };
  
  // Support both PricingReasoning and "Pricing Reasoning" formats
  PricingReasoning?: string;
  "Pricing Reasoning"?: string;
  
  // Updated to handle both array and object formats
  PricingOptions?: Array<{
    Conservative?: string;
    "Market Value"?: string;
    MarketValue?: string;
    Premium?: string;
    Pros?: string;
    Cons?: string;
  }> | {
    Conservative: {
      price: string;
      Pros: string;
      Cons: string;
    };
    MarketValue: {
      price: string;
      Pros: string;
      Cons: string;
    };
    Premium: {
      price: string;
      Pros: string;
      Cons: string;
    };
  };
  "Pricing Options"?: Array<{
    Conservative?: string;
    "Market Value"?: string;
    MarketValue?: string;
    Premium?: string;
    Pros?: string;
    Cons?: string;
  }> | {
    Conservative: {
      price: string;
      Pros: string;
      Cons: string;
    };
    MarketValue: {
      price: string;
      Pros: string;
      Cons: string;
    };
    Premium: {
      price: string;
      Pros: string;
      Cons: string;
    };
  };
}

export interface PricingData {
  PricingStrategy: PricingStrategy[];
}

// Updated interface to handle the new nested structure from editFields3
export interface MarketDataResponse {
  result: MarketData[];
}

export interface WebhookResponse {
  [key: string]: any;
  body?: string;
  trialLimitReached?: boolean;
}

export interface ConfirmationResponse {
  success: boolean;
  message: string;
  activeListings?: PropertyListing[];
  recentSales?: PropertyListing[];
  marketData?: MarketDataUnion;
  pricingData?: PricingData;
  subjectProperty?: any;
  pdfUrl?: string;
  isProcessing?: boolean;
  jobId?: string;
  error?: string;
}

export interface WebhookJob {
  id: string;
  request_type: string;
  request_data: any;
  response_data?: any;
  status: 'pending' | 'processing' | 'retry_1' | 'retry_2' | 'retry_3' | 'completed' | 'failed' | 'error';
  error?: string;
  created_at: string;
  updated_at: string;
}

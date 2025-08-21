
import { PropertyFeatures, PropertyListing } from './types';

export const MOCK_PROPERTY_FEATURES: PropertyFeatures = {
  "Lot size": "8,712 sqft",
  "Building area (square footage)": "1,621 sqft",
  "Number of bedrooms": 4,
  "Number of bathrooms": 2,
  "Garage type and capacity": "1 Attached Garage space",
  "Presence of a swimming pool": "No",
  "Age of the property": 30,
  "Roof material and condition": "Asphalt",
  "HVAC system type and condition": "Forced Air, Central Heating; Central Air Cooling",
  "Kitchen quality and upgrades": "Updated kitchen with sleek countertops and ample cabinetry"
};

export const MOCK_ACTIVE_LISTINGS: PropertyListing[] = [
  { id: 1, address: "123 Main St", price: "$839,000", beds: 3, baths: 2, lotSize: "0.25 acres", sqft: 1750 },
  { id: 2, address: "456 Oak Ave", price: "$849,000", beds: 3, baths: 2.5, lotSize: "0.30 acres", sqft: 1800 },
  { id: 3, address: "789 Pine Rd", price: "$869,000", beds: 4, baths: 2, lotSize: "0.35 acres", sqft: 1950 },
  { id: 4, address: "101 Elm St", price: "$835,000", beds: 3, baths: 2, lotSize: "0.28 acres", sqft: 1700 },
  { id: 5, address: "202 Cedar Ln", price: "$889,000", beds: 4, baths: 3, lotSize: "0.40 acres", sqft: 2100 },
  { id: 6, address: "303 Maple Dr", price: "$859,000", beds: 3, baths: 2.5, lotSize: "0.32 acres", sqft: 1850 }
];

export const MOCK_RECENT_SALES: PropertyListing[] = [
  { id: 7, address: "505 Birch St", price: "$825,000", beds: 3, baths: 2, lotSize: "0.26 acres", sqft: 1700, soldDate: "3 months ago" },
  { id: 8, address: "606 Walnut Ave", price: "$840,000", beds: 3, baths: 2.5, lotSize: "0.29 acres", sqft: 1820, soldDate: "2 months ago" },
  { id: 9, address: "707 Willow Rd", price: "$855,000", beds: 4, baths: 2, lotSize: "0.33 acres", sqft: 1900, soldDate: "1 month ago" },
  { id: 10, address: "808 Spruce St", price: "$820,000", beds: 3, baths: 2, lotSize: "0.25 acres", sqft: 1680, soldDate: "3 months ago" },
  { id: 11, address: "909 Ash Ln", price: "$870,000", beds: 4, baths: 3, lotSize: "0.38 acres", sqft: 2050, soldDate: "2 months ago" },
  { id: 12, address: "1010 Redwood Dr", price: "$850,000", beds: 3, baths: 2.5, lotSize: "0.31 acres", sqft: 1830, soldDate: "1 month ago" }
];

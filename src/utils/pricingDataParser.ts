
// REMOVED OLD PARSING LOGIC - Now using simple direct data access
// This file is kept minimal to avoid import errors

export interface PricingStrategy {
  name: string;
  price: string;
  pros: string[];
  cons: string[];
}

// Simple inline formatter - no complex logic
export const formatCurrency = (value: string | number | undefined): string => {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  
  if (typeof value === 'number') {
    return `$${value.toLocaleString()}`;
  }
  
  if (typeof value === 'string') {
    if (value.startsWith('$')) return value;
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 'N/A' : `$${num.toLocaleString()}`;
  }
  
  return 'N/A';
};

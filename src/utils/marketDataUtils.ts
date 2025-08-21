
export const processMarketData = (marketData: any) => {
  console.log('📊 Processing market data:', marketData);
  
  if (!marketData) {
    console.log('📊 No market data provided');
    return null;
  }

  try {
    const processedData = {
      medianPrice: marketData.medianPrice || null,
      daysOnMarket: marketData.daysOnMarket || null,
      salesVolume: marketData.salesVolume || null,
      priceChange: marketData.priceChange || null,
      inventory: marketData.inventory || null,
      absorption: marketData.absorption || null
    };

    console.log('📊 Processed market data:', processedData);
    return processedData;
  } catch (error) {
    console.error('📊 Error processing market data:', error);
    return null;
  }
};

export const formatMarketValue = (value: any, type: 'currency' | 'percentage' | 'number' | 'days') => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    
    case 'percentage':
      return `${value > 0 ? '+' : ''}${value}%`;
    
    case 'days':
      return `${value} days`;
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    
    default:
      return String(value);
  }
};

export const getMedianPrice = (marketData: any) => {
  console.log('[getMedianPrice] Input marketData:', marketData);
  
  if (!marketData) {
    console.log('[getMedianPrice] No market data provided');
    return 'N/A';
  }
  
  // Check for raw numeric value first
  if (typeof marketData.medianPrice === 'number') {
    const formatted = formatMarketValue(marketData.medianPrice, 'currency');
    console.log('[getMedianPrice] ✅ Using numeric value:', marketData.medianPrice, '→', formatted);
    return formatted;
  }
  
  // Check for formatted string value  
  if (marketData['Median Price']) {
    console.log('[getMedianPrice] ✅ Using formatted string:', marketData['Median Price']);
    return marketData['Median Price'];
  }
  
  console.log('[getMedianPrice] ❌ No valid median price found');
  return 'N/A';
};

export const getCurrentInventory = (marketData: any) => {
  console.log('[getCurrentInventory] Input marketData:', marketData);
  
  if (!marketData) {
    console.log('[getCurrentInventory] No market data provided');
    return 'N/A';
  }
  
  // Check for raw numeric value first
  if (typeof marketData.currentInventory === 'number') {
    const formatted = formatMarketValue(Math.round(marketData.currentInventory), 'number');
    console.log('[getCurrentInventory] ✅ Using numeric value:', marketData.currentInventory, '→', formatted);
    return formatted;
  }
  
  // Check for formatted string value
  if (marketData['Current For Sale Inventory']) {
    console.log('[getCurrentInventory] ✅ Using formatted string:', marketData['Current For Sale Inventory']);
    return marketData['Current For Sale Inventory'];
  }
  
  console.log('[getCurrentInventory] ❌ No valid inventory found');
  return 'N/A';
};

export const getAverageDaysOnMarket = (marketData: any) => {
  console.log('[getAverageDaysOnMarket] Input marketData:', marketData);
  
  if (!marketData) {
    console.log('[getAverageDaysOnMarket] No market data provided');
    return 'N/A';
  }
  
  // Check for raw numeric daysOnMarket object first
  const daysOnMarket = marketData.daysOnMarket || marketData['Days on Market in the Last 6 Months'] || {};
  console.log('[getAverageDaysOnMarket] Days on market data:', daysOnMarket);
  
  if (typeof daysOnMarket === 'object' && Object.keys(daysOnMarket).length > 0) {
    const sortedMonths = sortMonthsChronologically(daysOnMarket);
    console.log('[getAverageDaysOnMarket] Sorted months:', sortedMonths);
    
    if (sortedMonths.length > 0) {
      const latestValue = sortedMonths[sortedMonths.length - 1][1];
      const numericValue = typeof latestValue === 'number' ? latestValue : parseFloat(String(latestValue));
      console.log('[getAverageDaysOnMarket] ✅ Latest value:', latestValue, 'Parsed:', numericValue);
      
      if (!isNaN(numericValue)) {
        const result = `${Math.round(numericValue)} days`;
        console.log('[getAverageDaysOnMarket] ✅ Final result:', result);
        return result;
      }
    }
  }
  
  console.log('[getAverageDaysOnMarket] ❌ No valid days on market found');
  return 'N/A';
};

export const getMedianPriceHistory = (marketData: any) => {
  if (!marketData) return {};
  
  // Check for raw priceHistory first, then formatted
  const priceHistory = marketData.priceHistory || marketData['Median Price Last 6 Months'] || marketData['Median Price Last 6 months'] || {};
  return typeof priceHistory === 'object' ? priceHistory : {};
};

export const getDaysOnMarketHistory = (marketData: any) => {
  if (!marketData) return {};
  
  // Check for raw daysOnMarket first, then formatted
  const daysHistory = marketData.daysOnMarket || marketData['Days on Market in the Last 6 Months'] || {};
  return typeof daysHistory === 'object' ? daysHistory : {};
};

export const sortMonthsChronologically = (monthData: Record<string, string | number>) => {
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return Object.entries(monthData).sort(([a], [b]) => {
    const monthA = a.split(' ')[0];
    const monthB = b.split(' ')[0];
    const yearA = parseInt(a.split(' ')[1]) || 0;
    const yearB = parseInt(b.split(' ')[1]) || 0;
    
    // Sort by year first, then by month
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    
    return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
  });
};

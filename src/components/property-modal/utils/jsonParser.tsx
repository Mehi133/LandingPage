
import React from 'react';

/**
 * Utility for parsing JSON array strings and formatting data lists
 */

export const parseJsonArrayString = (data: any[] | string | undefined): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === 'string' && data.trim()) {
    const trimmedData = data.trim();
    
    if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
      try {
        const validJsonArrayString = `[${trimmedData.replace(/}\s*{/g, '},{')}]`;
        const parsed = JSON.parse(validJsonArrayString);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.warn('Could not parse concatenated JSON objects:', data);
      }
    }

    if (trimmedData.startsWith('[') && trimmedData.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmedData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Could not parse string as JSON array:', data);
      }
    }
    
    try {
      const parsed = JSON.parse(trimmedData);
      return [parsed];
    } catch (e) {
    }
  }
  if (typeof data === 'string') {
      return data.split('\n').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const formatBulletList = (itemsInput: any[] | string | undefined, type?: string) => {
  const items = parseJsonArrayString(itemsInput);
  if (!items || items.length === 0) {
    return type === "schools" || type === "utilities" || type === "taxHistory" || type === "priceHistory" 
      ? <span className="text-sm text-gray-500">No data available.</span> 
      : null;
  }

  return (
    <ul className="list-disc ml-4 space-y-1 text-sm">
      {items.map((rawItem, idx) => {
        let item = rawItem;
        if (typeof rawItem === 'string') {
          try {
            item = JSON.parse(rawItem);
          } catch (e) {
          }
        }
        
        if (typeof item !== 'object' || item === null) {
          return <li key={idx}>{String(item)}</li>;
        }

        if (type === "schools") {
          return (
            <li key={idx}>
              <span className="font-medium">{item.name || "Unnamed School"}</span>
              {item.type && ` (${item.type})`}
              {item.rating && `, Rating: ${item.rating}/10`}
              {item.distance !== undefined && `, ${typeof item.distance === 'number' ? item.distance.toFixed(1) : item.distance} miles`}
            </li>
          );
        }
        if (type === "taxHistory") {
          const year = item.year || (item.time && new Date(item.time).getFullYear());
          const taxPaid = item.taxPaid ? `$${item.taxPaid.toLocaleString()}` : (item.amount ? `$${item.amount.toLocaleString()}` : 'N/A');
          const value = item.value || item.homeValue ? `$${(item.value || item.homeValue).toLocaleString()}` : null;
          return (
            <li key={idx}>
              {year && <span className="font-medium">{year}:</span>} Tax Paid {taxPaid}
              {value && `, Value ${value}`}
            </li>
          );
        }
        if (type === "priceHistory") {
          const date = item.date || (item.time ? new Date(item.time).toLocaleDateString() : '');
          const price = item.price ? `$${item.price.toLocaleString()}` : 'N/A';
          return (
            <li key={idx}>
              {date && <span className="font-medium">{date}: </span>}
              {item.event || "Event"}
              {`, Price: ${price}`}
              {item.priceChangeRate && ` (${(item.priceChangeRate * 100).toFixed(2)}%)`}
            </li>
          );
        }
        if (type === "utilities") {
          return (
            <li key={idx}>
              {item.type ? <span className="font-medium">{item.type}:</span> : ""} {item.company || item.name || JSON.stringify(item)}
            </li>
          );
        }
        if (typeof item === 'object' && item !== null) {
          const entries = Object.entries(item);
          if (entries.length === 1 && entries[0][1] === true) { 
               return <li key={idx}>{entries[0][0]}</li>;
          }
          if (item.name) return <li key={idx}>{item.name}</li>;
          return <li key={idx}>{entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')}</li>;
        }
        return (
          <li key={idx}>{String(item)}</li>
        );
      })}
    </ul>
  );
};

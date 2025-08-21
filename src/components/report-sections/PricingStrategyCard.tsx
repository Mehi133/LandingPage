
// DEPRECATED - Logic moved inline to PricingStrategy.tsx
// This file is kept minimal to avoid import errors

import React from 'react';
import { PricingStrategy } from '@/utils/pricingDataParser';

interface PricingStrategyCardProps {
  strategy: PricingStrategy;
  isRecommended?: boolean;
}

// Simple component - no complex logic
const PricingStrategyCard: React.FC<PricingStrategyCardProps> = ({ 
  strategy, 
  isRecommended = false 
}) => {
  return (
    <div 
      className={`border rounded-lg p-4 ${
        isRecommended 
          ? "border-primary bg-secondary" 
          : "border-border"
      }`}
    >
      <h4 className="font-medium text-primary">{strategy.name}</h4>
      <p className="text-xl font-bold text-primary mt-1 mb-3">{strategy.price}</p>
      
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">Pros:</p>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          {strategy.pros.map((pro, i) => (
            <li key={i}>{pro}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-700">Cons:</p>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          {strategy.cons.map((con, i) => (
            <li key={i}>{con}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingStrategyCard;

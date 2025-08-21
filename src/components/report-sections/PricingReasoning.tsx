
// DEPRECATED - Logic moved inline to PricingStrategy.tsx
// This file is kept minimal to avoid import errors

import React from 'react';

interface PricingReasoningProps {
  reasoning: string;
}

// Simple component - no complex logic
const PricingReasoning: React.FC<PricingReasoningProps> = ({ reasoning }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-foreground mb-3">Pricing Reasoning</h3>
      <div className="bg-secondary p-4 rounded-lg">
        <p className="text-gray-700 leading-relaxed">{reasoning}</p>
      </div>
    </div>
  );
};

export default PricingReasoning;

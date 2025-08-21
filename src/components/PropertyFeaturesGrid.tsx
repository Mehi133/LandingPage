
import React from 'react';

const FeatureSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="font-semibold text-gray-800 text-base mb-3 pb-2 border-b tracking-tight">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const FeatureItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-right max-w-[60%] break-words">{String(value)}</span>
    </div>
  );
};

const FeatureList: React.FC<{ items?: (string | undefined)[], label: string }> = ({ items, label }) => {
    if (!items || items.length === 0) return null;
    const validItems = items.filter(Boolean);
    if (validItems.length === 0) return null;
    return (
        <div className="flex justify-between items-start">
             <span className="text-gray-600">{label}</span>
            <ul className="list-none text-right">
                {validItems.map((item, index) => (
                    <li key={index} className="font-medium">{item}</li>
                ))}
            </ul>
        </div>
    );
};

interface PropertyFeaturesGridProps {
  features: Record<string, any>;
}

const PropertyFeaturesGrid: React.FC<PropertyFeaturesGridProps> = ({ features }) => {
    console.log('🏡 PropertyFeaturesGrid received features:', features);
    console.log('🏡 Features keys:', Object.keys(features || {}));
    
    const resoFacts = features.resoFacts || {};
    console.log('🏡 Extracted resoFacts:', resoFacts);
    console.log('🏡 ResoFacts keys:', Object.keys(resoFacts));

    const formatArrayOrString = (value: any): string => {
        if (Array.isArray(value)) return value.join(', ');
        return value || '';
    };

    const atAGlanceFacts = resoFacts.atAGlanceFacts?.filter((fact: any) => fact.factLabel && fact.factValue) || [];
    console.log('🏡 At a glance facts:', atAGlanceFacts);

  return (
    <div className="text-sm">
        {atAGlanceFacts.length > 0 && (
            <div className="mb-6 pt-4 border-t">
                 <FeatureSection title="At a Glance">
                    {atAGlanceFacts.map((fact: any, idx: number) => (
                        <FeatureItem key={idx} label={fact.factLabel} value={fact.factValue} />
                    ))}
                </FeatureSection>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
            {/* Left Column */}
            <div>
                <FeatureSection title="Bedrooms & Bathrooms">
                    <FeatureItem label="Bedrooms" value={features.bedrooms ?? resoFacts.bedrooms} />
                    <FeatureItem label="Bathrooms" value={features.bathrooms ?? resoFacts.bathrooms} />
                    <FeatureItem label="Full bathrooms" value={resoFacts.bathroomsFull} />
                    <FeatureItem label="Half bathrooms" value={resoFacts.bathroomsHalf} />
                </FeatureSection>

                <FeatureSection title="Interior Features">
                    <FeatureItem label="Flooring" value={formatArrayOrString(resoFacts.flooring)} />
                    <FeatureItem label="Fireplace" value={resoFacts.hasFireplace ? 'Yes' : undefined} />
                    <FeatureItem label="Basement" value={resoFacts.basement} />
                    <FeatureList items={resoFacts.interiorFeatures} label="Other Features" />
                </FeatureSection>
                
                <FeatureSection title="Appliances">
                    <FeatureList items={resoFacts.appliances} label="Included Appliances" />
                </FeatureSection>

            </div>

            {/* Right Column */}
            <div>
                 <FeatureSection title="Parking">
                    <FeatureItem label="Garage" value={resoFacts.hasGarage ? 'Yes' : undefined} />
                    <FeatureItem label="Parking spaces" value={resoFacts.garageParkingCapacity ?? resoFacts.parkingCapacity} />
                    <FeatureList items={resoFacts.parkingFeatures} label="Parking Features" />
                </FeatureSection>
                
                <FeatureSection title="Property & Lot">
                    <FeatureItem label="Lot size" value={features.lotSize ?? resoFacts.lotSize} />
                    <FeatureItem label="Year built" value={features.yearBuilt ?? resoFacts.yearBuilt} />
                    <FeatureItem label="Property type" value={features.homeType ?? resoFacts.homeType} />
                    <FeatureItem label="Architectural style" value={resoFacts.architecturalStyle} />
                    <FeatureItem label="Roof" value={resoFacts.roofType} />
                    <FeatureItem label="Construction" value={formatArrayOrString(resoFacts.constructionMaterials)} />
                    <FeatureItem label="Foundation" value={formatArrayOrString(resoFacts.foundationDetails)} />
                </FeatureSection>
                
                <FeatureSection title="Community & Other">
                    <FeatureItem label="HOA Fee" value={resoFacts.hoaFee ?? resoFacts.associationFee} />
                    <FeatureItem label="View" value={formatArrayOrString(resoFacts.view)} />
                    <FeatureItem label="Parcel number" value={resoFacts.parcelNumber} />
                </FeatureSection>
            </div>
        </div>
    </div>
  );
};

export default PropertyFeaturesGrid;

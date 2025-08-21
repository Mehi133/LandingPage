
import React from "react";

interface PropertyHoverCardProps {
  property: any;
  type: "subject" | "active" | "sold";
  small?: boolean;
}

const PropertyHoverCard: React.FC<PropertyHoverCardProps> = ({ property, type, small = false }) => {
  if (!property) return null;
  const mainImage =
    property.images?.[0] ||
    property.imgSrc?.split(",")[0] ||
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop";

  return (
    <div className={`rounded-lg overflow-hidden shadow border border-border animate-fade-in bg-white ${small ? "w-56" : "w-72"}`}>
      <img src={mainImage} alt={property.address} className="w-full h-28 object-cover" />
      <div className="px-3 py-2">
        <div className="font-bold truncate" title={property.address}>
          {property.address}
        </div>
        <div className="text-primary font-semibold text-sm">{property.price}</div>
        <div className="text-xs text-gray-600">{property.beds} bd • {property.baths} ba</div>
        {property.lotSize && (
          <div className="text-xs text-gray-500">Lot: {property.lotSize}</div>
        )}
        {type === "sold" && property.soldDate && (
          <div className="text-xs text-orange-600">Sold: {property.soldDate}</div>
        )}
      </div>
    </div>
  );
};

export default PropertyHoverCard;


import React, { useRef, useEffect } from "react";

interface MapPinData {
  id: string | number;
  lat: number;
  lng: number;
  type: "subject" | "active" | "sold";
  property: any;
  color: string;
}

interface PropertyMapProps {
  center: { lat: number; lng: number };
  pins: MapPinData[];
  onPinHover?: (id: string | number | null) => void;
  hoveredPinId?: string | number | null;
  legend?: React.ReactNode;
  height?: number | string;
  zoom?: number;
}

const pinSvg = (color: string, scale: number = 1) => `
  <svg width="${32 * scale}" height="${32 * scale}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="13" r="7" fill="${color}" stroke="#fff" stroke-width="2"/>
    <path d="M16 27C16 27 8 19.0025 8 13C8 8.02944 11.5817 4 16 4C20.4183 4 24 8.02944 24 13C24 19.0025 16 27 16 27Z" fill="${color}" stroke="#222" stroke-width="1.5"/>
  </svg>
`;

declare global {
  interface Window {
    google: typeof google;
  }
}

const getPinColor = (type: "subject" | "active" | "sold") =>
  type === "subject" ? "#27ae60" : type === "active" ? "#2773fa" : "#e74c3c";

const PropertyMap: React.FC<PropertyMapProps> = ({
  center,
  pins,
  onPinHover,
  hoveredPinId,
  legend,
  height = 320,
  zoom = 13,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
    });
    mapInstanceRef.current = map;
    return () => {
      mapInstanceRef.current = undefined;
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Clean up markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    pins.forEach(pin => {
      const marker = new window.google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map: mapInstanceRef.current!,
        icon: {
          url: "data:image/svg+xml;base64," + btoa(pinSvg(pin.color || getPinColor(pin.type))),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 28)
        },
        zIndex: pin.type === "subject" ? 20 : pin.type === "active" ? 10 : 5,
        title: `${pin.property?.address || pin.type}`,
      });

      // Add data-testid for testing
      (marker as any).set('testId', `pin-${pin.type}`);

      // Marker hover
      marker.addListener("mouseover", () => onPinHover?.(pin.id));
      marker.addListener("mouseout", () => onPinHover?.(null));

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition()!);
    });

    // Fit map to pins if there is more than 1, otherwise center
    if (pins.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, 80);
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    // Optionally highlight hovered pin with animation
    if (
      hoveredPinId &&
      pins.some(p => p.id === hoveredPinId)
    ) {
      const i = pins.findIndex(p => p.id === hoveredPinId);
      if (i !== -1) {
        markersRef.current[i].setAnimation(window.google.maps.Animation.BOUNCE);
      }
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
    // eslint-disable-next-line
  }, [pins, hoveredPinId, onPinHover]);

  return (
    <div className="relative w-full" style={{ minHeight: height, borderRadius: 16, overflow: "hidden" }}>
      <div ref={mapRef} style={{ width: "100%", height }} data-testid="property-map" />
      {legend && <div className="absolute left-4 bottom-3 z-10 bg-white/90 rounded p-2 shadow text-xs">{legend}</div>}
    </div>
  );
};

export default PropertyMap;

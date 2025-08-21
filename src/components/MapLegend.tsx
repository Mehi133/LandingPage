
import React from "react";

const colorBlocks = [
  { color: "#27ae60", label: "Subject Property" },
  { color: "#e74c3c", label: "Recent Sale" },
  { color: "#2773fa", label: "Active Listing" }
];

const MapLegend = () => (
  <div className="flex gap-3 items-center">
    {colorBlocks.map(cb => (
      <div key={cb.label} className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full" style={{ background: cb.color }} />
        <span>{cb.label}</span>
      </div>
    ))}
  </div>
);

export default MapLegend;

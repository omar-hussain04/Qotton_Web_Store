"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Crosshair } from "lucide-react";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface flex items-center justify-center animate-pulse">
      <MapPin className="h-8 w-8 text-muted opacity-50" />
    </div>
  ),
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
  defaultLocation?: { lat: number; lng: number } | null;
}

export function LocationPicker({ onLocationSelect, defaultLocation }: LocationPickerProps) {
  const [triggerLocationUpdate, setTriggerLocationUpdate] = useState(0);

  return (
    <div className="relative w-full flex flex-col gap-3">
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border z-0">
        <MapComponent 
          onLocationSelect={onLocationSelect} 
          defaultLocation={defaultLocation || null} 
          triggerLocationUpdate={triggerLocationUpdate}
        />
        
        <button
          type="button"
          onClick={() => setTriggerLocationUpdate(prev => prev + 1)}
          className="absolute bottom-4 right-4 bg-background text-text p-3 rounded-full shadow-lg border border-border hover:bg-surface hover:text-accent transition-colors z-[1000] flex items-center justify-center"
          title="تحديد موقعي الحالي"
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>
      <p className="text-xs text-muted flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        انقر على الخريطة لتحديد موقعك، أو اضغط على أيقونة التحديد (أسفل اليمين) لنجد موقعك تلقائياً. الخريطة مجانية بالكامل.
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Crosshair, Loader2, AlertTriangle, X } from "lucide-react";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface flex items-center justify-center animate-pulse">
      <MapPin className="h-8 w-8 text-muted opacity-50" />
    </div>
  ),
});

// Map Nominatim city names to Jordanian governorate names used in the checkout dropdown
const CITY_MAP: Record<string, string> = {
  "عمان": "عمان",
  "amman": "عمان",
  "إربد": "إربد",
  "irbid": "إربد",
  "الزرقاء": "الزرقاء",
  "zarqa": "الزرقاء",
  "az-zarqa": "الزرقاء",
  "العقبة": "العقبة",
  "aqaba": "العقبة",
  "البلقاء": "البلقاء",
  "balqa": "البلقاء",
  "salt": "البلقاء",
  "السلط": "البلقاء",
  "الكرك": "الكرك",
  "karak": "الكرك",
  "المفرق": "المفرق",
  "mafraq": "المفرق",
  "مادبا": "مأدبا",
  "مأدبا": "مأدبا",
  "madaba": "مأدبا",
  "عجلون": "عجلون",
  "ajloun": "عجلون",
  "جرش": "جرش",
  "jerash": "جرش",
  "معان": "معان",
  "ma'an": "معان",
  "الطفيلة": "الطفيلة",
  "tafilah": "الطفيلة",
  "tafila": "الطفيلة",
};

function resolveCity(rawCity: string | undefined, rawState: string | undefined): string {
  if (!rawCity && !rawState) return "";
  
  // Try city first, then state (governorate)
  for (const raw of [rawCity, rawState]) {
    if (!raw) continue;
    const lower = raw.toLowerCase().trim();
    // Exact match
    if (CITY_MAP[lower]) return CITY_MAP[lower];
    if (CITY_MAP[raw.trim()]) return CITY_MAP[raw.trim()];
    // Partial match
    for (const [key, value] of Object.entries(CITY_MAP)) {
      if (lower.includes(key) || key.includes(lower)) return value;
    }
  }
  return rawCity || rawState || "";
}

export interface ResolvedAddress {
  city: string;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
  onAddressResolved?: (address: ResolvedAddress) => void;
  defaultLocation?: { lat: number; lng: number } | null;
}

export function LocationPicker({ onLocationSelect, onAddressResolved, defaultLocation }: LocationPickerProps) {
  const [triggerLocationUpdate, setTriggerLocationUpdate] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleLocating = useCallback((locating: boolean) => {
    setIsLocating(locating);
    if (!locating) {
      // Show success flash briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  }, []);

  // Safety timeout: if locating gets stuck, force reset after 12 seconds
  useEffect(() => {
    if (!isLocating) return;
    const timer = setTimeout(() => {
      setIsLocating(false);
      setLocationError("انتهت مهلة تحديد الموقع. حاول مرة أخرى أو حدد موقعك يدوياً على الخريطة.");
    }, 12000);
    return () => clearTimeout(timer);
  }, [isLocating]);

  const handleLocationError = useCallback((error: string | null) => {
    setLocationError(error);
  }, []);

  // Reverse geocode using Nominatim (free, no API key)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!onAddressResolved) return;

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&addressdetails=1`,
        { 
          signal: controller.signal,
          headers: { "User-Agent": "QottonWebStore/1.0" }
        }
      );
      const data = await res.json();
      
      if (data?.address) {
        const a = data.address;
        const city = resolveCity(a.city || a.town || a.village, a.state);
        
        // Build address string from most specific to least
        const parts: string[] = [];
        if (a.neighbourhood) parts.push(a.neighbourhood);
        if (a.suburb && a.suburb !== a.neighbourhood) parts.push(a.suburb);
        if (a.road) parts.push(a.road);
        
        const address = parts.join("، ") || a.display_name?.split(",").slice(0, 2).join("،") || "";

        onAddressResolved({ city, address });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Reverse geocoding failed:", err);
      }
    } finally {
      setIsResolving(false);
    }
  }, [onAddressResolved]);

  // Wrap onLocationSelect to also trigger reverse geocoding
  const handleLocationSelect = useCallback((location: { lat: number; lng: number } | null) => {
    onLocationSelect(location);
    if (location) {
      reverseGeocode(location.lat, location.lng);
    }
  }, [onLocationSelect, reverseGeocode]);

  return (
    <div className="relative w-full flex flex-col gap-3">
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border z-0">
        <MapComponent 
          onLocationSelect={handleLocationSelect} 
          defaultLocation={defaultLocation || null} 
          triggerLocationUpdate={triggerLocationUpdate}
          onLocating={handleLocating}
          onLocationError={handleLocationError}
        />
        
        {/* Inline error banner */}
        {locationError && (
          <div 
            className="absolute top-3 left-3 right-3 z-[1000] flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-red-500/30 shadow-lg animate-fade-in"
            style={{ 
              background: "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.1))",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-200 leading-relaxed flex-1">{locationError}</p>
            <button 
              type="button"
              onClick={() => setLocationError(null)}
              className="text-red-400/70 hover:text-red-300 transition-colors flex-shrink-0 mt-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Resolving address indicator */}
        {isResolving && (
          <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-accent bg-surface/80 border border-border shadow-lg" style={{ backdropFilter: "blur(8px)" }}>
            <Loader2 className="h-3 w-3 animate-spin" />
            جاري تحديد العنوان...
          </div>
        )}
      </div>

      {/* Locate me button — always visible below the map */}
      <button
        type="button"
        onClick={() => !isLocating && setTriggerLocationUpdate(prev => prev + 1)}
        disabled={isLocating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 disabled:cursor-not-allowed ${
          showSuccess 
            ? "bg-green-500/10 border-green-500/50 text-green-400" 
            : "border-border bg-surface hover:bg-accent/10 hover:border-accent/40 text-text"
        } ${isLocating ? "opacity-80" : "opacity-100"}`}
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showSuccess ? (
          <svg className="h-4 w-4 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <Crosshair className="h-4 w-4" />
        )}
        <span>
          {isLocating 
            ? "جاري تحديد موقعك..." 
            : showSuccess 
              ? "تم تحديد الموقع بنجاح" 
              : "تحديد موقعي الحالي"
          }
        </span>
      </button>

      <p className="text-xs text-muted flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        انقر على الخريطة لتحديد موقعك، أو اضغط على الزر أعلاه لنجد موقعك تلقائياً.
      </p>
    </div>
  );
}

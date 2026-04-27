"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Inline SVG marker — no external images needed, appears instantly
const markerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10.512 14.112 24.372 14.745 25.002a1.678 1.678 0 002.51 0C17.888 40.372 32 26.512 32 16 32 7.163 24.837 0 16 0z" fill="#C9963A"/>
    <circle cx="16" cy="16" r="7" fill="#3B1A0E"/>
    <circle cx="16" cy="16" r="4" fill="#F5E6C8"/>
  </svg>`,
  className: "",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

interface MapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  defaultLocation: { lat: number; lng: number } | null;
  triggerLocationUpdate: number;
  onLocating?: (isLocating: boolean) => void;
  onLocationError?: (error: string | null) => void;
}

// Default to Amman, Jordan
const DEFAULT_CENTER = { lat: 31.9539, lng: 35.9106 };

// Jordan boundaries (with padding)
const JORDAN_BOUNDS = L.latLngBounds(
  L.latLng(29.1, 34.8),  // Southwest corner
  L.latLng(33.4, 39.4)   // Northeast corner
);

function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      // Only allow placing marker inside Jordan
      if (JORDAN_BOUNDS.contains(e.latlng)) {
        setPosition(e.latlng);
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          // Clamp to Jordan bounds if dragged outside
          if (JORDAN_BOUNDS.contains(latlng)) {
            setPosition(latlng);
            onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
          } else {
            // Reset to previous position
            marker.setLatLng(marker.getLatLng());
          }
        }
      },
    }),
    [setPosition, onLocationSelect]
  );

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
      icon={markerIcon}
    />
  );
}

function MapController({ triggerLocationUpdate, position, onLocationSelect, setPosition, onLocating, onLocationError }: any) {
  const map = useMap();
  const prevTriggerRef = useRef(0);

  useEffect(() => {
    if (triggerLocationUpdate > prevTriggerRef.current && navigator.geolocation) {
      prevTriggerRef.current = triggerLocationUpdate;
      
      onLocating?.(true);
      onLocationError?.(null);
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          try {
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (!JORDAN_BOUNDS.contains(L.latLng(newPos.lat, newPos.lng))) {
              onLocationError?.("يبدو أن موقعك خارج الأردن. يرجى تحديد موقعك يدوياً على الخريطة.");
              return;
            }
            setPosition(newPos);
            onLocationSelect(newPos);
            map.flyTo(newPos, 16);
          } catch (e) {
            console.error("Error in success callback:", e);
          } finally {
            onLocating?.(false);
          }
        },
        (err) => {
          let message = "تعذر الوصول لموقعك.";
          if (err.code === 1) {
            message = "تم رفض صلاحية تحديد الموقع. يرجى السماح بالوصول من إعدادات المتصفح.";
          } else if (err.code === 2) {
            message = "خدمة تحديد الموقع غير متوفرة حالياً. حاول مرة أخرى لاحقاً.";
          } else if (err.code === 3) {
            message = "انتهت مهلة تحديد الموقع. حاول مرة أخرى.";
          }
          onLocationError?.(message);
          onLocating?.(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    }
  }, [triggerLocationUpdate, map, onLocationSelect, setPosition, onLocating, onLocationError]);

  return null;
}

export default function MapComponent({ onLocationSelect, defaultLocation, triggerLocationUpdate, onLocating, onLocationError }: MapComponentProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(defaultLocation);

  return (
    <MapContainer 
      center={defaultLocation || DEFAULT_CENTER} 
      zoom={13} 
      minZoom={7}
      maxBounds={JORDAN_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      <MapController 
        triggerLocationUpdate={triggerLocationUpdate} 
        position={position} 
        setPosition={setPosition} 
        onLocationSelect={onLocationSelect}
        onLocating={onLocating}
        onLocationError={onLocationError}
      />
    </MapContainer>
  );
}

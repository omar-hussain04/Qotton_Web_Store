"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  defaultLocation: { lat: number; lng: number } | null;
  triggerLocationUpdate: number;
}

// Default to Amman, Jordan
const DEFAULT_CENTER = { lat: 31.9539, lng: 35.9106 };

function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition(latlng);
          onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
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
    />
  );
}

function MapController({ triggerLocationUpdate, position, onLocationSelect, setPosition }: any) {
  const map = useMap();

  useEffect(() => {
    if (triggerLocationUpdate > 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          onLocationSelect(newPos);
          map.flyTo(newPos, 16);
        },
        () => {
          alert("تعذر الوصول لموقعك. تأكد من تفعيل خدمة تحديد الموقع في متصفحك.");
        }
      );
    }
  }, [triggerLocationUpdate, map, onLocationSelect, setPosition]);

  return null;
}

export default function MapComponent({ onLocationSelect, defaultLocation, triggerLocationUpdate }: MapComponentProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(defaultLocation);

  return (
    <MapContainer 
      center={defaultLocation || DEFAULT_CENTER} 
      zoom={13} 
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      <MapController triggerLocationUpdate={triggerLocationUpdate} position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}

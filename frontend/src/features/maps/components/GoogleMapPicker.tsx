import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { reverseGeocode } from "../services/mapsService";

export interface MapLocation {
  lat: number;
  lng: number;
  formattedAddress?: string;
  placeId?: string;
}

interface LeafletMapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (location: MapLocation) => void;
  className?: string;
}

/** Custom ZestiGo-themed marker icon */
function createCustomIcon(): L.DivIcon {
  return L.divIcon({
    className: "zestigo-leaflet-marker",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#2D6A4F,#40916C);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(45,106,79,0.4);">
          <svg style="transform:rotate(45deg);width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="width:2px;height:8px;background:#2D6A4F;border-radius:0 0 1px 1px;"></div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });
}

export function GoogleMapPicker({ lat, lng, onLocationChange, className }: LeafletMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const customIcon = useRef(createCustomIcon());

  const handlePositionUpdate = useCallback(
    async (newLat: number, newLng: number) => {
      try {
        const result = await reverseGeocode(newLat, newLng);
        onLocationChange(result);
      } catch {
        onLocationChange({ lat: newLat, lng: newLng });
      }
    },
    [onLocationChange],
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent re-initialization
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap tiles — free, no API key
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add draggable marker
    const marker = L.marker([lat, lng], {
      icon: customIcon.current,
      draggable: true,
      title: "Delivery location",
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      handlePositionUpdate(pos.lat, pos.lng);
    });

    // Handle map click
    map.on("click", (e: L.LeafletMouseEvent) => {
      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;
      marker.setLatLng([clickLat, clickLng]);
      handlePositionUpdate(clickLat, clickLng);
    });

    // Fix Leaflet container size on first render
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker & map center when lat/lng props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const currentPos = marker.getLatLng();

    if (Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001) {
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 300, borderRadius: "1rem" }}
    />
  );
}

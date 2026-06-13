import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin, Layers } from "lucide-react";

interface SatelliteViewPanelProps {
  lat: number;
  lng: number;
  className?: string;
}

/**
 * Replaces the Google Street View panel with a Satellite/Aerial view panel
 * using free satellite tile layers. Toggles between aerial and street map view.
 * No API key required.
 */
export function StreetViewPanel({ lat, lng, className }: SatelliteViewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent re-initialization
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      return;
    }

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 17,
      zoomControl: true,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    // Default to satellite view (Esri World Imagery — free)
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "&copy; Esri, Maxar, Earthstar Geographics",
        maxZoom: 19,
      },
    );
    satelliteLayer.addTo(map);
    tileLayerRef.current = satelliteLayer;

    // Add marker
    const icon = L.divIcon({
      className: "zestigo-leaflet-marker",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#2D6A4F,#40916C);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(45,106,79,0.5);border:2px solid white;">
            <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="#2D6A4F"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update position when lat/lng change
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    map.setView([lat, lng], map.getZoom());
    marker.setLatLng([lat, lng]);
  }, [lat, lng]);

  // Toggle tile layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (isSatellite) {
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "&copy; Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
        },
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        },
      ).addTo(map);
    }
  }, [isSatellite]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 300,
        borderRadius: "1rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Layer toggle button */}
      <button
        type="button"
        onClick={() => setIsSatellite((v) => !v)}
        className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-xl bg-card/90 backdrop-blur-sm border border-border/40 px-3 py-2 text-xs font-medium text-foreground shadow-soft transition-all hover:bg-card active:scale-[0.97] cursor-pointer"
        title={isSatellite ? "Switch to Map View" : "Switch to Satellite View"}
      >
        {isSatellite ? (
          <>
            <MapPin className="size-3.5" /> Map
          </>
        ) : (
          <>
            <Layers className="size-3.5" /> Satellite
          </>
        )}
      </button>
    </div>
  );
}

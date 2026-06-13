import { useState, useCallback } from "react";
import { Map, Layers, MapPin } from "lucide-react";
import { useMapReady } from "../hooks/useGoogleMaps";
import { GoogleMapPicker, type MapLocation } from "./GoogleMapPicker";
import { StreetViewPanel } from "./StreetViewPanel";
import { LocationSearch } from "./LocationSearch";
import { CurrentLocationButton } from "./CurrentLocationButton";
import { reverseGeocode } from "../services/mapsService";
import { classNames } from "@/utils/format";

// Default: Bengaluru centre
const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export interface SelectedLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

interface AddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationChange?: (location: SelectedLocation) => void;
}

type ViewMode = "map" | "street";

export function AddressMapPicker({
  initialLat,
  initialLng,
  initialAddress,
  onLocationChange,
}: AddressMapPickerProps) {
  const { isLoaded, loadError } = useMapReady();

  const [lat, setLat] = useState(initialLat ?? DEFAULT_LAT);
  const [lng, setLng] = useState(initialLng ?? DEFAULT_LNG);
  const [address, setAddress] = useState(initialAddress ?? "");
  const [placeId, setPlaceId] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const updateLocation = useCallback(
    (newLat: number, newLng: number, newAddress: string, newPlaceId: string) => {
      setLat(newLat);
      setLng(newLng);
      setAddress(newAddress);
      setPlaceId(newPlaceId);
      onLocationChange?.({
        lat: newLat,
        lng: newLng,
        formattedAddress: newAddress,
        placeId: newPlaceId,
      });
    },
    [onLocationChange],
  );

  const handleMapLocationChange = useCallback(
    (loc: MapLocation) => {
      updateLocation(
        loc.lat,
        loc.lng,
        loc.formattedAddress ?? address,
        loc.placeId ?? placeId,
      );
    },
    [updateLocation, address, placeId],
  );

  const handlePlaceSelect = useCallback(
    (placeLat: number, placeLng: number, formattedAddress: string, id: string) => {
      updateLocation(placeLat, placeLng, formattedAddress, id);
    },
    [updateLocation],
  );

  const handleCurrentLocation = useCallback(
    async (locLat: number, locLng: number) => {
      try {
        const result = await reverseGeocode(locLat, locLng);
        updateLocation(result.lat, result.lng, result.formattedAddress, result.placeId);
      } catch {
        updateLocation(locLat, locLng, "", "");
      }
    },
    [updateLocation],
  );

  // Loading / error states
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/30 border border-border/30 p-8 text-center">
        <MapPin className="size-8 text-destructive mb-3" />
        <p className="text-sm font-semibold text-foreground mb-1">Maps Unavailable</p>
        <p className="text-xs text-muted-foreground max-w-[280px]">{loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/20 border border-border/20 p-8 min-h-[400px]">
        <div className="zestigo-map-skeleton" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading Maps…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Current Location Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <LocationSearch
          onPlaceSelect={handlePlaceSelect}
          initialValue={address}
          className="flex-1"
        />
        <CurrentLocationButton onLocationFound={handleCurrentLocation} />
      </div>

      {/* Mobile: Toggle buttons */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setViewMode("map")}
          className={classNames(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all cursor-pointer",
            viewMode === "map"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary text-foreground hover:bg-accent",
          )}
        >
          <Map className="size-4" /> Map View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("street")}
          className={classNames(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all cursor-pointer",
            viewMode === "street"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary text-foreground hover:bg-accent",
          )}
        >
          <Layers className="size-4" /> Satellite
        </button>
      </div>

      {/* Desktop: side-by-side | Mobile: toggled panels */}
      <div className="zestigo-map-container">
        {/* Map Panel */}
        <div
          className={classNames(
            "zestigo-map-panel rounded-2xl overflow-hidden border border-border/30 shadow-soft",
            viewMode === "street" ? "hidden sm:block" : "",
          )}
        >
          <GoogleMapPicker
            lat={lat}
            lng={lng}
            onLocationChange={handleMapLocationChange}
          />
        </div>

        {/* Street View Panel */}
        <div
          className={classNames(
            "zestigo-sv-panel rounded-2xl overflow-hidden border border-border/30 shadow-soft",
            viewMode === "map" ? "hidden sm:block" : "",
          )}
        >
          <StreetViewPanel lat={lat} lng={lng} />
        </div>
      </div>

      {/* Address preview */}
      {address && (
        <div className="flex items-start gap-3 rounded-2xl bg-secondary/40 border border-border/20 px-4 py-3 animate-fade-in">
          <MapPin className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground break-words">{address}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

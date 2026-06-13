/**
 * Maps utility service — uses free OpenStreetMap Nominatim API for geocoding
 * and browser Geolocation API. No API key required.
 */

export interface GeocodedLocation {
  formattedAddress: string;
  placeId: string;
  lat: number;
  lng: number;
}

/**
 * Reverse-geocode a lat/lng pair using OpenStreetMap Nominatim (free, no key).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "ZestiGo-FoodDelivery/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || data.error) {
    throw new Error(`Geocoding failed: ${data?.error || "No results found"}`);
  }

  return {
    formattedAddress: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    placeId: String(data.osm_id || ""),
    lat,
    lng,
  };
}

/**
 * Search for places using Nominatim (free Places Autocomplete alternative).
 * Restricted to India by default.
 */
export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  osm_id: number;
  place_id: number;
  type: string;
  address?: Record<string, string>;
}

export async function searchPlaces(query: string, countryCode = "in"): Promise<NominatimResult[]> {
  if (!query || query.trim().length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}&limit=5&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "ZestiGo-FoodDelivery/1.0",
    },
  });

  if (!response.ok) return [];

  return response.json();
}

/**
 * Wrapper around the browser Geolocation API that returns a promise.
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please enable it in your browser settings."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred while fetching location."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

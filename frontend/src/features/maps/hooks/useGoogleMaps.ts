import { useState, useEffect } from "react";

/**
 * Hook that manages Leaflet CSS loading.
 * Leaflet is a free, open-source map library — no API key needed.
 * This replaces the Google Maps loader.
 */
export interface UseMapReturn {
  isLoaded: boolean;
  loadError: string | null;
}

let _cssLoaded = false;

export function useMapReady(): UseMapReturn {
  const [isLoaded, setIsLoaded] = useState(_cssLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    // Already loaded
    if (_cssLoaded) {
      setIsLoaded(true);
      return;
    }

    // Check if Leaflet CSS is already in the document
    if (document.querySelector('link[href*="leaflet"]')) {
      _cssLoaded = true;
      setIsLoaded(true);
      return;
    }

    // Inject Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";

    link.onload = () => {
      _cssLoaded = true;
      setIsLoaded(true);
    };

    link.onerror = () => {
      setLoadError("Failed to load map styles. Please check your internet connection.");
    };

    document.head.appendChild(link);
  }, []);

  return { isLoaded, loadError };
}

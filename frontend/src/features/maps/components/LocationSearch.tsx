import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchPlaces, type NominatimResult } from "../services/mapsService";

interface LocationSearchProps {
  onPlaceSelect: (lat: number, lng: number, formattedAddress: string, placeId: string) => void;
  initialValue?: string;
  className?: string;
}

/**
 * Location search with autocomplete using free Nominatim API.
 * Replaces Google Places Autocomplete — no API key required.
 */
export function LocationSearch({ onPlaceSelect, initialValue = "", className }: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(initialValue);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounced search
  const handleInputChange = useCallback((newValue: string) => {
    setValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newValue.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchPlaces(newValue);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const formattedAddress = result.display_name;
      const placeId = String(result.osm_id || result.place_id || "");

      setValue(formattedAddress);
      setIsOpen(false);
      setResults([]);
      onPlaceSelect(lat, lng, formattedAddress, placeId);
    },
    [onPlaceSelect],
  );

  const handleClear = useCallback(() => {
    setValue("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className || ""}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder="Search for your delivery address…"
        className="h-11 w-full rounded-2xl border border-input bg-card pl-10 pr-10 text-sm text-foreground shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-[9999] mt-1 max-h-64 overflow-y-auto rounded-2xl border border-border bg-card shadow-card"
        >
          {results.map((result, idx) => (
            <button
              key={`${result.osm_id || result.place_id}-${idx}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors cursor-pointer border-b border-border/20 last:border-b-0"
            >
              <span className="line-clamp-2">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

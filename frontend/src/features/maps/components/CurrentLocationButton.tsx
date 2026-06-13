import { useState, useCallback } from "react";
import { Crosshair, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCurrentPosition } from "../services/mapsService";

interface CurrentLocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  className?: string;
}

export function CurrentLocationButton({ onLocationFound, className }: CurrentLocationButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      onLocationFound(pos.lat, pos.lng);
      toast.success("Location detected!");
    } catch (err: any) {
      toast.error(err.message || "Failed to get your location.");
    } finally {
      setLoading(false);
    }
  }, [onLocationFound]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-soft transition-all hover:bg-secondary hover:shadow-card active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className || ""}`}
      aria-label="Use my current location"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin text-primary" />
      ) : (
        <Crosshair className="size-4 text-primary" />
      )}
      {loading ? "Locating…" : "Use My Location"}
    </button>
  );
}

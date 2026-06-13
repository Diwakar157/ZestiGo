import { MapPin } from "lucide-react";

interface MiniMapPreviewProps {
  lat?: number;
  lng?: number;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Small static map preview for checkout and address lists.
 * Uses free OpenStreetMap tile server — no API key required.
 * Falls back to a styled pin icon if no coordinates are available.
 */
export function MiniMapPreview({ lat, lng, label, className, size = "sm" }: MiniMapPreviewProps) {
  const hasCoords = lat != null && lng != null;

  const dimensions = size === "sm" ? { w: 120, h: 80 } : { w: 200, h: 140 };

  if (!hasCoords) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-secondary/40 border border-border/20 ${className || ""}`}
        style={{ width: dimensions.w, height: dimensions.h }}
        title={label || "No map preview"}
      >
        <MapPin className="size-5 text-muted-foreground" />
      </div>
    );
  }

  // OpenStreetMap static tile — free, no key required
  // We grab a single 256x256 tile at zoom 15 centered on the location
  const zoom = 15;
  const n = Math.pow(2, zoom);
  const tileX = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const tileY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/20 shadow-soft ${className || ""}`}
      style={{ width: dimensions.w, height: dimensions.h }}
      title={label || "Delivery location preview"}
    >
      <img
        src={tileUrl}
        alt={label ? `Map of ${label}` : "Delivery location preview"}
        width={256}
        height={256}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
        loading="lazy"
        style={{ minWidth: 256, minHeight: 256 }}
      />
      {/* Center pin overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2D6A4F, #40916C)",
            boxShadow: "0 0 0 3px white, 0 2px 8px rgba(45,106,79,0.4)",
          }}
        />
      </div>
    </div>
  );
}

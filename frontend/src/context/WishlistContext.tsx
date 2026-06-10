import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/tanstack-react-start";
import { wishlistService, type Wishlist } from "@/services/wishlistService";

interface WishlistContextValue {
  wishlist: Wishlist;
  isFavorite: (kind: "restaurants" | "foods", id: string) => boolean;
  toggleFavorite: (kind: "restaurants" | "foods", id: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist>({ restaurants: [], foods: [] });
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      wishlistService.getWishlist().then(setWishlist).catch(() => {});
    } else {
      setWishlist({ restaurants: [], foods: [] });
    }
  }, [isSignedIn]);

  function isFavorite(kind: "restaurants" | "foods", id: string) {
    return wishlist[kind].includes(id);
  }

  async function toggleFavorite(kind: "restaurants" | "foods", id: string) {
    try {
      const next = await wishlistService.toggle(kind, id);
      setWishlist(next);
      toast(next[kind].includes(id) ? "Added to wishlist ❤️" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlist, isFavorite, toggleFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

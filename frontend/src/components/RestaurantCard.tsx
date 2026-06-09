import { Link } from "@tanstack/react-router";
import { Bike, Clock, Heart, MapPin } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { classNames, formatCurrency } from "@/utils/format";
import type { Restaurant } from "@/utils/types";
import { RatingBadge } from "./RatingBadge";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { isFavorite, toggleFavorite } = useWishlist();
  const fav = isFavorite("restaurants", restaurant.id);

  return (
    <Link
      to="/restaurant/$id"
      params={{ id: restaurant.id }}
      className="group block overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {restaurant.promoted && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Promoted
          </span>
        )}
        <button
          type="button"
          aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite("restaurants", restaurant.id);
          }}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft transition-transform hover:scale-110"
        >
          <Heart className={classNames("size-4", fav && "fill-destructive text-destructive")} />
        </button>
        {restaurant.deliveryFee === 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            Free delivery
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
          <RatingBadge rating={restaurant.rating} />
        </div>
        <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {restaurant.deliveryTime} min
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {restaurant.distance} km
          </span>
          <span className="flex items-center gap-1">
            <Bike className="size-3.5" />
            {restaurant.deliveryFee === 0 ? "Free" : formatCurrency(restaurant.deliveryFee)}
          </span>
          <span className="ml-auto font-medium text-foreground">{restaurant.priceRange}</span>
        </div>
      </div>
    </Link>
  );
}

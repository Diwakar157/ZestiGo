import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { classNames, formatCurrency } from "@/utils/format";
import type { FoodItem } from "@/utils/types";
import { RatingBadge } from "./RatingBadge";

export function FoodCard({ food }: { food: FoodItem }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const fav = isFavorite("foods", food.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link to="/food/$id" params={{ id: food.id }} className="relative block h-44 overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={classNames(
            "absolute left-3 top-3 flex size-5 items-center justify-center rounded border-2 bg-card",
            food.veg ? "border-primary" : "border-destructive",
          )}
          aria-label={food.veg ? "Vegetarian" : "Non-vegetarian"}
        >
          <span
            className={classNames(
              "size-2 rounded-full",
              food.veg ? "bg-primary" : "bg-destructive",
            )}
          />
        </span>
        <button
          type="button"
          aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite("foods", food.id);
          }}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft transition-transform hover:scale-110"
        >
          <Heart className={classNames("size-4", fav && "fill-destructive text-destructive")} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to="/food/$id" params={{ id: food.id }}>
            <h3 className="font-semibold text-foreground hover:text-primary">{food.name}</h3>
          </Link>
          <RatingBadge rating={food.rating} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{food.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary">{formatCurrency(food.price)}</span>
          <button
            type="button"
            onClick={() => addItem(food)}
            aria-label={`Add ${food.name} to cart`}
            className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition-all hover:bg-primary-glow active:scale-95"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bike, Clock, Heart, MapPin } from "lucide-react";
import { RatingBadge } from "@/components/RatingBadge";
import { FoodCard } from "@/components/FoodCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { restaurantService } from "@/services/restaurantService";
import { foodService } from "@/services/foodService";
import { classNames, formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/restaurant/$id")({
  head: () => ({ meta: [{ title: "Restaurant — Zestigo" }] }),
  component: RestaurantDetails,
});

function RestaurantDetails() {
  const { id } = Route.useParams();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { addRecent } = useRecentlyViewed();
  const [activeCat, setActiveCat] = useState<string>("All");

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => restaurantService.getRestaurantById(id),
  });
  const { data: foods } = useQuery({
    queryKey: ["foods", id],
    queryFn: () => foodService.getFoodsByRestaurant(id),
  });

  useEffect(() => {
    if (restaurant) addRecent(restaurant.id);
  }, [restaurant, addRecent]);

  const menuCats = useMemo(
    () => ["All", ...Array.from(new Set((foods ?? []).map((f) => f.category)))],
    [foods],
  );
  const visible = useMemo(
    () => (activeCat === "All" ? foods : foods?.filter((f) => f.category === activeCat)) ?? [],
    [foods, activeCat],
  );

  if (isLoading) return <LoadingSpinner label="Loading restaurant..." />;
  if (!restaurant)
    return (
      <div className="py-16">
        <EmptyState
          title="Restaurant not found"
          action={
            <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
              <Button>Back to restaurants</Button>
            </Link>
          }
        />
      </div>
    );

  const fav = isFavorite("restaurants", restaurant.id);

  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <img src={restaurant.banner} alt={restaurant.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-16 rounded-4xl bg-card p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {restaurant.name}
                </h1>
                <RatingBadge rating={restaurant.rating} reviews={restaurant.reviews} />
              </div>
              <p className="mt-1 text-muted-foreground">{restaurant.cuisine}</p>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {restaurant.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" /> {restaurant.deliveryTime} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Bike className="size-4 text-primary" />{" "}
                  {restaurant.deliveryFee === 0
                    ? "Free delivery"
                    : formatCurrency(restaurant.deliveryFee)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" /> {restaurant.address}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => toggleFavorite("restaurants", restaurant.id)}>
              <Heart className={classNames("size-4", fav && "fill-destructive text-destructive")} />
              {fav ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {menuCats.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={classNames(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground shadow-soft hover:bg-secondary",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mb-16 mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      </div>
    </div>
  );
}

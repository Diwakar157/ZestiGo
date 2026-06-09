import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useWishlist } from "@/context/WishlistContext";
import { restaurantService } from "@/services/restaurantService";
import { foodService } from "@/services/foodService";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <WishlistPage />
    </ProtectedRoute>
  ),
});

function WishlistPage() {
  const { wishlist } = useWishlist();
  const { data: restaurants } = useQuery({
    queryKey: ["all-restaurants"],
    queryFn: () => restaurantService.getRestaurants(),
  });
  const { data: foods } = useQuery({
    queryKey: ["all-foods"],
    queryFn: () => foodService.getFoods(),
  });

  const favRestaurants = restaurants?.filter((r) => wishlist.restaurants.includes(r.id)) ?? [];
  const favFoods = foods?.filter((f) => wishlist.foods.includes(f.id)) ?? [];
  const empty = !favRestaurants.length && !favFoods.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">My wishlist</h1>
      {empty ? (
        <div className="mt-8">
          <EmptyState
            icon={<Heart className="size-7" />}
            title="Your wishlist is empty"
            description="Tap the heart on any restaurant or dish to save it here."
            action={
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <Button>Explore</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {favRestaurants.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Favorite restaurants</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {favRestaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </section>
          )}
          {favFoods.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Favorite dishes</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {favFoods.map((f) => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { RatingBadge } from "@/components/RatingBadge";
import { FoodCard } from "@/components/FoodCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useCart } from "@/context/CartContext";
import { foodService } from "@/services/foodService";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/food/$id")({
  head: () => ({ meta: [{ title: "Dish — Zestigo" }] }),
  component: FoodDetails,
});

function FoodDetails() {
  const { id } = Route.useParams();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const { data: food, isLoading } = useQuery({
    queryKey: ["food", id],
    queryFn: () => foodService.getFoodById(id),
  });
  const { data: recommended } = useQuery({
    queryKey: ["recommended"],
    queryFn: () => foodService.getRecommended(),
  });

  if (isLoading) return <LoadingSpinner label="Loading dish..." />;
  if (!food)
    return (
      <div className="py-16">
        <EmptyState
          title="Dish not found"
          action={
            <Link to="/restaurants">
              <Button>Browse restaurants</Button>
            </Link>
          }
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <img
          src={food.image}
          alt={food.name}
          className="aspect-[4/3] w-full rounded-4xl object-cover shadow-card"
        />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{food.name}</h1>
            <RatingBadge rating={food.rating} reviews={food.reviews} />
          </div>
          <p className="mt-3 text-muted-foreground">{food.description}</p>
          <p className="mt-6 text-3xl font-bold text-primary">{formatCurrency(food.price)}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="inline-flex items-center gap-4 rounded-full bg-card px-3 py-2 shadow-soft">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="flex size-9 items-center justify-center rounded-full bg-secondary"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase"
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button size="lg" onClick={() => addItem(food, qty)}>
              Add to cart • {formatCurrency(food.price * qty)}
            </Button>
          </div>
          <Link
            to="/restaurant/$id"
            params={{ id: food.restaurantId }}
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            View full restaurant menu →
          </Link>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-foreground">Recommended for you</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommended?.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SkeletonGrid } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { restaurantService } from "@/services/restaurantService";

export const Route = createFileRoute("/restaurants")({
  validateSearch: (s: Record<string, unknown>) => ({
    search: (s.search as string) || undefined,
    category: (s.category as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Restaurants — Zestigo" },
      { name: "description", content: "Browse and filter restaurants on Zestigo." },
    ],
  }),
  component: Restaurants,
});

const PER_PAGE = 4;

function Restaurants() {
  const { search, category } = Route.useSearch();
  const [sort, setSort] = useState<"rating" | "delivery" | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => restaurantService.getCategories(),
  });
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants", search, category, sort],
    queryFn: () => restaurantService.getRestaurants({ search, categoryId: category, sort }),
  });

  const paged = useMemo(() => restaurants?.slice(0, page * PER_PAGE) ?? [], [restaurants, page]);
  const hasMore = (restaurants?.length ?? 0) > paged.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Restaurants</h1>
      <p className="mt-1 text-muted-foreground">Find your next favorite meal.</p>

      <div className="mt-6">
        <SearchBar />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="size-4" /> Sort:
        </span>
        <FilterPill active={!sort} onClick={() => setSort(undefined)}>
          Default
        </FilterPill>
        <FilterPill active={sort === "rating"} onClick={() => setSort("rating")}>
          Top rated
        </FilterPill>
        <FilterPill active={sort === "delivery"} onClick={() => setSort("delivery")}>
          Fastest
        </FilterPill>
        <div className="ml-auto flex flex-wrap gap-2">
          {categories?.slice(0, 4).map((c) => (
            <FilterPill key={c.id} active={category === c.id} onClick={() => undefined}>
              {c.icon} {c.name}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : paged.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="size-7" />}
            title="No restaurants found"
            description="Try a different search or category."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" size="lg" onClick={() => setPage((p) => p + 1)}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-card text-foreground shadow-soft hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

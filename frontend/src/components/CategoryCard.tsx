import { Link } from "@tanstack/react-router";
import type { Category } from "@/utils/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/restaurants"
      search={{ category: category.id }}
      className="group flex flex-col items-center gap-2"
    >
      <div className="relative size-20 overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card sm:size-24">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute bottom-1 right-1 text-xl">{category.icon}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{category.name}</span>
    </Link>
  );
}

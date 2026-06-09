import { Star } from "lucide-react";
import { classNames } from "@/utils/format";

export function RatingBadge({
  rating,
  reviews,
  className,
}: {
  rating: number;
  reviews?: number;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground",
        className,
      )}
    >
      <Star className="size-3.5 fill-current" />
      {rating.toFixed(1)}
      {reviews != null && <span className="font-normal opacity-80">({reviews})</span>}
    </span>
  );
}

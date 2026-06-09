import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function OfferBanner({
  title,
  subtitle,
  code,
}: {
  title: string;
  subtitle: string;
  code?: string;
}) {
  return (
    <Link
      to="/offers"
      className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-card transition-all duration-300 hover:shadow-elevated"
    >
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -bottom-10 right-10 size-24 rounded-full bg-primary-foreground/10" />
      <div className="relative">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1 text-sm opacity-90">{subtitle}</p>
      </div>
      <div className="relative flex items-center justify-between">
        {code && (
          <span className="rounded-full border border-primary-foreground/40 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold tracking-wide">
            {code}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1">
          Grab now <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

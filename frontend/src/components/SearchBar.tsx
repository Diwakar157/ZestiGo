import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { restaurantService } from "@/services/restaurantService";
import { useDebounce } from "@/hooks/useDebounce";
import type { Restaurant } from "@/utils/types";
import { Button } from "./Button";
import { classNames } from "@/utils/format";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Restaurant[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 250);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    restaurantService
      .getRestaurants({ search: debounced })
      .then((r) => setSuggestions(r.slice(0, 5)));
  }, [debounced]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(value: string) {
    setOpen(false);
    navigate({ to: "/restaurants", search: { search: value || undefined } });
  }

  return (
    <div ref={ref} className={classNames("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-card"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search for biryani, dosa, pizza, restaurants..."
            aria-label="Search restaurants"
            className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button type="submit" size="md" className="shrink-0">
          Search
        </Button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-popover shadow-elevated animate-fade-in">
          {suggestions.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => submit(r.name)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
              >
                <img src={r.image} alt="" className="size-10 rounded-xl object-cover" />
                <span>
                  <span className="block text-sm font-medium text-foreground">{r.name}</span>
                  <span className="block text-xs text-muted-foreground">{r.cuisine}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

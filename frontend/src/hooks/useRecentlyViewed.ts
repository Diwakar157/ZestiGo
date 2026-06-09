import { useCallback, useEffect, useState } from "react";
import { restaurantService } from "@/services/restaurantService";
import type { Restaurant } from "@/utils/types";

const KEY = "qb_recent";

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<Restaurant[]>([]);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    Promise.all(ids.map((id) => restaurantService.getRestaurantById(id))).then((list) =>
      setRecent(list.filter(Boolean) as Restaurant[]),
    );
  }, []);

  const addRecent = useCallback((id: string) => {
    const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, 6);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  return { recent, addRecent };
}

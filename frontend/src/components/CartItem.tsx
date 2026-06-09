import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import type { CartItem as CartItemType } from "@/utils/types";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();
  const { food, quantity } = item;

  return (
    <div className="flex items-center gap-4 rounded-3xl bg-card p-3 shadow-soft">
      <img src={food.image} alt={food.name} className="size-20 rounded-2xl object-cover" />
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold text-foreground">{food.name}</h4>
        <p className="text-sm text-muted-foreground">{formatCurrency(food.price)}</p>
        <div className="mt-2 inline-flex items-center gap-3 rounded-full bg-secondary px-2 py-1">
          <button
            onClick={() => updateQuantity(food.id, quantity - 1)}
            aria-label="Decrease quantity"
            className="flex size-7 items-center justify-center rounded-full bg-card text-foreground shadow-soft transition-transform active:scale-90"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
          <button
            onClick={() => updateQuantity(food.id, quantity + 1)}
            aria-label="Increase quantity"
            className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform active:scale-90"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-bold text-foreground">{formatCurrency(food.price * quantity)}</span>
        <button
          onClick={() => removeItem(food.id)}
          aria-label={`Remove ${food.name}`}
          className="text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

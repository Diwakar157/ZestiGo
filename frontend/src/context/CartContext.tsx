import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cartService } from "@/services/cartService";
import type { CartItem, FoodItem } from "@/utils/types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (food: FoodItem, quantity?: number) => Promise<void>;
  removeItem: (foodId: string) => Promise<void>;
  updateQuantity: (foodId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    cartService.getCart().then(setItems).catch(() => {});
  }, []);

  async function addItem(food: FoodItem, quantity = 1) {
    try {
      const next = await cartService.addItem(food.id, quantity);
      setItems(next);
      toast.success(`${food.name} added to cart`);
    } catch {
      toast.error("Failed to add item to cart");
    }
  }

  async function removeItem(foodId: string) {
    try {
      const next = await cartService.removeItem(foodId);
      setItems(next);
    } catch {
      toast.error("Failed to remove item");
    }
  }

  async function updateQuantity(foodId: string, quantity: number) {
    try {
      const next = await cartService.updateQuantity(foodId, quantity);
      setItems(next);
    } catch {
      toast.error("Failed to update quantity");
    }
  }

  async function clearCart() {
    try {
      await cartService.clearCart();
      setItems([]);
    } catch {
      toast.error("Failed to clear cart");
    }
  }

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.quantity * i.food.price, 0),
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import type { CartItem, Order } from "@/utils/types";

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders(),
  });
}

export function useOrder(
  orderId: string,
  refetchInterval: number | false | ((query: any) => number | false) = false
) {
  return useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    refetchInterval,
    enabled: !!orderId,
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation<CartItem[], Error, string>({
    mutationFn: (orderId: string) => orderService.reorderOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

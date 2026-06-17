import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  // Order statuses
  PENDING_PAYMENT: { label: "Pending Payment", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "info" },
  PREPARING: { label: "Preparing", variant: "info" },
  PICKED_UP: { label: "Picked Up", variant: "secondary" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },

  // Payment statuses
  PENDING: { label: "Pending", variant: "warning" },
  SUCCESS: { label: "Paid", variant: "success" },
  FAILED: { label: "Failed", variant: "destructive" },

  // Restaurant statuses
  ACTIVE: { label: "Active", variant: "success" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },

  // User statuses
  blocked: { label: "Blocked", variant: "destructive" },
  active: { label: "Active", variant: "success" },

  // Delivery partner
  online: { label: "Online", variant: "success" },
  offline: { label: "Offline", variant: "secondary" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

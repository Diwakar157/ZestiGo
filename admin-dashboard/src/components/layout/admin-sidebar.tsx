"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  Truck,
  BarChart3,
  ChevronLeft,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Restaurants", href: "/admin/restaurants", icon: Store },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Delivery", href: "/admin/delivery", icon: Truck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebarStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out",
          "bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]",
          isCollapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold tracking-tight">ZestiGo</h1>
              <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--sidebar-muted-foreground))]">
                Admin
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-[hsl(var(--sidebar-border))]" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[hsl(var(--sidebar-primary))] text-white shadow-md shadow-[hsl(var(--sidebar-primary))/0.3]"
                    : "text-[hsl(var(--sidebar-muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="w-full text-[hsl(var(--sidebar-muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

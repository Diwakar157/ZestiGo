"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
        )}
      >
        <AdminHeader />
        <main className="p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

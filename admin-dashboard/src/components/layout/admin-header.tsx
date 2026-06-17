"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar-store";
import { getNotifications, type NotificationItem } from "@/lib/actions/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function AdminHeader() {
  const { setMobileOpen } = useSidebarStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    // Read readIds from localStorage
    const saved = localStorage.getItem("zestigo_read_notifications");
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchNotifications() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    }

    fetchNotifications();

    // Poll every 30 seconds for new alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem("zestigo_read_notifications", JSON.stringify(allIds));
  };

  const handleNotificationClick = (id: string) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      setReadIds(newReadIds);
      localStorage.setItem("zestigo_read_notifications", JSON.stringify(newReadIds));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      {/* Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative cursor-pointer">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-4">
            <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = readIds.includes(n.id);
                return (
                  <DropdownMenuItem
                    key={n.id}
                    asChild
                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer transition-colors focus:bg-muted ${
                      !isRead ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(n.id)}
                  >
                    <Link href={n.link} className="w-full">
                      <div className="flex items-start justify-between w-full">
                        <span className="font-semibold text-xs text-foreground">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                    </Link>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clerk User Button */}
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    </header>
  );
}

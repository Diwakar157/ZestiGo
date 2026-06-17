"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle, Ban, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, truncate } from "@/lib/utils";
import { updateRestaurantStatus, deleteRestaurant } from "@/lib/actions/restaurants";
import { toast } from "sonner";
import type { PaginatedResult, RestaurantWithStats } from "@/types";
import type { RestaurantStatus } from "@prisma/client";

const STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "PENDING", label: "Pending" },
];

interface Props {
  result: PaginatedResult<RestaurantWithStats>;
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
}

export function RestaurantsContent({ result, currentPage, currentSearch, currentStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== "ALL" && v !== "") sp.set(k, v);
      else sp.delete(k);
    });
    if (params.search !== undefined || params.status !== undefined) sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  async function handleStatusUpdate(id: string, status: RestaurantStatus) {
    startTransition(async () => {
      try {
        await updateRestaurantStatus(id, status);
        toast.success(`Restaurant ${status === "ACTIVE" ? "approved" : status === "SUSPENDED" ? "suspended" : "updated"}`);
        router.refresh();
      } catch {
        toast.error("Failed to update restaurant");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteRestaurant(id);
        toast.success("Restaurant deleted");
        router.refresh();
      } catch {
        toast.error("Failed to delete restaurant");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">Manage restaurant listings and approvals</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Restaurants</CardTitle>
              <CardDescription>{result.total} restaurants</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants…"
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateParams({ search })}
                />
              </div>
              <Select value={currentStatus} onValueChange={(v) => updateParams({ status: v })}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{truncate(restaurant.cuisine, 25)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{restaurant.rating.toString()}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={restaurant.status} /></TableCell>
                  <TableCell>{restaurant._count.orders}</TableCell>
                  <TableCell>{restaurant._count.foodItems}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(restaurant.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {restaurant.status !== "ACTIVE" && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(restaurant.id, "ACTIVE")} disabled={isPending}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                          </DropdownMenuItem>
                        )}
                        {restaurant.status !== "SUSPENDED" && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(restaurant.id, "SUSPENDED")} disabled={isPending}>
                            <Ban className="mr-2 h-4 w-4 text-orange-600" /> Suspend
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(restaurant.id)} disabled={isPending} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {result.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No restaurants found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground">Page {currentPage} of {result.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => updateParams({ page: String(currentPage - 1) })}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={currentPage >= result.totalPages} onClick={() => updateParams({ page: String(currentPage + 1) })}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

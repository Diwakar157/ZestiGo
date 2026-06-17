"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Ban, ShieldCheck, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { toggleUserBlock, deleteUser } from "@/lib/actions/users";
import { toast } from "sonner";
import type { PaginatedResult, UserWithStats } from "@/types";

const ROLES = [
  { value: "ALL", label: "All Users" },
  { value: "ROLE_USER", label: "Customers" },
  { value: "ROLE_DELIVERY", label: "Delivery" },
  { value: "ROLE_ADMIN", label: "Admins" },
];

interface Props {
  result: PaginatedResult<UserWithStats>;
  currentPage: number;
  currentSearch: string;
  currentRole: string;
}

export function UsersContent({ result, currentPage, currentSearch, currentRole }: Props) {
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
    if (params.search !== undefined || params.role !== undefined) sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  async function handleToggleBlock(userId: string, blocked: boolean) {
    startTransition(async () => {
      try {
        await toggleUserBlock(userId, blocked);
        toast.success(blocked ? "User blocked" : "User unblocked");
        router.refresh();
      } catch {
        toast.error("Failed to update user");
      }
    });
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("User deleted");
        router.refresh();
      } catch {
        toast.error("Failed to delete user");
      }
    });
  }

  function roleLabel(role: string) {
    switch (role) {
      case "ROLE_USER": return "Customer";
      case "ROLE_ADMIN": return "Admin";
      case "ROLE_DELIVERY": return "Delivery";
      default: return role;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage customers and delivery partners</p>
      </div>

      <Tabs value={currentRole} onValueChange={(v) => updateParams({ role: v })}>
        <TabsList>
          {ROLES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>{r.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Users</CardTitle>
              <CardDescription>{result.total} users</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-9 w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateParams({ search })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar ?? undefined} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.phone || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{roleLabel(user.role)}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.provider}</TableCell>
                  <TableCell><StatusBadge status={user.isBlocked ? "blocked" : "active"} /></TableCell>
                  <TableCell>{user._count.orders}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {user.isBlocked ? (
                          <DropdownMenuItem onClick={() => handleToggleBlock(user.id, false)} disabled={isPending}>
                            <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Unblock
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleBlock(user.id, true)} disabled={isPending}>
                            <Ban className="mr-2 h-4 w-4 text-orange-600" /> Block
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(user.id)} disabled={isPending} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {result.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No users found</TableCell>
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

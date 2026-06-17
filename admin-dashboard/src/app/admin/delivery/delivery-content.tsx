"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, ChevronLeft, ChevronRight, Truck, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { toggleDeliveryAvailability } from "@/lib/actions/delivery";
import { toast } from "sonner";
import type { PaginatedResult, DeliveryPartnerWithUser } from "@/types";

interface Props {
  result: PaginatedResult<DeliveryPartnerWithUser>;
  currentPage: number;
  currentSearch: string;
}

export function DeliveryContent({ result, currentPage, currentSearch }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== "") sp.set(k, v);
      else sp.delete(k);
    });
    if (params.search !== undefined) sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  async function handleToggle(id: string, available: boolean) {
    startTransition(async () => {
      try {
        await toggleDeliveryAvailability(id, available);
        toast.success(available ? "Partner set to online" : "Partner set to offline");
        router.refresh();
      } catch {
        toast.error("Failed to update partner");
      }
    });
  }

  const totalEarnings = result.data.reduce((sum, p) => sum + Number(p.earnings), 0);
  const onlineCount = result.data.filter((p) => p.isAvailable).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery Partners</h1>
        <p className="text-muted-foreground">Manage delivery partner availability and track earnings</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
              <Truck className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{result.total}</p>
              <p className="text-sm text-muted-foreground">Total Partners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onlineCount}</p>
              <p className="text-sm text-muted-foreground">Online Now</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <IndianRupee className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Partners</CardTitle>
              <CardDescription>{result.total} delivery partners</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search partners…"
                className="pl-9 w-64"
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
                <TableHead>Partner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="w-24">Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={partner.user.avatar ?? undefined} />
                        <AvatarFallback>{partner.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{partner.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{partner.user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{partner.user.phone || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{partner.vehicleType}</Badge></TableCell>
                  <TableCell><StatusBadge status={partner.isAvailable ? "online" : "offline"} /></TableCell>
                  <TableCell className="font-medium">{formatCurrency(partner.earnings.toString())}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={partner.isAvailable ? "outline" : "default"}
                      onClick={() => handleToggle(partner.id, !partner.isAvailable)}
                      disabled={isPending}
                      className="w-20 text-xs"
                    >
                      {partner.isAvailable ? "Go Offline" : "Go Online"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {result.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No delivery partners found
                  </TableCell>
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

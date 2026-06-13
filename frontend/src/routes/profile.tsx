import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, MapPin, Settings, User, Plus, Trash2, Pencil } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@clerk/tanstack-react-start";
import { authService } from "@/services/authService";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddressMapPicker, type SelectedLocation } from "@/features/maps/components/AddressMapPicker";
import { MiniMapPreview } from "@/features/maps/components/MiniMapPreview";
import type { Address } from "@/utils/types";

export const Route = createFileRoute("/profile")({
  validateSearch: (s: Record<string, unknown>) => ({
    addAddress: s.addAddress === "true" || s.addAddress === true || undefined,
    redirectBack: (s.redirectBack as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "My Profile — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  ),
});

function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { addAddress, redirectBack } = Route.useSearch();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const { data: addresses, refetch, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authService.getAddresses(),
  });

  const defaultAddressId = addresses?.find((a) => a.isDefault)?.id || null;

  useEffect(() => {
    if (addAddress) {
      handleOpenAdd();
    }
  }, [addAddress]);

  const makeDefault = async (id: string) => {
    const addr = addresses?.find((a) => a.id === id);
    if (!addr) return;
    try {
      await authService.updateAddress(id, { label: addr.label, line: addr.line, isDefault: true, latitude: addr.latitude, longitude: addr.longitude, placeId: addr.placeId });
      toast.success("Default address updated!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to set default address.");
    }
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setLabel("");
    setLine("");
    setLatitude(undefined);
    setLongitude(undefined);
    setPlaceId(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setLine(addr.line);
    setLatitude(addr.latitude);
    setLongitude(addr.longitude);
    setPlaceId(addr.placeId);
    setDialogOpen(true);
  };

  const handleLocationChange = (location: SelectedLocation) => {
    setLine(location.formattedAddress);
    setLatitude(location.lat);
    setLongitude(location.lng);
    setPlaceId(location.placeId);

    // Automatically derive label from place name if currently empty or unset
    if (!label.trim()) {
      const derived = location.formattedAddress.split(",")[0].trim();
      // Ensure it doesn't exceed database constraints (50 chars max in addresses table label column)
      setLabel(derived.substring(0, 50));
    }
  };

  const handleSave = async () => {
    if (!label.trim() || !line.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSaving(true);
    try {
      if (editingAddress) {
        await authService.updateAddress(editingAddress.id, {
          label,
          line,
          isDefault: editingAddress.isDefault,
          latitude,
          longitude,
          placeId,
        });
        toast.success("Address updated successfully!");
      } else {
        await authService.addAddress({
          label,
          line,
          isDefault: !addresses || addresses.length === 0,
          latitude,
          longitude,
          placeId,
        });
        toast.success("Address added successfully!");
      }
      setDialogOpen(false);
      refetch();
      if (redirectBack) {
        navigate({ to: redirectBack });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await authService.deleteAddress(id);
      toast.success("Address deleted successfully!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-5 rounded-4xl bg-card p-6 shadow-card">
        <img src={user?.imageUrl} alt={user?.fullName ?? ""} className="size-20 rounded-3xl object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user?.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress} • {user?.primaryPhoneNumber?.phoneNumber ?? "No phone"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card icon={User} title="Account information">
          <Field label="Name" value={user?.fullName ?? ""} />
          <Field label="Email" value={user?.primaryEmailAddress?.emailAddress ?? ""} />
          <Field label="Phone" value={user?.primaryPhoneNumber?.phoneNumber ?? "Not set"} />
        </Card>

        <section className="rounded-3xl bg-card p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="size-5 text-primary" /> Saved addresses
              </h2>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" /> Add
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-full animate-pulse rounded bg-secondary/50" />
                <div className="h-10 w-full animate-pulse rounded bg-secondary/50" />
              </div>
            ) : !addresses || addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No saved addresses yet. Add one to complete orders.
              </p>
            ) : (
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {addresses.map((addr) => {
                  const isDefault = defaultAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      className="flex items-center gap-3 border-b border-border/50 pb-2.5 text-sm last:border-0 last:pb-0"
                    >
                      {/* Mini map preview */}
                      <MiniMapPreview
                        lat={addr.latitude}
                        lng={addr.longitude}
                        label={addr.label}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <div className="flex flex-col pr-4 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground capitalize truncate">{addr.label}</span>
                            {isDefault && (
                              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary tracking-wide">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 break-words line-clamp-2">{addr.line}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          {!isDefault && (
                            <button
                              onClick={() => makeDefault(addr.id)}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(addr)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Address"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Delete Address"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <Card icon={CreditCard} title="Payment methods">
          <Field label="UPI" value="aarav@okhdfcbank" />
          <Field label="Wallet" value="₹450.00 balance" />
          <div className="pt-2 text-right">
            <Link to="/payment-history" className="text-xs font-semibold text-primary hover:underline">
              View Transaction History →
            </Link>
          </div>
        </Card>

        <Card icon={Settings} title="Preferences">
          <Field label="Notifications" value="Enabled" />
          <Field label="Dietary" value="Vegetarian-friendly" />
        </Card>
      </div>

      {/* Address dialog with Map Picker */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <InputField
              label="Label (e.g. Home, Work)"
              placeholder="e.g. Home"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            {/* Google Maps Picker */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Select Location
              </label>
              <AddressMapPicker
                initialLat={latitude}
                initialLng={longitude}
                initialAddress={line}
                onLocationChange={handleLocationChange}
              />
            </div>

            {/* Address line (auto-filled from map, but editable) */}
            <InputField
              label="Address Line"
              placeholder="e.g. 12, 4th Block, Koramangala, Bengaluru"
              value={line}
              onChange={(e) => setLine(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-6 shadow-soft">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <Icon className="size-5 text-primary" /> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

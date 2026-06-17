import { AdminGate } from "@/components/layout/admin-gate";
import AdminLayoutClient from "./admin-layout-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminGate>
  );
}

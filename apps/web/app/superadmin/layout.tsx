import { ProtectedAdminShell } from "@/components/admin/protected-admin-shell";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedAdminShell superAdmin>{children}</ProtectedAdminShell>
  );
}

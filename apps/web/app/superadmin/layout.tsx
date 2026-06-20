import { ProtectedAdminShell } from "@/components/protected-admin-shell";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedAdminShell superAdmin>{children}</ProtectedAdminShell>
  );
}

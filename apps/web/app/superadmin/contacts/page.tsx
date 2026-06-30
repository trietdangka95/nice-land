import { Suspense } from "react";
import { SuperAdminRequestsScreen } from "@/components/superadmin/superadmin-requests-screen";

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse border border-ink/10 bg-white" />}>
      <SuperAdminRequestsScreen />
    </Suspense>
  );
}

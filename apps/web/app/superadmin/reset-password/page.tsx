import { ResetPasswordForm } from "@/components/password-recovery-form";

export default async function SuperAdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <ResetPasswordForm superAdmin token={query.token ?? ""} />
    </main>
  );
}

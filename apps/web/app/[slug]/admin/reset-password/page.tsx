import { ResetPasswordForm } from "@/components/password-recovery-form";

export default async function AdminResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <ResetPasswordForm slug={slug} token={query.token ?? ""} />
    </main>
  );
}

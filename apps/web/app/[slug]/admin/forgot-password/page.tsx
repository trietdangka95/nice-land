import { ForgotPasswordForm } from "@/components/password-recovery-form";

export default async function AdminForgotPasswordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <ForgotPasswordForm slug={slug} />
    </main>
  );
}

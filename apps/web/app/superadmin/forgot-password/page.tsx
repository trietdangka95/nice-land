import { ForgotPasswordForm } from "@/components/password-recovery-form";

export default function SuperAdminForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <ForgotPasswordForm superAdmin />
    </main>
  );
}

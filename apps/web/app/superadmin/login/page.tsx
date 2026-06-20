import { LoginForm } from "@/components/login-form";

export default function SuperAdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <LoginForm superAdmin />
    </main>
  );
}

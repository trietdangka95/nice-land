import { LoginForm } from "@/components/login-form";

export default async function AdminLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <LoginForm slug={slug} />
    </main>
  );
}

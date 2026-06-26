import { LoginForm } from "@/components/login-form";

export default async function AdminLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="relative grid min-h-screen place-items-center bg-background px-5 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-moss/15 gradient-glow z-0 pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/20 gradient-glow animation-delay-2000 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-leaf/10 gradient-glow animation-delay-4000 z-0 pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-md">
        <LoginForm slug={slug} />
      </div>
    </main>
  );
}

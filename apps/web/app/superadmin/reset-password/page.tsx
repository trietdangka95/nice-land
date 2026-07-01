import { headers } from "next/headers";
import { ResetPasswordForm } from "@/components/shared/password-recovery-form";

async function buildResetUrl(token: string) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "www.nice-land.id.vn";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const url = new URL("/superadmin/reset-password", `${protocol}://${host}`);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

export default async function SuperAdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const query = await searchParams;
  const token = query.token ?? "";
  const resetUrl = await buildResetUrl(token);
  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden overflow-y-auto bg-background px-5 py-8 sm:py-10">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-moss/15 gradient-glow z-0 pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/20 gradient-glow animation-delay-2000 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-leaf/10 gradient-glow animation-delay-4000 z-0 pointer-events-none"></div>
      <div className="relative z-10 my-auto w-full max-w-md">
        <ResetPasswordForm superAdmin token={token} resetUrl={resetUrl} />
      </div>
    </main>
  );
}

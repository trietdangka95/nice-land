import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeShowcase } from "@/components/theme-showcase";

export default async function ThemeGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-white">
        <div className="page-shell flex h-20 items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold">
            <ArrowLeft size={16} />
            Về Nice Land
          </Link>
        </div>
      </header>
      <section className="page-shell py-16 sm:py-24">
        <p className="eyebrow">Thư viện giao diện</p>
        <h1 className="mt-4 max-w-4xl text-balance font-display text-5xl leading-tight sm:text-7xl">
          Cùng tính năng, bốn phong cách để khách nhớ đến bạn.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">
          Xem website mẫu bằng cùng một bộ dữ liệu để so sánh bố cục, font chữ
          và cảm giác thương hiệu. Logo, tên, màu và nội dung sẽ được thay bằng
          thông tin của bạn khi website được khởi tạo.
        </p>
        {plan && (
          <p className="mt-6 inline-flex border border-moss/20 bg-white px-4 py-3 text-sm font-semibold text-moss">
            Gói đang quan tâm: {plan}
          </p>
        )}
        <div className="mt-12">
          <ThemeShowcase selectedPlan={plan} />
        </div>
      </section>
    </main>
  );
}

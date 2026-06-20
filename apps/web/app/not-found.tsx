import Link from "next/link";
import { MapPinned } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 text-center">
      <div>
        <MapPinned className="mx-auto text-moss" size={48} strokeWidth={1.4} />
        <p className="mt-6 font-display text-8xl font-medium text-moss">404</p>
        <h1 className="mt-3 font-display text-3xl">Không tìm thấy địa chỉ này</h1>
        <p className="mt-3 text-sm text-ink/50">Trang có thể đã được chuyển hoặc không còn tồn tại.</p>
        <Link href="/" className="button-primary mt-7">Về trang chủ</Link>
      </div>
    </main>
  );
}

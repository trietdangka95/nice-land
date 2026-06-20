import { Globe2, Save } from "lucide-react";

export default function CreateSitePage() {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tenant mới</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Tạo website khách hàng</h1>
      <p className="mt-2 text-sm text-ink/50">Khởi tạo website, tài khoản admin và gói dịch vụ trong một bước.</p>
      <form className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-display text-2xl">Thông tin website</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ["Tên website", "Ví dụ: Nhà Đất Hoàng Minh"],
              ["Subdomain", "hoangminh"],
              ["Tên quản trị viên", "Nguyễn Hoàng Minh"],
              ["Số điện thoại", "09xx xxx xxx"],
              ["Email", "admin@congty.vn"],
              ["Tên đăng nhập", "admin.hoangminh"],
            ].map(([label, placeholder]) => (
              <label key={label} className="grid gap-2 text-sm font-bold">{label}<input className="h-12 border border-ink/15 px-4 font-normal" placeholder={placeholder} /></label>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="border border-ink/10 bg-white p-6">
            <Globe2 className="text-moss" />
            <h2 className="mt-4 font-display text-2xl">Gói dịch vụ</h2>
            <select className="mt-5 h-12 w-full border border-ink/15 px-4 text-sm"><option>Chuyên nghiệp — 599.000đ</option><option>Khởi đầu — 299.000đ</option><option>Doanh nghiệp — 1.299.000đ</option></select>
            <label className="mt-5 grid gap-2 text-sm font-bold">Ngày hết hạn<input type="date" className="h-12 border border-ink/15 px-4 font-normal" /></label>
          </section>
          <button className="button-primary w-full"><Save size={17} /> Tạo website</button>
        </aside>
      </form>
    </>
  );
}

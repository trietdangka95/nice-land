import { CalendarDays, Check, Gauge } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tài khoản & dịch vụ</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Gói dịch vụ</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="border border-ink/10 bg-white p-7">
          <span className="text-xs font-bold uppercase tracking-widest text-moss">Gói hiện tại</span>
          <h2 className="mt-3 font-display text-4xl">Chuyên nghiệp</h2>
          <p className="mt-3 text-sm text-ink/50">Dành cho đội ngũ vận hành nội dung thường xuyên.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {["150 tin đăng", "20 ảnh mỗi tin", "Tùy chỉnh giao diện", "Hỗ trợ ưu tiên"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={14} /></span>
                {item}
              </div>
            ))}
          </div>
        </section>
        <aside className="border border-ink/10 bg-ink p-7 text-white">
          <CalendarDays className="text-gold" />
          <p className="mt-5 text-xs uppercase tracking-widest text-white/45">Ngày gia hạn</p>
          <strong className="mt-2 block font-display text-3xl">30/06/2027</strong>
          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
            <Gauge className="text-gold" size={19} />
            <span className="text-sm text-white/65">Còn 102 / 150 tin đăng</span>
          </div>
          <button className="mt-6 w-full bg-gold px-5 py-3 text-sm font-bold text-ink">Gửi yêu cầu gia hạn</button>
        </aside>
      </div>
    </>
  );
}

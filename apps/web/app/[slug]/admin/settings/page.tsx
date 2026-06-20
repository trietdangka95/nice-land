import { Check, Palette, Save } from "lucide-react";

export default function SiteSettingsPage() {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Nhận diện thương hiệu</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Cấu hình website</h1>
      <p className="mt-2 text-sm text-ink/50">Cập nhật hình ảnh và thông tin hiển thị với khách hàng.</p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-display text-2xl">Thông tin thương hiệu</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ["Tên website", "Nhà Đất Minh Phát"],
              ["Slogan", "Chọn đúng nơi, dựng đúng tổ ấm"],
              ["Số điện thoại", "0903 868 979"],
              ["Email", "hello@minhphat.vn"],
              ["Địa chỉ", "28 Nguyễn Văn Linh, Hải Châu, Đà Nẵng"],
              ["Zalo", "0903868979"],
            ].map(([label, value]) => (
              <label key={label} className={`grid gap-2 text-sm font-bold ${label === "Địa chỉ" ? "sm:col-span-2" : ""}`}>
                {label}
                <input defaultValue={value} className="h-12 border border-ink/15 px-4 font-normal" />
              </label>
            ))}
          </div>
          <button className="button-primary mt-7">
            <Save size={17} /> Lưu thay đổi
          </button>
        </section>
        <aside className="border border-ink/10 bg-white p-6">
          <Palette className="text-moss" />
          <h2 className="mt-4 font-display text-2xl">Màu chủ đạo</h2>
          <p className="mt-2 text-sm leading-6 text-ink/50">Màu này được dùng cho nút, liên kết và các điểm nhấn.</p>
          <div className="mt-6 grid grid-cols-5 gap-3">
            {["#315c45", "#8b5a3c", "#24405e", "#6b4f7d", "#9a6d22"].map((color, index) => (
              <button key={color} className="grid aspect-square place-items-center rounded-full" style={{ backgroundColor: color }} aria-label={`Chọn màu ${color}`}>
                {index === 0 && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, ImagePlus, Save } from "lucide-react";

export function PropertyForm() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="border border-ink/10 bg-white p-5 sm:p-7">
          <h2 className="font-display text-2xl">Thông tin cơ bản</h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Tiêu đề tin đăng
              <input className="h-12 border border-ink/15 px-4 font-normal" placeholder="Ví dụ: Nhà phố ba tầng gần sông Hàn" required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Mô tả
              <textarea className="min-h-40 border border-ink/15 p-4 font-normal" placeholder="Mô tả điểm nổi bật, không gian và pháp lý..." required />
            </label>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold">
                Loại hình
                <select className="h-12 border border-ink/15 px-4 font-normal">
                  <option>Nhà ở</option>
                  <option>Căn hộ</option>
                  <option>Đất</option>
                  <option>Cho thuê</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Mức giá (đ)
                <input className="h-12 border border-ink/15 px-4 font-normal" type="number" min="0" placeholder="8500000000" />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Diện tích (m²)
                <input className="h-12 border border-ink/15 px-4 font-normal" type="number" min="0" placeholder="120" />
              </label>
            </div>
          </div>
        </section>
        <section className="border border-ink/10 bg-white p-5 sm:p-7">
          <h2 className="font-display text-2xl">Vị trí</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {["Tỉnh / thành phố", "Quận / huyện", "Phường / xã", "Địa chỉ chi tiết"].map((label) => (
              <label key={label} className="grid gap-2 text-sm font-bold">
                {label}
                <input className="h-12 border border-ink/15 px-4 font-normal" placeholder={label} />
              </label>
            ))}
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        <section className="border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Hình ảnh</h2>
          <button type="button" className="mt-5 grid min-h-44 w-full place-items-center border border-dashed border-ink/25 bg-[#fafaf7] text-center">
            <span>
              <ImagePlus className="mx-auto text-moss" size={28} />
              <strong className="mt-3 block text-sm">Tải ảnh lên</strong>
              <small className="mt-1 block text-ink/40">PNG, JPG tối đa 8 MB</small>
            </span>
          </button>
        </section>
        <section className="border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Xuất bản</h2>
          <label className="mt-5 grid gap-2 text-sm font-bold">
            Trạng thái
            <select className="h-12 border border-ink/15 px-4 font-normal">
              <option>Bản nháp</option>
              <option>Đăng công khai</option>
              <option>Ẩn tin</option>
            </select>
          </label>
          <button className="button-primary mt-5 w-full">
            <Save size={17} />
            Lưu tin đăng
          </button>
          {saved && (
            <p role="status" className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={15} />
              Đã lưu bản demo thành công.
            </p>
          )}
        </section>
      </aside>
    </form>
  );
}

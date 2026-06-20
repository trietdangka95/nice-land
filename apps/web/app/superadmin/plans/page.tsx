import { Check, Plus } from "lucide-react";
import { plans } from "@/lib/data";

export default function PlansPage() {
  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Thương mại</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Gói dịch vụ</h1>
          <p className="mt-2 text-sm text-ink/50">Cấu hình giới hạn và giá bán cho từng nhóm khách hàng.</p>
        </div>
        <button className="button-primary"><Plus size={17} /> Thêm gói mới</button>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="border border-ink/10 bg-white p-6">
            <h2 className="font-display text-3xl">{plan.name}</h2>
            <p className="mt-3 text-3xl font-extrabold text-moss">{new Intl.NumberFormat("vi-VN").format(plan.price)} đ</p>
            <p className="mt-1 text-xs text-ink/40">mỗi tháng / website</p>
            <ul className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
              {plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check size={16} className="text-moss" />{feature}</li>)}
            </ul>
            <button className="button-secondary mt-6 w-full">Chỉnh sửa gói</button>
          </article>
        ))}
      </div>
    </>
  );
}

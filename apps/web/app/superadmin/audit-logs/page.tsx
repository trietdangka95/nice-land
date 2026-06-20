import { ShieldCheck } from "lucide-react";

export default function AuditLogsPage() {
  const logs = [
    ["SITE_CREATED", "Tạo website An Land", "SUPER_ADMIN", "19/06/2026 20:18"],
    ["POST_PUBLISHED", "Xuất bản “Biệt thự nhiệt đới...”", "admin@minhphat", "19/06/2026 18:42"],
    ["SITE_CONFIG_UPDATED", "Cập nhật màu thương hiệu", "admin@anland", "19/06/2026 16:20"],
    ["SITE_DEACTIVATED", "Tạm ngưng Địa Ốc Gia Lộc", "SUPER_ADMIN", "18/06/2026 09:12"],
  ];
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Kiểm soát hoạt động</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Nhật ký hệ thống</h1>
      <section className="mt-8 overflow-hidden border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[#f8f8f5] text-[10px] uppercase tracking-widest text-ink/40"><tr><th className="px-5 py-4">Hành động</th><th className="px-5 py-4">Chi tiết</th><th className="px-5 py-4">Người thực hiện</th><th className="px-5 py-4">Thời gian</th></tr></thead>
            <tbody className="divide-y divide-ink/10">{logs.map(([action, detail, user, time]) => <tr key={`${action}-${time}`}><td className="px-5 py-4"><span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-moss"><ShieldCheck size={15} />{action}</span></td><td className="px-5 py-4 text-sm">{detail}</td><td className="px-5 py-4 text-xs text-ink/55">{user}</td><td className="px-5 py-4 text-xs text-ink/45">{time}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

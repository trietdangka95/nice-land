import { Mail, Phone } from "lucide-react";
import { StatusPill } from "@/components/status-pill";

export default function ContactsPage() {
  const contacts = [
    ["Nguyễn Minh Anh", "0905 212 808", "minhanh@real.vn", "Muốn làm website cho nhóm 5 môi giới"],
    ["Trần Quốc Nam", "0988 700 115", "nam@phucan.vn", "Cần kết nối tên miền riêng"],
    ["Lê Thu Hà", "0914 333 920", "ha.le@gmail.com", "Xin tư vấn gói khởi đầu"],
  ];
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Lead từ landing page</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Yêu cầu liên hệ</h1>
      <div className="mt-8 space-y-4">
        {contacts.map(([name, phone, email, message], index) => (
          <article key={email} className="grid gap-5 border border-ink/10 bg-white p-5 md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-center">
            <div><strong className="font-display text-xl">{name}</strong><div className="mt-2"><StatusPill tone={index === 0 ? "gold" : "gray"}>{index === 0 ? "Mới" : "Đã xem"}</StatusPill></div></div>
            <div className="space-y-2 text-xs text-ink/55"><p className="flex gap-2"><Phone size={14} />{phone}</p><p className="flex gap-2"><Mail size={14} />{email}</p></div>
            <p className="text-sm leading-6 text-ink/60">{message}</p>
            <button className="button-secondary">Xử lý</button>
          </article>
        ))}
      </div>
    </>
  );
}

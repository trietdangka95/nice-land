"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const questions = [
  {
    question: "Tôi có cần biết lập trình để sử dụng không?",
    answer:
      "Không. Bạn quản lý tin đăng, hình ảnh và thông tin liên hệ qua giao diện trực quan như một trang quản trị thông thường.",
  },
  {
    question: "Website có dùng được tên miền riêng không?",
    answer:
      "Các gói hiện sử dụng subdomain thương hiệu trên nice-land.id.vn.",
  },
  {
    question: "Tôi có thể nâng cấp hoặc hủy gói cước bất kỳ lúc nào không?",
    answer:
      "Có. Bạn hoàn toàn có thể nâng cấp lên gói cao hơn hoặc hủy gia hạn bất cứ lúc nào trực tiếp trên trang quản trị.",
  },
  {
    question: "Dữ liệu giữa các khách hàng có được tách biệt?",
    answer:
      "Có. Mọi dữ liệu tenant đều được phân vùng bằng siteId và kiểm tra ở phía máy chủ để ngăn truy cập chéo.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-ink/15">
      {questions.map((item, index) => {
        const active = open === index;
        return (
          <div key={item.question} className="border-b border-ink/15">
            <button
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              onClick={() => setOpen(active ? -1 : index)}
              aria-expanded={active}
            >
              <span className="font-display text-xl font-medium sm:text-2xl">{item.question}</span>
              <Plus
                className={`shrink-0 transition-transform ${active ? "rotate-45" : ""}`}
                size={22}
                aria-hidden="true"
              />
            </button>
            {active && <p className="max-w-3xl pb-6 pr-12 leading-7 text-ink/65">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

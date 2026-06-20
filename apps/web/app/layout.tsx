import type { Metadata } from "next";
import "@/app/globals.css";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: {
    default: "Nice Land — Website bất động sản mang tên bạn",
    template: "%s | Nice Land",
  },
  description:
    "Nền tảng giúp môi giới và doanh nghiệp tạo website bất động sản riêng, quản lý tin đăng và xây dựng thương hiệu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}

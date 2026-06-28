import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { ToastProvider } from "@/components/shared/toast-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Nice Land — Website tin đăng mang tên bạn",
    template: "%s | Nice Land",
  },
  description:
    "Nền tảng giúp môi giới và doanh nghiệp tạo website riêng, quản lý tin đăng mua bán - cho thuê và xây dựng thương hiệu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <ToastProvider>
          <ScrollReveal />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

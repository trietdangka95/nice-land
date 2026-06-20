import { PropertyForm } from "@/components/property-form";

export default function CreatePostPage() {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tin đăng mới</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Thêm bất động sản</h1>
      <p className="mt-2 text-sm text-ink/50">Điền thông tin rõ ràng để khách hàng dễ dàng ra quyết định.</p>
      <PropertyForm />
    </>
  );
}

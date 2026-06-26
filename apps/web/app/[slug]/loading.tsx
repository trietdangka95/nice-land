import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-5 text-ink/40">
      <Loader2 className="animate-spin" size={48} />
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

import type { SystemSetting } from "@nice-land/contracts";

interface VietQRProps {
  amount: number;
  content: string;
  bankInfo: SystemSetting;
}

export function VietQR({ amount, content, bankInfo }: VietQRProps) {
  if (!bankInfo.bankId || !bankInfo.bankAccount) {
    return (
      <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/50 bg-[#f4f5f2]">
        Chưa cấu hình thanh toán.
      </div>
    );
  }

  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    content,
  )}&accountName=${encodeURIComponent(bankInfo.bankAccountName || "")}`;

  return (
    <div className="grid place-items-center gap-4 text-center">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-2 shadow-sm">
        <img
          src={qrUrl}
          alt={`Mã QR thanh toán - ${bankInfo.bankAccountName}`}
          className="h-64 w-64 object-contain"
        />
      </div>
      <div className="text-sm">
        <p className="text-ink/60">Hoặc chuyển khoản thủ công:</p>
        <div className="mt-2 space-y-1">
          <p>
            Ngân hàng: <strong>{bankInfo.bankId}</strong>
          </p>
          <p>
            Số TK: <strong>{bankInfo.bankAccount}</strong>
          </p>
          <p>
            Chủ TK: <strong>{bankInfo.bankAccountName}</strong>
          </p>
          <p>
            Số tiền: <strong>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}</strong>
          </p>
          <p>
            Nội dung: <strong className="select-all rounded bg-moss/20 px-1 py-0.5 font-mono text-moss">{content}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

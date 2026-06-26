"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastItem extends Required<ToastInput> {
  id: string;
}

interface ToastContextValue {
  notify: (toast: ToastInput) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig = {
  success: {
    icon: CheckCircle2,
    label: "Thành công",
    className: "border-emerald-200 bg-emerald-50 text-emerald-950",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    label: "Có lỗi xảy ra",
    className: "border-red-200 bg-red-50 text-red-950",
    iconClassName: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    label: "Cần chú ý",
    className: "border-amber-200 bg-amber-50 text-amber-950",
    iconClassName: "text-amber-600",
  },
  info: {
    icon: Info,
    label: "Thông báo",
    className: "border-sky-200 bg-sky-50 text-sky-950",
    iconClassName: "text-sky-600",
  },
} satisfies Record<
  ToastVariant,
  {
    icon: typeof CheckCircle2;
    label: string;
    className: string;
    iconClassName: string;
  }
>;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        title: toast.title ?? variantConfig[toast.variant ?? "info"].label,
        message: toast.message,
        variant: toast.variant ?? "info",
        durationMs: toast.durationMs ?? 5000,
      };

      setToasts((current) => [item, ...current].slice(0, 5));
      window.setTimeout(() => dismiss(id), item.durationMs);
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      dismiss,
      success: (message, title) =>
        notify({ message, title, variant: "success" }),
      error: (message, title) => notify({ message, title, variant: "error" }),
      warning: (message, title) =>
        notify({ message, title, variant: "warning" }),
      info: (message, title) => notify({ message, title, variant: "info" }),
    }),
    [dismiss, notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] grid w-[min(420px,calc(100vw-2rem))] gap-3"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto grid grid-cols-[auto_1fr_auto] gap-3 rounded-lg border p-4 shadow-[0_18px_45px_rgba(23,33,27,0.14)] backdrop-blur ${config.className}`}
      role={toast.variant === "error" || toast.variant === "warning" ? "alert" : "status"}
    >
      <Icon className={`mt-0.5 shrink-0 ${config.iconClassName}`} size={20} />
      <div className="min-w-0">
        <p className="text-sm font-bold leading-5">{toast.title}</p>
        <p className="mt-1 break-words text-sm leading-5 opacity-80">
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        className="grid size-7 place-items-center rounded-md opacity-60 transition hover:bg-black/5 hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

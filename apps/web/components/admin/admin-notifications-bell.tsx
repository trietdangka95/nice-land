"use client";

import type { NotificationItem } from "@nice-land/contracts";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { api, createTenantApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminNotificationsBell({
  superAdmin = false,
  siteSlug,
  onNavigate,
}: {
  superAdmin?: boolean;
  siteSlug?: string;
  onNavigate: (href: string) => void;
}) {
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const client = useMemo(() => {
    if (superAdmin) return api;
    return createTenantApi(siteSlug ?? "");
  }, [siteSlug, superAdmin]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const result = superAdmin
          ? await client.listSuperAdminNotifications(8)
          : await client.listAdminNotifications(8);
        setItems(result.items);
        setUnreadCount(result.unreadCount);
      } catch (error) {
        if (!silent) {
          toast.error(
            getErrorMessage(error, "Không thể tải thông báo."),
            "Không thể tải thông báo",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [client, superAdmin, toast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void load(true);
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, [load]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function markOne(item: NotificationItem) {
    if (item.isRead) return;
    try {
      if (superAdmin) {
        await client.markSuperAdminNotificationRead(item.id);
      } else {
        await client.markAdminNotificationRead(item.id);
      }
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, isRead: true, readAt: new Date().toISOString() }
            : entry,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Không thể cập nhật trạng thái thông báo."),
        "Không thể cập nhật",
      );
    }
  }

  async function handleOpenItem(item: NotificationItem) {
    await markOne(item);
    setOpen(false);
    onNavigate(item.link);
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      if (superAdmin) {
        await client.markAllSuperAdminNotificationsRead();
      } else {
        await client.markAllAdminNotificationsRead();
      }
      setItems((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Không thể đánh dấu đã đọc."),
        "Không thể cập nhật",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative grid size-10 place-items-center border border-ink/10 bg-white/75 transition-colors hover:bg-white"
        aria-label="Thông báo"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load(true);
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-moss px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_24px_50px_rgba(23,33,27,0.12)]">
          <div className="flex items-center justify-between border-b border-ink/5 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">
                Thông báo
              </p>
              <p className="mt-1 text-xs text-ink/50">
                {unreadCount > 0
                  ? `${unreadCount} mục chưa đọc`
                  : "Không có mục chưa đọc"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-2 text-[11px] font-bold text-ink/70 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
              Đọc hết
            </button>
          </div>

          {loading ? (
            <div className="grid min-h-52 place-items-center px-5 py-10 text-sm text-ink/50">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Đang tải thông báo
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-ink/70">
                Chưa có thông báo nào.
              </p>
              <p className="mt-2 text-xs text-ink/45">
                Mọi cập nhật mới sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="max-h-[26rem] overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleOpenItem(item)}
                  className={`flex w-full flex-col gap-2 border-b border-ink/5 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-ink/[0.03] ${
                    item.isRead ? "bg-white" : "bg-moss/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-ink/65">
                        {item.body}
                      </p>
                    </div>
                    {!item.isRead && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-moss" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-ink/45">
                    {superAdmin && item.site && (
                      <span className="rounded-full bg-ink/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
                        {item.site.name}
                      </span>
                    )}
                    <span>{formatNotificationTime(item.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

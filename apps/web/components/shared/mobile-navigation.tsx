"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function MobileNavigation({
  label,
  title,
  triggerClassName,
  children,
}: {
  label: string;
  title: string;
  triggerClassName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={open}
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label={title}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-black/45 p-0 backdrop:bg-transparent"
        onCancel={close}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <section className="ml-auto flex min-h-dvh w-[min(86vw,340px)] flex-col bg-ink text-white shadow-xl">
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5">
            <strong className="text-balance font-display text-xl font-semibold">
              {title}
            </strong>
            <button
              type="button"
              className="grid size-11 place-items-center border border-white/15 text-white"
              aria-label="Đóng menu"
              onClick={close}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>
          <div
            className="flex flex-1 flex-col overflow-y-auto"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) close();
            }}
          >
            {children}
          </div>
        </section>
      </dialog>
    </>
  );
}

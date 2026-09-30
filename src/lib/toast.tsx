"use client";

import { create } from "zustand";
import { createContext, useCallback, useContext } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "./utils";

type ToastKind = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

function createToast(kind: ToastKind) {
  return (title: string, description?: string) => {
    useToastStore.getState().push({ kind, title, description });
  };
}

export const toast = {
  success: createToast("success"),
  error: createToast("error"),
  info: createToast("info"),
  warning: createToast("warning"),
};

const toastIcon: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastAccent: Record<ToastKind, string> = {
  success: "border-green-500/40 text-green-600 dark:text-green-400",
  error: "border-red-500/40 text-red-600 dark:text-red-400",
  info: "border-sky-500/40 text-sky-600 dark:text-sky-400",
  warning: "border-amber-500/40 text-amber-600 dark:text-amber-400",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[130] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = toastIcon[t.kind];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto animate-fade-in flex items-start gap-3 rounded-lg border bg-popover p-3 shadow-lg",
              toastAccent[t.kind],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-popover-foreground">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export type ConfirmDialogState = {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
};

export const confirmPendingContext = createContext<(c: ConfirmDialogState | null) => void>(() => {});

export function useConfirmPending() {
  return useContext(confirmPendingContext);
}

export function useToast() {
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);
  return {
    toast: useCallback(
      (kind: ToastKind, title: string, description?: string) => push({ kind, title, description }),
      [push],
    ),
    dismiss,
  };
}
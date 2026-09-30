"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { confirmPendingContext, type ConfirmDialogState } from "@/lib/toast";

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<ConfirmDialogState | null>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = () => {
    if (!pending) return;
    setBusy(true);
    Promise.resolve(pending.onConfirm()).finally(() => {
      setBusy(false);
      setPending(null);
    });
  };

  return (
    <confirmPendingContext.Provider value={setPending}>
      {children}
      <Dialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending?.title}</DialogTitle>
            {pending?.description && <DialogDescription>{pending.description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={busy}>
              {busy ? "Working…" : pending?.confirmLabel ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </confirmPendingContext.Provider>
  );
}
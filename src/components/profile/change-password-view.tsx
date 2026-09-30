"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { reportApiError } from "@/lib/errors";

export function ChangePasswordView() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const valid = current && next.length >= 6 && next === confirm;

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await api.updatePassword(current, next);
      toast.success("Password updated");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      reportApiError("Could not update password", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="h-4 w-4 text-muted-foreground" /> Change password
        </CardTitle>
        <CardDescription>
          In the mock build, any password of 6+ characters is accepted. Reset your password via the login link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="pw-current" className="text-xs">
            Current password
          </Label>
          <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pw-new" className="text-xs">
            New password
          </Label>
          <Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pw-confirm" className="text-xs">
            Confirm new password
          </Label>
          <Input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {confirm && next !== confirm && <p className="text-[11px] text-destructive">Passwords do not match.</p>}
        </div>
        <Button onClick={submit} disabled={!valid || saving}>
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  username: z.string().min(3, "Enter your username or official ID"),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: "" },
  });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      await requestPasswordReset(values.username);
      setSent(true);
    } catch (err) {
      toast.error("Reset request failed", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="pt-3 text-center">Reset link sent</CardTitle>
          <CardDescription className="text-center">
            If that account exists, we&apos;ve emailed a secure link to reset your password. Use it within 15
            minutes. No code or OTP is required.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>
          Enter your username or official ID. We&apos;ll email you a password-reset link.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username / Official ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. authority.admin" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
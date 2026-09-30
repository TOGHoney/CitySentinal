"use client";

import { getErrorMessage } from "./utils";
import { toast } from "./toast";

export function reportApiError(title: string, err: unknown): string {
  const message = getErrorMessage(err);
  console.error(`${title}:`, err);
  toast.error(title, message);
  return message;
}

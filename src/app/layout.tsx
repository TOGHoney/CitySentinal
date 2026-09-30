import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/lib/toast";
import { ConfirmDialogProvider } from "@/components/layout/confirm-dialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CitySentinel — AI-Powered Urban Intelligence",
    template: "%s · CitySentinel",
  },
  description:
    "Real-time urban intelligence platform that transforms city buses into smart sensing units for road safety, traffic violations, congestion analytics and investigation support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`} suppressHydrationWarning>
        <Providers>
          <ConfirmDialogProvider>
            {children}
            <Toaster />
          </ConfirmDialogProvider>
        </Providers>
      </body>
    </html>
  );
}
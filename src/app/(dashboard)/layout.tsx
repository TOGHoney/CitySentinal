"use client";

import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { DemoDisclaimer } from "@/components/shared/DemoDisclaimer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        <DemoDisclaimer />
      </div>

      <MobileNav />
    </div>
  );
}
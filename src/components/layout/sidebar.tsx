"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  Gauge,
  AlertOctagon,
  Route,
  Search,
  Bell,
  UserRound,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY_NAME, APP_TAGLINE } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/demo", label: "Live demo", icon: Radar},
  { href: "/dashboard", label: "Live Fleet", icon: Radar },
  { href: "/violations", label: "Violations", icon: AlertOctagon },
  { href: "/defects", label: "Road Defects", icon: Route },
  { href: "/analytics", label: "Traffic Analytics", icon: Gauge },
  { href: "/investigation", label: "Investigation", icon: Search },
];

const FOOTER_ITEMS = [
  { href: "/profile", label: "Profile & Settings", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{COMPANY_NAME}</p>
          <p className="truncate text-[11px] text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Separator className="my-3 bg-sidebar-border" />
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Account</p>
        {FOOTER_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
          <LifeBuoy className="h-3.5 w-3.5" />
          <span>v0.1.0 · Mock build</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background md:hidden">
      <div className="grid grid-cols-5">
        {[...NAV_ITEMS, { href: "/profile", label: "Profile", icon: UserRound }].map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
              <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
              <span className={active ? "font-semibold text-primary" : "text-muted-foreground"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-1" />
    </div>
  );
}
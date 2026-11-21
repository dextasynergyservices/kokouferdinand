"use client";

import { cn } from "cn";
import {
  CalendarRange,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AdminLocaleSwitcher, useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

const NAV_KEYS = [
  { href: "/admin", key: "overview" as const, icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", key: "pages" as const, icon: FileText },
  { href: "/admin/works", key: "works" as const, icon: ImageIcon },
  { href: "/admin/exhibitions", key: "exhibitions" as const, icon: CalendarRange },
  { href: "/admin/videos", key: "videos" as const, icon: Film },
  { href: "/admin/press", key: "press" as const, icon: Newspaper },
  { href: "/admin/enquiries", key: "enquiries" as const, icon: Mail },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useAdminI18n();

  return (
    <div className="paper-grain flex h-full flex-col bg-board-200/75 text-ink-950">
      <div className="cavity-dark px-6 py-5 text-board-100">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/70">
          {t.brand.cms}
        </p>
        <p className="relief-raised-text mt-1 truncate font-serif text-xl font-normal">
          {t.brand.artist}
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 p-3">
        {NAV_KEYS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "relief-slab border-l-2 border-l-oxide font-medium text-ink-950"
                  : "rounded-[6px] border-l-2 border-transparent text-ink-600 hover:bg-board-50/70 hover:text-ink-950",
              )}
            >
              <Icon className="size-4" />
              {t.nav[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="spec-rule mx-4" />
      <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
        {t.brand.footer}
      </div>
    </div>
  );
}

export function AdminShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useAdminI18n();

  const currentNav = NAV_KEYS.find((item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const currentSection = currentNav ? t.nav[currentNav.key] : t.header.atelier;

  async function handleSignOut() {
    try {
      await authClient.signOut();
      toast.success(t.header.signedOut);
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error(t.header.signOutFailed);
    }
  }

  return (
    <div className="paper-grain flex min-h-screen bg-board-100 text-ink-950">
      {/* Laptop & Desktop Persistent Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-950/15 lg:block xl:w-72">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile & Tablet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-r border-ink-950/15 bg-board-100 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t.nav.navigationTitle}</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Column with Unified Top Header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relief-nav paper-grain sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-ink-950/12 bg-board-100/95 px-4 backdrop-blur-md sm:px-6 lg:px-10 xl:px-12">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileOpen(true)}
                aria-label={t.nav.navigationTitle}
                className="relief-btn size-9 rounded-full p-0"
              >
                <Menu className="size-4" />
              </Button>
            </div>

            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                {t.header.atelier} / {currentSection}
              </p>
              <p className="truncate font-serif text-lg leading-tight text-ink-950 lg:hidden">
                {t.brand.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AdminLocaleSwitcher />

            <Link
              href={`/${locale}`}
              target="_blank"
              rel="noreferrer"
              className="relief-btn hidden px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] sm:inline-flex"
            >
              <span>{t.header.publicSite}</span>
              <ExternalLink className="size-3" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="relief-btn px-2.5 py-1.5 text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxide/40"
              >
                <span className="flex size-6 items-center justify-center bg-ink-950 text-board-50">
                  <UserRound className="size-3.5" />
                </span>
                <span className="hidden max-w-36 truncate text-xs font-medium md:inline">
                  {userName || userEmail}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 border border-ink-950/15 bg-board-50"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="space-y-0.5 py-1">
                      <p className="truncate text-xs font-medium text-ink-950">{userName}</p>
                      <p className="truncate font-mono text-[11px] text-ink-600">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/admin/enquiries")}
                  className="cursor-pointer text-xs"
                >
                  <Mail className="mr-2 size-3.5" />
                  {t.header.enquiriesInbox}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`/${locale}`, "_blank", "noopener,noreferrer")}
                  className="cursor-pointer text-xs"
                >
                  <ExternalLink className="mr-2 size-3.5" />
                  {t.header.openPublicSite}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-xs text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-3.5" />
                  {t.header.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 xl:px-12">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

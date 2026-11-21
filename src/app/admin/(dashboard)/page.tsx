import { count, desc, eq } from "drizzle-orm";
import { CalendarRange, Film, Image as ImageIcon, Mail, Newspaper } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { artworks, enquiries, exhibitions, pressItems, videos } from "@/db/schema";
import { getAdminDictionary } from "@/lib/admin-i18n";
import { getAdminLocale } from "@/lib/admin-locale-server";

async function OverviewContent() {
  const [
    locale,
    [worksTotal],
    [worksPublished],
    [exhibitionsTotal],
    [videosTotal],
    [pressTotal],
    [unreadEnquiries],
    recentEnquiries,
  ] = await Promise.all([
    getAdminLocale(),
    db.select({ total: count() }).from(artworks),
    db.select({ total: count() }).from(artworks).where(eq(artworks.status, "published")),
    db.select({ total: count() }).from(exhibitions),
    db.select({ total: count() }).from(videos),
    db.select({ total: count() }).from(pressItems),
    db.select({ total: count() }).from(enquiries).where(eq(enquiries.status, "unread")),
    db.query.enquiries.findMany({
      orderBy: [desc(enquiries.createdAt)],
      limit: 5,
      with: { artwork: true },
    }),
  ]);

  const t = getAdminDictionary(locale);

  const stats = [
    {
      label: t.nav.works,
      value: worksPublished?.total ?? 0,
      sub: `${worksTotal?.total ?? 0} ${t.overview.worksTotal}`,
      href: "/admin/works",
      icon: ImageIcon,
    },
    {
      label: t.nav.exhibitions,
      value: exhibitionsTotal?.total ?? 0,
      sub: t.overview.exhibitionsSub,
      href: "/admin/exhibitions",
      icon: CalendarRange,
    },
    {
      label: t.nav.videos,
      value: videosTotal?.total ?? 0,
      sub: t.overview.videosSub,
      href: "/admin/videos",
      icon: Film,
    },
    {
      label: t.nav.press,
      value: pressTotal?.total ?? 0,
      sub: t.overview.pressSub,
      href: "/admin/press",
      icon: Newspaper,
    },
    {
      label: t.overview.unreadEnquiries,
      value: unreadEnquiries?.total ?? 0,
      sub: t.overview.enquiriesSub,
      href: "/admin/enquiries",
      icon: Mail,
    },
  ];

  const statusLabels: Record<string, string> = {
    unread: t.common.unread,
    read: t.common.read,
    archived: t.common.archived,
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href} className="group block">
              <Card className="relief-slab border-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="size-4 text-oxide/80" />
                </CardHeader>
                <CardContent>
                  <div className="debossed-heading font-serif text-3xl font-light">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="relief-slab border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="debossed-heading font-serif text-xl font-normal">
              {t.overview.recentEnquiries}
            </CardTitle>
            <CardDescription>{t.overview.recentEnquiriesDesc}</CardDescription>
          </div>
          <Link
            href="/admin/enquiries"
            className="link-dashed font-mono text-[11px] uppercase tracking-[0.14em] text-oxide"
          >
            {t.overview.openInbox}
          </Link>
        </CardHeader>
        <CardContent>
          {recentEnquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.overview.noEnquiries}</p>
          ) : (
            <div>
              {recentEnquiries.map((item) => (
                <div
                  key={item.id}
                  className="spec-rule flex items-start justify-between gap-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <Badge variant={item.status === "unread" ? "default" : "secondary"}>
                        {statusLabels[item.status] ?? item.status}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{item.subject}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {item.createdAt.toISOString().slice(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader section="overview" />
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {["w", "e", "v", "p", "q"].map((k) => (
                <Skeleton key={k} className="h-28 bg-board-200" />
              ))}
            </div>
            <Skeleton className="h-48 bg-board-200" />
          </div>
        }
      >
        <OverviewContent />
      </Suspense>
    </div>
  );
}

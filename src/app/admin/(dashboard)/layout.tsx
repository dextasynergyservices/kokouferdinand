import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminI18nProvider } from "@/components/admin/admin-i18n-provider";
import { AdminShell } from "@/components/admin/admin-sidebar";
import { AdminProviders } from "@/components/admin/query-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminLocale } from "@/lib/admin-locale-server";
import { hasAnyAdmin, requireAdmin } from "@/lib/auth";

async function AuthenticatedAdminShell({ children }: { children: React.ReactNode }) {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    const adminExists = await hasAnyAdmin();
    redirect(adminExists ? "/admin/login" : "/admin/setup");
  }

  const locale = await getAdminLocale();

  return (
    <AdminProviders>
      <AdminI18nProvider initialLocale={locale}>
        <AdminShell userName={session.user.name} userEmail={session.user.email}>
          {children}
        </AdminShell>
      </AdminI18nProvider>
    </AdminProviders>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-board-100 p-8">
          <Skeleton className="h-32 w-64 bg-board-200" />
        </div>
      }
    >
      <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>
    </Suspense>
  );
}

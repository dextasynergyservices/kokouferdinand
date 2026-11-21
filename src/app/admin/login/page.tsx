import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AdminI18nProvider } from "@/components/admin/admin-i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminLocale } from "@/lib/admin-locale-server";
import { hasAnyAdmin } from "@/lib/auth";
import { AdminLoginView } from "./login-form";

async function LoginGate() {
  const adminExists = await hasAnyAdmin();
  if (!adminExists) {
    redirect("/admin/setup");
  }

  const locale = await getAdminLocale();

  return (
    <AdminI18nProvider initialLocale={locale}>
      <AdminLoginView turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
    </AdminI18nProvider>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="paper-grain relative min-h-screen bg-board-100 text-ink-950">
      <Toaster position="bottom-right" richColors />
      <Suspense fallback={<Skeleton className="min-h-screen w-full bg-board-200" />}>
        <LoginGate />
      </Suspense>
    </div>
  );
}

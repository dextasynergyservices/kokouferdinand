import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AdminI18nProvider } from "@/components/admin/admin-i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminLocale } from "@/lib/admin-locale-server";
import { hasAnyAdmin } from "@/lib/auth";
import { AdminSetupView } from "./setup-form";

async function SetupGate() {
  const adminExists = await hasAnyAdmin();
  if (adminExists) {
    redirect("/admin/login");
  }

  const locale = await getAdminLocale();

  return (
    <AdminI18nProvider initialLocale={locale}>
      <AdminSetupView turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
    </AdminI18nProvider>
  );
}

export default function AdminSetupPage() {
  return (
    <div className="paper-grain relative min-h-screen bg-board-100 text-ink-950">
      <Toaster position="bottom-right" richColors />
      <Suspense fallback={<Skeleton className="min-h-screen w-full bg-board-200" />}>
        <SetupGate />
      </Suspense>
    </div>
  );
}

"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { verifyAdminTurnstileAction } from "@/app/admin/actions";
import { AdminLocaleSwitcher, useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { authClient } from "@/lib/auth-client";

export function AdminLoginView({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const router = useRouter();
  const { locale, t } = useAdminI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (turnstileSiteKey && !turnstileToken) {
      toast.error(t.auth.captchaRequired);
      return;
    }

    setLoading(true);
    try {
      if (turnstileSiteKey) {
        const check = await verifyAdminTurnstileAction(turnstileToken);
        if (!check.ok) {
          toast.error(check.error);
          setLoading(false);
          return;
        }
      }

      const res = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        toast.error(res.error.message ?? t.auth.invalidCredentials);
        setLoading(false);
        return;
      }

      toast.success(t.auth.welcomeBack);
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error(t.auth.signInFailed);
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
      <aside className="cavity-dark flex flex-col justify-between px-6 py-8 text-board-100 sm:px-10 lg:col-span-5 lg:px-12 lg:py-12 xl:col-span-6 xl:px-16">
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/80">
          <span className="truncate">{t.brand.fullArtist}</span>
          <AdminLocaleSwitcher />
        </div>

        <div className="my-10 space-y-6 lg:my-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-board-300/70">
            {t.auth.colophonTag}
          </p>
          <h2 className="relief-raised-text max-w-lg font-serif text-3xl font-light leading-[1.12] tracking-tight sm:text-4xl xl:text-5xl">
            {t.auth.colophonTitle}
          </h2>
          <p className="hidden max-w-md text-sm leading-relaxed text-board-300/75 lg:block">
            {t.auth.colophonDesc}
          </p>
        </div>

        <div className="hidden items-end justify-between border-t border-dashed border-board-300/20 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-board-300/70 lg:flex">
          <div>
            <p className="text-board-300/50">{t.auth.representation}</p>
            <p className="mt-1 text-board-100">{t.auth.galleryName}</p>
          </div>
          <div className="text-right">
            <p className="text-board-300/50">{t.auth.editions}</p>
            <p className="mt-1 text-board-100">FR · EN · ES</p>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12 sm:px-10 lg:col-span-7 lg:px-16 xl:col-span-6">
        <div className="relief-slab w-full max-w-md p-7 sm:p-9">
          <div className="spec-rule space-y-3 pb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-oxide">
              {t.auth.loginTag}
            </p>
            <h1 className="debossed-heading font-serif text-4xl font-light tracking-tight text-ink-950 sm:text-5xl">
              {t.auth.loginTitle}
            </h1>
            <p className="text-sm leading-relaxed text-ink-600">{t.auth.loginDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600"
              >
                {t.auth.email}
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="studio@makouvia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-ink-950/25 bg-transparent px-0 py-2.5 text-base text-ink-950 placeholder:text-ink-400 transition-colors focus:border-oxide focus:outline-none sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600"
              >
                {t.auth.password}
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-ink-950/25 bg-transparent px-0 py-2.5 text-base text-ink-950 placeholder:text-ink-400 transition-colors focus:border-oxide focus:outline-none sm:text-sm"
              />
            </div>

            {turnstileSiteKey ? (
              <div className="pt-1">
                <Turnstile
                  siteKey={turnstileSiteKey}
                  options={{ theme: "light", language: locale }}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken("")}
                />
              </div>
            ) : null}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relief-btn group w-full justify-between px-5 py-3.5 font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-50"
              >
                <span>{loading ? t.auth.authenticating : t.auth.enterStudio}</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </form>

          <div className="mt-10 flex items-center justify-between border-t border-dashed border-ink-950/15 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            <span>{t.auth.privateAccess}</span>
            <Link href={`/${locale}`} className="link-dashed text-ink-600 hover:text-oxide">
              {t.auth.backToSite}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

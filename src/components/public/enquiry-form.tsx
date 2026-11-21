"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { submitPublicEnquiryAction } from "@/app/actions/enquiry";
import type { AppLocale } from "@/i18n/routing";

export type EnquiryFormLabels = {
  name: string;
  email: string;
  subject: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  captchaRequired: string;
};

export function EnquiryForm({
  locale,
  labels,
  artworkId,
  defaultSubject = "",
  turnstileSiteKey,
  onSuccess,
}: {
  locale: AppLocale;
  labels: EnquiryFormLabels;
  artworkId?: string | null;
  defaultSubject?: string;
  turnstileSiteKey?: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (turnstileSiteKey && !turnstileToken) {
      setError(labels.captchaRequired);
      return;
    }

    setSubmitting(true);
    const res = await submitPublicEnquiryAction({
      name,
      email,
      subject,
      message,
      artworkId: artworkId ?? null,
      locale,
      turnstileToken: turnstileToken || undefined,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || labels.error);
      return;
    }

    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    onSuccess?.();
  }

  if (sent) {
    return (
      <div className="space-y-3 border border-ink-950/15 bg-board-50 p-6">
        <div className="flex items-center gap-2 text-oxide">
          <CheckCircle2 className="size-5" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Atelier Makouvia</span>
        </div>
        <p className="font-serif text-xl font-light text-ink-950">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="enq-name"
            className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600"
          >
            {labels.name} *
          </label>
          <input
            id="enq-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="relief-well w-full bg-board-200/45 px-3.5 py-2.5 text-base text-ink-950 transition-colors focus:bg-board-50 focus:outline-none focus:ring-1 focus:ring-oxide sm:text-sm"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="enq-email"
            className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600"
          >
            {labels.email} *
          </label>
          <input
            id="enq-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relief-well w-full bg-board-200/45 px-3.5 py-2.5 text-base text-ink-950 transition-colors focus:bg-board-50 focus:outline-none focus:ring-1 focus:ring-oxide sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="enq-subject"
          className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600"
        >
          {labels.subject} *
        </label>
        <input
          id="enq-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="relief-well w-full bg-board-200/45 px-3.5 py-2.5 text-base text-ink-950 transition-colors focus:bg-board-50 focus:outline-none focus:ring-1 focus:ring-oxide sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="enq-message"
          className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600"
        >
          {labels.message} *
        </label>
        <textarea
          id="enq-message"
          rows={5}
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="relief-well w-full bg-board-200/45 p-3.5 text-base text-ink-950 transition-colors focus:bg-board-50 focus:outline-none focus:ring-1 focus:ring-oxide sm:text-sm"
        />
      </div>

      {turnstileSiteKey ? (
        <Turnstile
          siteKey={turnstileSiteKey}
          options={{ theme: "light", language: locale }}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
        />
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="relief-btn group inline-flex w-full items-center justify-between px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] disabled:opacity-50 sm:w-auto sm:min-w-60"
      >
        <span>{submitting ? labels.submitting : labels.submit}</span>
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/Reveal";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsConfirmation(false);

    if (!email.trim()) {
      setError(t("login.errorEmailRequired"));
      return;
    }
    if (!password) {
      setError(t("login.errorPasswordRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("email not confirmed") ||
          authError.message.toLowerCase().includes("email_not_confirmed")
        ) {
          setNeedsConfirmation(true);
        } else if (
          authError.message.toLowerCase().includes("invalid login") ||
          authError.message.toLowerCase().includes("invalid credentials")
        ) {
          setError(t("login.errorInvalidCredentials"));
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/dashboard");
    } catch {
      setError(t("login.errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendStatus !== "idle") return;
    setResendStatus("sending");
    try {
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email: email.trim() });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-[hsl(var(--background))]">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/8 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Reveal>
          {/* Card */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/60 to-transparent" />

            <div className="p-8">
              {/* Header */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="mb-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <LogIn className="h-6 w-6 text-[var(--accent)]" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                  {t("login.heading")}
                </h1>
                <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                  {t("login.subheading")}
                </p>
              </motion.div>

              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Email not confirmed banner */}
              {needsConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        {t("login.confirmEmailTitle")}
                      </p>
                      <p className="mt-0.5 text-sm text-amber-600 dark:text-amber-500">
                        {t("login.confirmEmailBody")}
                      </p>
                      {resendStatus === "idle" && (
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          className="mt-2 text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                        >
                          {t("login.resendEmail")}
                        </button>
                      )}
                      {resendStatus === "sending" && (
                        <p className="mt-2 text-sm text-amber-600 dark:text-amber-500">{t("login.resendSending")}</p>
                      )}
                      {resendStatus === "sent" && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                          <p className="text-sm text-green-600 dark:text-green-400">{t("login.resendSent")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("login.emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("login.emailPlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none transition-colors",
                        error
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-[hsl(var(--border))] focus:border-[var(--accent)]"
                      )}
                      disabled={isSubmitting}
                      aria-invalid={!!error}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("login.passwordLabel")}
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("login.passwordPlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none transition-colors",
                        error
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-[hsl(var(--border))] focus:border-[var(--accent)]"
                      )}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[var(--accent)] transition-colors"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isSubmitting ? t("login.submitting") : t("login.submit")}
                </button>
              </form>

              {/* Sign up link */}
              <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                {t("login.noAccount")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-[var(--accent)] hover:underline underline-offset-2 transition-colors"
                >
                  {t("login.signUp")}
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

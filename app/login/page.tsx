"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { fadeInUp, scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/data";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = emailTouched && !email.trim()
    ? t("login.validation.emailRequired")
    : emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? t("login.validation.emailInvalid")
    : null;

  const passwordError = passwordTouched && !password
    ? t("login.validation.passwordRequired")
    : passwordTouched && password.length < 6
    ? t("login.validation.passwordShort")
    : null;

  const isFormValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);
    setNeedsConfirmation(false);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message.toLowerCase().includes("email not confirmed")) {
          setNeedsConfirmation(true);
        } else if (authError.message.toLowerCase().includes("invalid login credentials")) {
          setError(t("login.errors.invalidCredentials"));
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("login.errors.unexpected"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendConfirmation() {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email });
      setResendSuccess(true);
    } catch {
      // silently fail — user can try again
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-[hsl(var(--background))]">
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/6 blur-[120px]" />
      </div>

      <Reveal className="w-full max-w-md relative z-10">
        <motion.div
          variants={scaleIn}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_-8px_rgba(0,0,0,0.12)] overflow-hidden"
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-[hsl(var(--border))]">
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-[0_2px_8px_var(--accent)/30]">
                <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                {APP_NAME}
              </span>
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {t("login.heading")}
            </h1>
            <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
              {t("login.subheading")}
            </p>
          </div>

          {/* Form body */}
          <div className="px-8 py-7">
            {/* Unconfirmed email notice */}
            {needsConfirmation && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20 p-4"
              >
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {t("login.errors.emailNotConfirmed")}
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  {t("login.errors.emailNotConfirmedHint")}
                </p>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || resendSuccess}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:no-underline disabled:opacity-60 transition-opacity"
                >
                  {resendLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                  {resendSuccess ? t("login.resendSuccess") : t("login.resendLink")}
                </button>
              </motion.div>
            )}

            {/* Generic error */}
            {error && !needsConfirmation && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20 p-4"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  {t("login.form.emailLabel")}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={t("login.form.emailPlaceholder")}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={cn(
                      "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none transition-all duration-200",
                      "focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
                      emailError
                        ? "border-red-400 dark:border-red-600"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]"
                    )}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("login.form.passwordLabel")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[var(--accent)] hover:underline underline-offset-2 transition-colors"
                  >
                    {t("login.form.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder={t("login.form.passwordPlaceholder")}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    className={cn(
                      "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-11 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none transition-all duration-200",
                      "focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
                      passwordError
                        ? "border-red-400 dark:border-red-600"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("login.form.hidePassword") : t("login.form.showPassword")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                      : <Eye className="h-4 w-4" aria-hidden="true" />
                    }
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.015 }}
                whileTap={{ scale: isLoading ? 1 : 0.985 }}
                className={cn(
                  "w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_var(--accent)/25] transition-all duration-200",
                  "hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isLoading ? t("login.form.signingIn") : t("login.form.submit")}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[hsl(var(--border))]" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{t("login.divider")}</span>
              <div className="flex-1 h-px bg-[hsl(var(--border))]" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              {t("login.noAccount")}{" "}
              <Link
                href="/signup"
                className="font-semibold text-[var(--accent)] hover:underline underline-offset-2 transition-colors"
              >
                {t("login.signUpLink")}
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust note */}
        <p className="mt-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
          {t("login.trustNote")}
        </p>
      </Reveal>
    </main>
  );
}
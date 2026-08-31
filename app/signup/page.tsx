"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const t = useTranslations();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) {
      errors.email = t("signup.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t("signup.validation.emailInvalid");
    }
    if (!password) {
      errors.password = t("signup.validation.passwordRequired");
    } else if (password.length < 8) {
      errors.password = t("signup.validation.passwordMinLength");
    }
    if (!confirmPassword) {
      errors.confirmPassword = t("signup.validation.confirmPasswordRequired");
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t("signup.validation.passwordMismatch");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          setError(t("signup.error.alreadyRegistered"));
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("signup.error.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-[hsl(var(--background))]">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/6 blur-[120px]" />
      </div>

      <Reveal className="w-full max-w-md relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)]"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
              <UserPlus className="h-6 w-6 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {t("signup.heading")}
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              {t("signup.subheading")}
            </p>
          </motion.div>

          {/* Success state */}
          {success ? (
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
            >
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-500" aria-hidden="true" />
              <h2 className="font-semibold text-[hsl(var(--foreground))]">
                {t("signup.success.title")}
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {t("signup.success.message")}
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
              >
                {t("signup.success.loginLink")}
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <motion.div variants={staggerContainer} className="space-y-5">
                {/* Global error */}
                {error && (
                  <motion.div
                    variants={fadeInUp}
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Email field */}
                <motion.div variants={fadeInUp}>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("signup.form.emailLabel")}
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder={t("signup.form.emailPlaceholder")}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 outline-none focus:ring-2",
                        fieldErrors.email
                          ? "border-red-500/50 focus:ring-red-500/30"
                          : "border-[hsl(var(--border))] focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50"
                      )}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {fieldErrors.email}
                    </p>
                  )}
                </motion.div>

                {/* Password field */}
                <motion.div variants={fadeInUp}>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("signup.form.passwordLabel")}
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder={t("signup.form.passwordPlaceholder")}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? "password-error" : undefined}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 outline-none focus:ring-2",
                        fieldErrors.password
                          ? "border-red-500/50 focus:ring-red-500/30"
                          : "border-[hsl(var(--border))] focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t("signup.form.hidePassword") : t("signup.form.showPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="password-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {fieldErrors.password}
                    </p>
                  )}
                  {/* Password strength hint */}
                  {password && !fieldErrors.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              password.length >= level * 2
                                ? level <= 1
                                  ? "bg-red-400"
                                  : level <= 2
                                  ? "bg-amber-400"
                                  : level <= 3
                                  ? "bg-yellow-400"
                                  : "bg-emerald-400"
                                : "bg-[hsl(var(--border))]"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t("signup.form.passwordHint")}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Confirm password field */}
                <motion.div variants={fadeInUp}>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("signup.form.confirmPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder={t("signup.form.confirmPasswordPlaceholder")}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 outline-none focus:ring-2",
                        fieldErrors.confirmPassword
                          ? "border-red-500/50 focus:ring-red-500/30"
                          : confirmPassword && confirmPassword === password
                          ? "border-emerald-500/50 focus:ring-emerald-500/30"
                          : "border-[hsl(var(--border))] focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? t("signup.form.hidePassword") : t("signup.form.showPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    {confirmPassword && confirmPassword === password && (
                      <CheckCircle
                        className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p id="confirm-password-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </motion.div>

                {/* Submit button */}
                <motion.div variants={fadeInUp}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={cn(
                      "relative w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-4px_rgba(0,0,0,0.2)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                      isLoading
                        ? "cursor-not-allowed opacity-70"
                        : "hover:opacity-90 active:opacity-80"
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        {t("signup.form.submitting")}
                      </span>
                    ) : (
                      t("signup.form.submit")
                    )}
                  </motion.button>
                </motion.div>

                {/* Terms note */}
                <motion.p variants={fadeInUp} className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                  {t("signup.form.termsNote")}
                </motion.p>
              </motion.div>
            </form>
          )}

          {/* Login link */}
          {!success && (
            <motion.div variants={fadeInUp} className="mt-6 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {t("signup.loginPrompt")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                >
                  {t("signup.loginLink")}
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </Reveal>
    </main>
  );
}
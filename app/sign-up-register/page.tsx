"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SignUpRegisterPage() {
  const t = useTranslations();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = t("signUpRegister.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("signUpRegister.errors.emailInvalid");
    }
    if (!formData.password) {
      newErrors.password = t("signUpRegister.errors.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("signUpRegister.errors.passwordLength");
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("signUpRegister.errors.confirmRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("signUpRegister.errors.passwordMismatch");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        setServerError(error.message);
      } else {
        setSuccessMessage(t("signUpRegister.success"));
      }
    } catch {
      setServerError(t("signUpRegister.errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const perks = (
    Array.isArray(t.raw("signUpRegister.perks"))
      ? t.raw("signUpRegister.perks")
      : []
  ) as { text: string }[];

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400"][passwordStrength];

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: Branding panel */}
        <Reveal className="hidden lg:flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent)] mb-6">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("signUpRegister.badge")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] leading-tight text-balance">
              {t("signUpRegister.heading")}
            </h1>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] leading-relaxed text-pretty">
              {t("signUpRegister.subheading")}
            </p>
          </div>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {perks.map((perk, i) => (
              <motion.li
                key={i}
                variants={fadeInUp}
                className="flex items-center gap-3 text-[hsl(var(--foreground))]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
                  <CheckCircle className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed">{perk.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.10)]">
            <p className="text-sm italic text-[hsl(var(--muted-foreground))] leading-relaxed">
              {t("signUpRegister.testimonial.quote")}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <User className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
                  {t("signUpRegister.testimonial.author")}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t("signUpRegister.testimonial.role")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right: Form panel */}
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)]">

            {/* Mobile heading */}
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                {t("signUpRegister.formTitle")}
              </h1>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {t("signUpRegister.formSubtitle")}
              </p>
            </div>

            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                {t("signUpRegister.formTitle")}
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {t("signUpRegister.formSubtitle")}
              </p>
            </div>

            {successMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/15">
                  <CheckCircle className="h-8 w-8 text-[var(--accent)]" aria-hidden="true" />
                </div>
                <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                  {successMessage}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t("signUpRegister.successHint")}
                </p>
                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--background))] transition-all duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {t("signUpRegister.goToLogin")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("signUpRegister.emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder={t("signUpRegister.emailPlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50",
                        errors.email
                          ? "border-red-400 focus:ring-red-400/40"
                          : "border-[hsl(var(--border))] hover:border-[var(--accent)]/40"
                      )}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-xs text-red-500" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("signUpRegister.passwordLabel")}
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder={t("signUpRegister.passwordPlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50",
                        errors.password
                          ? "border-red-400 focus:ring-red-400/40"
                          : "border-[hsl(var(--border))] hover:border-[var(--accent)]/40"
                      )}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      aria-label={showPassword ? t("signUpRegister.hidePassword") : t("signUpRegister.showPassword")}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              passwordStrength >= level
                                ? strengthColor
                                : "bg-[hsl(var(--border))]"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t("signUpRegister.strength")}: <span className="font-medium text-[hsl(var(--foreground))]">{strengthLabel}</span>
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p id="password-error" className="text-xs text-red-500" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t("signUpRegister.confirmLabel")}
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
                      aria-hidden="true"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      placeholder={t("signUpRegister.confirmPlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-[hsl(var(--background))] py-2.5 pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50",
                        errors.confirmPassword
                          ? "border-red-400 focus:ring-red-400/40"
                          : "border-[hsl(var(--border))] hover:border-[var(--accent)]/40"
                      )}
                      aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      aria-label={showConfirm ? t("signUpRegister.hidePassword") : t("signUpRegister.showPassword")}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-error" className="text-xs text-red-500" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-sm text-red-600"
                    role="alert"
                  >
                    {serverError}
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[hsl(var(--background))] transition-all duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      {t("signUpRegister.submitting")}
                    </>
                  ) : (
                    <>
                      {t("signUpRegister.submit")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                  {t("signUpRegister.hasAccount")}{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                  >
                    {t("signUpRegister.signInLink")}
                  </Link>
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
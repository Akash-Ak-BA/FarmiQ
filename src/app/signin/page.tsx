"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { LanguageBar } from "@/components/common/LanguageBar";
import { useTranslation } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

export default function SignInPage() {
  const { t } = useTranslation();
  const { refreshUser } = useUser();
  const router = useRouter();
  const [phone, setPhone] = useState("98765 43210");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to sign in");
        setLoading(false);
        return;
      }

      await refreshUser();
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="s">
      {/* Big Branding Header */}
      <Header isBig />

      {/* Form Body */}
      <main className="bd justify-start pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="lb">{t("signin.phone")}</label>
            <input
              type="tel"
              className="i"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("signin.phone_placeholder")}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="lb">{t("signin.password")}</label>
            <input
              type="password"
              className="i"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="b w-full flex items-center justify-center font-bold disabled:opacity-60"
            >
              {loading ? "Signing in..." : t("signin.btn_signin")}
            </button>

            <Link
              href="/create-account"
              className="b o w-full flex items-center justify-center font-bold text-center no-underline"
            >
              {t("signin.btn_create")}
            </Link>
          </div>

          <div className="text-center mt-3 text-[14px] m flex flex-col gap-1">
            <p>{t("signin.stay_signed_in")}</p>
            <p>{t("signin.forgot_password")}</p>
          </div>
        </form>
      </main>

      {/* Language Bar */}
      <LanguageBar />
    </div>
  );
}

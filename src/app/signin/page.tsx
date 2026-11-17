"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { LanguageBar } from "@/components/common/LanguageBar";
import { useTranslation } from "@/context/LanguageContext";

export default function SignInPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState("98765 43210");
  const [password, setPassword] = useState("••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  return (
    <div className="s">
      {/* Big Branding Header */}
      <Header isBig />

      {/* Form Body */}
      <main className="bd justify-start pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="lb">{t("signin.phone")}</label>
            <input
              type="tel"
              className="i"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("signin.phone_placeholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="lb">{t("signin.password")}</label>
            <input
              type="password"
              className="i"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button type="submit" className="b w-full flex items-center justify-center font-bold">
              {t("signin.btn_signin")}
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

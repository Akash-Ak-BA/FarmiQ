"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { LanguageBar } from "@/components/common/LanguageBar";
import { useTranslation } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

export default function CreateAccountPage() {
  const { t, language } = useTranslation();
  const { refreshUser } = useUser();
  const router = useRouter();
  const [name, setName] = useState("Murugan");
  const [phone, setPhone] = useState("98765 43210");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          district,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account");
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
      <Header title={t("create_account.title")} showBack />

      <main className="bd overflow-y-auto">
        {/* Centered Plant Icon */}
        <div className="flex justify-center pt-2 pb-1">
          <Image
            src="/farmiq_plant_green.svg"
            alt="Plant"
            width={48}
            height={48}
            className="w-12 h-12"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="lb">{t("create_account.name")}</label>
            <input
              type="text"
              className="i"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("create_account.name_placeholder")}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="lb">{t("create_account.phone")}</label>
            <input
              type="tel"
              className="i"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("create_account.phone_placeholder")}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="lb">{t("create_account.password")}</label>
            <input
              type="password"
              className="i"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="lb">{t("create_account.district")}</label>
            <input
              type="text"
              className="i"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t("create_account.district_placeholder")}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="b w-full flex items-center justify-center font-bold disabled:opacity-60"
            >
              {loading ? "Creating account..." : t("create_account.btn_create")}
            </button>
          </div>
        </form>
      </main>

      <LanguageBar />
    </div>
  );
}

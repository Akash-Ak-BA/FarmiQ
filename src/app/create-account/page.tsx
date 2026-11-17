"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { LanguageBar } from "@/components/common/LanguageBar";
import { useTranslation } from "@/context/LanguageContext";

export default function CreateAccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("Murugan");
  const [phone, setPhone] = useState("98765 43210");
  const [password, setPassword] = useState("••••••••");
  const [district, setDistrict] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
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
            <button type="submit" className="b w-full flex items-center justify-center font-bold">
              {t("create_account.btn_create")}
            </button>
          </div>
        </form>
      </main>

      <LanguageBar />
    </div>
  );
}

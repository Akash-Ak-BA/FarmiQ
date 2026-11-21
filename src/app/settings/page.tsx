"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { CameraIcon } from "@/components/common/Icons";
import { PrivacyPolicyModal } from "@/components/common/PrivacyPolicyModal";
import { AgriculturalDisclaimer } from "@/components/common/AgriculturalDisclaimer";
import { useTranslation, Language } from "@/context/LanguageContext";
import { useTheme, Theme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, setUserProfile, setUserAvatar } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLang }),
      });
    } catch {}
  };

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch {}
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUserAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUserProfile({ name: "Guest", phone: "", avatar: "" });
    router.push("/signin");
  };

  return (
    <div className="s">
      <Header title="Settings & Profile" showBack />

      <main className="bd overflow-y-auto">
        {/* Hidden Camera / File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* User Profile Card with Photo on Right */}
        <div className="c py-3 px-3.5">
          <div className="r sb items-center">
            <div className="flex-1">
              <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3] tracking-wide">
                Farmer Profile
              </span>
              <h3 className="font-bold text-[18px] text-[#212121] dark:text-[#E8EAE8] mt-1">
                {user.name || "Rama"}
              </h3>
              <p className="m text-[14px]">
                {user.phone ? `Phone: ${user.phone}` : "Signed in"}
              </p>
              {user.district && (
                <p className="m text-[14px]">District: {user.district}</p>
              )}
            </div>

            {/* Profile Avatar on Right */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#2E7D32] bg-[#E8EBE8] dark:bg-[#2A2F2A] flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0"
              title="Tap to change photo"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#2E7D32] dark:text-[#81C784]">
                  <CameraIcon className="w-6 h-6" />
                  <span className="text-[9px] font-bold mt-0.5">Add</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="c py-3 px-3.5">
          <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3] tracking-wide mb-2">
            Language / மொழி / భాష
          </span>
          <div className="flex flex-col gap-2">
            {[
              { id: "en", label: "English" },
              { id: "ta", label: "தமிழ் (Tamil)" },
              { id: "te", label: "తెలుగు (Telugu)" },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLanguageChange(lang.id as Language)}
                className={`ch w-full justify-between font-semibold text-[15px] ${
                  language === lang.id ? "on" : ""
                }`}
              >
                <span>{lang.label}</span>
                {language === lang.id && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="c py-3 px-3.5">
          <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3] tracking-wide mb-2">
            Appearance
          </span>
          <div className="flex gap-2">
            {[
              { id: "dark", label: "Dark" },
              { id: "light", label: "Light" },
              { id: "system", label: "System" },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => handleThemeChange(th.id as Theme)}
                className={`ch flex-1 font-semibold text-[14px] ${
                  theme === th.id ? "on" : ""
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Policy & Data Sovereignty Section */}
        <div className="c py-3 px-3.5">
          <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3] tracking-wide mb-1">
            Privacy & Legal Protection
          </span>
          <p className="text-[13px] text-[#5F6368] dark:text-[#A3A8A3] leading-relaxed mb-3">
            Your farm data is protected under the Digital Personal Data Protection (DPDP) Act, 2023. You own 100% of your farm records.
          </p>
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="b o w-full flex items-center justify-center font-bold text-sm py-2"
          >
            📜 View Farmer Privacy Policy & Rights
          </button>
        </div>

        {/* Statutory Agricultural Advisory Disclaimer */}
        <AgriculturalDisclaimer type="general" />

        {/* App Version & Production Details */}
        <div className="c py-3 px-3.5 bg-gray-50 dark:bg-[#141514]">
          <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3] tracking-wide mb-2">
            App Information & Standards
          </span>
          <div className="flex flex-col gap-1.5 text-xs text-[#5F6368] dark:text-[#A3A8A3]">
            <div className="flex justify-between">
              <span>App Version:</span>
              <strong className="text-[#212121] dark:text-[#E8EAE8]">FarmiQ v1.0.0</strong>
            </div>
            <div className="flex justify-between">
              <span>Build Number:</span>
              <span className="font-mono text-[#212121] dark:text-[#E8EAE8]">2026.11-PROD</span>
            </div>
            <div className="flex justify-between">
              <span>Architecture:</span>
              <span>Next.js 14 PWA (Offline Ready)</span>
            </div>
            <div className="flex justify-between">
              <span>Database Engine:</span>
              <span>MySQL 8.4 / TiDB Cloud (Row-Isolated)</span>
            </div>
            <div className="flex justify-between">
              <span>Regulatory Compliance:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">DPDP Act 2023 & ICAR / CIBRC</span>
            </div>
            <div className="flex justify-between">
              <span>Languages:</span>
              <span>English, தமிழ் (Tamil), తెలుగు (Telugu)</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-3 pb-2">
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="b o w-full flex items-center justify-center font-bold text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </main>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <BottomNav />
    </div>
  );
}

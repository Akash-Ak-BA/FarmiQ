"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { useTranslation, Language } from "@/context/LanguageContext";
import { useTheme, Theme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, setUserProfile } = useUser();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUserProfile({ name: "Guest", phone: "" });
    router.push("/signin");
  };

  return (
    <div className="s">
      <Header title="Settings" showBack />

      <main className="bd overflow-y-auto">
        {/* User Profile Card */}
        <div className="c py-3 px-3.5">
          <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3] tracking-wide">
            Farmer Profile
          </span>
          <h3 className="font-bold text-[18px] text-[#212121] dark:text-[#E8EAE8] mt-1">
            {user.name || "Murugan"}
          </h3>
          <p className="m text-[14px]">
            {user.phone ? `Phone: ${user.phone}` : "Signed in"}
          </p>
          {user.district && (
            <p className="m text-[14px]">District: {user.district}</p>
          )}
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

        {/* Logout Button */}
        <div className="mt-auto pt-4 pb-2">
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

      <BottomNav />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation, Language } from "@/context/LanguageContext";

export function ScreenNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  const screens = [
    { num: 1, name: "Sign in", path: "/signin" },
    { num: 2, name: "Create account", path: "/create-account" },
    { num: 3, name: "Home", path: "/home" },
    { num: 4, name: "Notifications", path: "/notifications" },
    { num: 5, name: "My crops", path: "/crops" },
    { num: 6, name: "Crop detail & Confirm", path: "/crops/detail" },
    { num: 7, name: "Crop damage check", path: "/scan" },
    { num: 8, name: "Ask FarmiQ (Chatbot)", path: "/ask" },
    { num: 9, name: "Weather (next 5 days)", path: "/weather" },
    { num: 10, name: "Market prices", path: "/market-prices" },
    { num: 11, name: "Inventory", path: "/inventory" },
    { num: 12, name: "Marketplace", path: "/marketplace" },
    { num: 13, name: "Sell your product", path: "/marketplace/sell" },
    { num: 14, name: "Daily log", path: "/daily-log" },
  ];

  const currentScreen = screens.find((s) => s.path === pathname) || {
    num: pathname === "/" ? 3 : 0,
    name: pathname === "/" ? "Home" : "Overview",
  };

  return (
    <>
      {/* Floating Pill Button */}
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#2E7D32] text-white shadow-lg text-xs font-semibold px-3 py-2 rounded-full border border-white/20 flex items-center gap-1.5 active:scale-95 transition-transform"
          aria-label="Screen Navigator"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          <span>Screen {currentScreen.num || "•"}</span>
          <span className="text-[10px] opacity-80">▲</span>
        </button>
      </div>

      {/* Slide-up Screen Selector Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 max-w-[420px] mx-auto bg-white dark:bg-[#1E211E] text-[#212121] dark:text-[#E8EAE8] rounded-t-2xl p-4 z-50 max-h-[85vh] flex flex-col shadow-2xl border-t border-[#E0E3E0] dark:border-[#2E322E]">
            {/* Header with Close and Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E3E0] dark:border-[#2E322E]">
              <div>
                <h3 className="font-bold text-base">All 13 FarmiQ Screens</h3>
                <p className="text-xs text-[#5F6368] dark:text-[#A3A8A3]">Tap any screen to preview</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border border-[#E0E3E0] dark:border-[#2E322E] bg-gray-50 dark:bg-[#2A2F2A]"
                >
                  {resolvedTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Language Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-[#E0E3E0] dark:border-[#2E322E] text-xs">
              <span className="font-medium text-[#5F6368] dark:text-[#A3A8A3]">Language:</span>
              <div className="flex gap-1.5">
                {(["en", "ta", "te"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      language === l
                        ? "bg-[#2E7D32] text-white"
                        : "bg-gray-100 dark:bg-[#2A2F2A] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {l === "en" ? "EN" : l === "ta" ? "தமிழ்" : "తెలుగు"}
                  </button>
                ))}
              </div>
            </div>

            {/* List of 13 Screens */}
            <div className="overflow-y-auto py-2 flex-1 flex flex-col gap-1.5">
              {screens.map((screen) => {
                const isActive = pathname === screen.path;
                return (
                  <Link
                    key={screen.num}
                    href={screen.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#2E7D32] text-white font-bold"
                        : "hover:bg-gray-100 dark:hover:bg-[#2A2F2A] text-[#212121] dark:text-[#E8EAE8]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? "bg-white text-[#2E7D32]"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {screen.num}
                      </span>
                      <span>{screen.name}</span>
                    </div>
                    {isActive && <span className="text-xs">Active</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

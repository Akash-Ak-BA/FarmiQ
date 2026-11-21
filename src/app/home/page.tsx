"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import {
  PlantIcon,
  CheckIcon,
  CameraIcon,
  SunIcon,
  RupeeIcon,
  BoxIcon,
  StoreIcon,
  ClipboardIcon,
} from "@/components/common/Icons";
import { useTranslation } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [currentDateStr, setCurrentDateStr] = useState("Tuesday, 17 Nov");

  useEffect(() => {
    // Dynamic real date
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(now);
    setCurrentDateStr(formatted);
  }, []);

  const tiles = [
    { label: t("home.tile_crops"), href: "/crops", icon: PlantIcon },
    { label: t("home.tile_tasks"), href: "/crops/detail", icon: CheckIcon },
    { label: t("home.tile_scan"), href: "/scan", icon: CameraIcon },
    { label: t("home.tile_weather"), href: "/weather", icon: SunIcon },
    { label: t("home.tile_prices"), href: "/market-prices", icon: RupeeIcon },
    { label: t("home.tile_inventory"), href: "/inventory", icon: BoxIcon },
    { label: t("home.tile_marketplace"), href: "/marketplace", icon: StoreIcon },
    { label: t("home.tile_log"), href: "/daily-log", icon: ClipboardIcon },
  ];

  return (
    <div className="s">
      {/* Header with Plant logo, FarmiQ Wordmark, Bell with unread count 3 */}
      <Header showBell unreadCount={3} />

      <main className="bd overflow-y-auto">
        {/* User Greeting and Profile Photo on Right */}
        <div className="r sb items-center pt-1">
          <div className="flex flex-col gap-0.5">
            <p className="m text-[14px]">{currentDateStr}</p>
            <h2 className="text-[24px] font-bold tracking-tight">
              {t("home.greeting", { name: user.name || "Murugan" })}
            </h2>
          </div>

          {/* Profile Photo on the right side below notification button */}
          <Link
            href="/settings"
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2E7D32] bg-[#E8EBE8] dark:bg-[#2A2F2A] flex items-center justify-center shadow-sm flex-shrink-0"
            title="Profile & Settings"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-lg text-[#2E7D32] dark:text-[#81C784]">
                {(user.name || "M").charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        </div>

        {/* Weather Alert Banner */}
        <Link href="/weather" className="c w no-underline block hover:opacity-95 transition-opacity">
          <h3 className="font-bold text-[16px] text-[#212121] dark:text-[#E8EAE8]">
            {t("home.weather_alert_title")}
          </h3>
          <p className="m text-[14px] text-[#5F6368] dark:text-[#A3A8A3]">
            {t("home.weather_alert_sub")}
          </p>
        </Link>

        {/* 8 Tiles Grid */}
        <div className="gr">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                href={tile.href}
                className="t no-underline hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Icon className="w-7 h-7 text-[#2E7D32] dark:text-[#81C784]" />
                <span className="font-medium text-[15px]">{tile.label}</span>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

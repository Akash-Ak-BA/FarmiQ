"use client";

import React from "react";
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
import { currentUser } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function HomePage() {
  const { t } = useTranslation();

  const tiles = [
    { label: t("home.tile_crops"), href: "/crops", icon: PlantIcon },
    { label: t("home.tile_tasks"), href: "/crops/detail", icon: CheckIcon },
    { label: t("home.tile_scan"), href: "/scan", icon: CameraIcon },
    { label: t("home.tile_weather"), href: "/weather", icon: SunIcon },
    { label: t("home.tile_prices"), href: "/market-prices", icon: RupeeIcon },
    { label: t("home.tile_inventory"), href: "/inventory", icon: BoxIcon },
    { label: t("home.tile_marketplace"), href: "/marketplace", icon: StoreIcon },
    { label: t("home.tile_log"), href: "/home", icon: ClipboardIcon },
  ];

  return (
    <div className="s">
      {/* Header with Plant logo, FarmiQ Wordmark, Bell with unread count 3 */}
      <Header showBell unreadCount={3} />

      <main className="bd overflow-y-auto">
        {/* User Greeting */}
        <div className="flex flex-col gap-0.5 pt-1">
          <p className="m text-[14px]">Tuesday, 17 Nov</p>
          <h2 className="text-[24px] font-bold tracking-tight">
            {t("home.greeting", { name: currentUser.name })}
          </h2>
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

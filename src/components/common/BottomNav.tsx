"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlantIcon, ChatIcon, CheckIcon } from "./Icons";
import { useTranslation } from "@/context/LanguageContext";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { label: t("nav.home"), path: "/home", icon: HomeIcon },
    { label: t("nav.crops"), path: "/crops", icon: PlantIcon },
    { label: t("nav.ask"), path: "/ask", icon: ChatIcon },
    { label: t("nav.tasks"), path: "/crops/detail", icon: CheckIcon },
  ];

  return (
    <nav className="nv">
      {navItems.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path === "/crops" && pathname.startsWith("/crops") && pathname !== "/crops/detail") ||
          (item.path === "/home" && pathname === "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={isActive ? "on" : ""}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

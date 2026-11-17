"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { sampleNotifications } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="s">
      <Header title={t("notifications.title")} showBack />

      <main className="bd overflow-y-auto">
        <p className="m text-[15px] pt-1">{t("notifications.subtitle")}</p>

        <div className="flex flex-col gap-2.5">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.link || "#"}
              className="c no-underline hover:opacity-95 transition-opacity"
            >
              {!item.isRead && (
                <div className="flex items-center justify-center pb-0.5">
                  <span className="un" />
                </div>
              )}
              <h3 className="font-bold text-[16px] text-center leading-snug">
                {item.title}
              </h3>
              <p className="m text-[14px] text-center">{item.subtitle}</p>
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-4 pb-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="b o w-full flex items-center justify-center font-bold"
          >
            {t("notifications.mark_all_read")}
          </button>
        </div>
      </main>
    </div>
  );
}

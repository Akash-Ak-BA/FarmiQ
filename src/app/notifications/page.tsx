"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { useTranslation } from "@/context/LanguageContext";
import { useNotifications, NotificationItem } from "@/context/NotificationContext";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
  };

  return (
    <div className="s">
      <Header title={t("notifications.title")} showBack />

      <main className="bd overflow-y-auto">
        <div className="r sb items-center pt-1 pb-1">
          <p className="m text-[15px]">{t("notifications.subtitle")}</p>
          {unreadCount > 0 && (
            <span className="p font-bold text-xs">
              {unreadCount} unread
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#5F6368] dark:text-[#A3A8A3]">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="c py-12 text-center">
            <p className="font-semibold text-base mb-1">No notifications yet</p>
            <p className="m text-sm">You are all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((item) => (
              <Link
                key={item.id}
                href={item.link || "#"}
                onClick={() => handleNotificationClick(item)}
                className={`c no-underline hover:opacity-95 transition-all text-left ${
                  !item.isRead
                    ? "border-l-4 border-l-[#2E7D32] bg-emerald-50/30 dark:bg-emerald-950/15"
                    : "opacity-80"
                }`}
              >
                <div className="r sb items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#A3A8A3]">
                    {item.type}
                  </span>
                  {!item.isRead ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] dark:text-[#81C784]">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                      New
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#5F6368] dark:text-[#A3A8A3]">
                      Read
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-[16px] leading-snug text-[#212121] dark:text-[#E8EAE8]">
                  {item.title}
                </h3>
                {item.body && (
                  <p className="m text-[14px] mt-0.5 leading-relaxed">
                    {item.body}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {notifications.length > 0 && unreadCount > 0 && (
          <div className="mt-auto pt-4 pb-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="b o w-full flex items-center justify-center font-bold"
            >
              {t("notifications.mark_all_read")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

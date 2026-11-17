"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon, BellIcon, PlantIcon } from "./Icons";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showBell?: boolean;
  unreadCount?: number;
  isBig?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  showBack,
  onBack,
  showBell = false,
  unreadCount = 0,
  isBig = false,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  if (isBig) {
    return (
      <header className="hd big">
        <Image
          src="/farmiq_plant_white.svg"
          alt="FarmiQ Logo"
          width={48}
          height={48}
          priority
        />
        <Image
          src="/farmiq_wordmark.png"
          alt="FarmiQ"
          width={150}
          height={38}
          className="h-8 w-auto object-contain"
          priority
        />
      </header>
    );
  }

  return (
    <header className="hd">
      {/* Left Slot: Back or Plant Logo */}
      <div className="flex items-center justify-center w-full h-full">
        {showBack ? (
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="ib"
            aria-label="Back"
          >
            <BackIcon />
          </button>
        ) : (
          <Link href="/home" className="ib" aria-label="Home">
            <PlantIcon className="w-6 h-6 text-white" />
          </Link>
        )}
      </div>

      {/* Center Slot: Title or Wordmark */}
      <div className="flex items-center justify-center font-semibold text-[19px] truncate px-2">
        {title ? (
          <span className="truncate">{title}</span>
        ) : (
          <Image
            src="/farmiq_wordmark.png"
            alt="FarmiQ"
            width={110}
            height={28}
            className="h-6 w-auto object-contain"
            priority
          />
        )}
      </div>

      {/* Right Slot: Bell or Action or Empty */}
      <div className="flex items-center justify-center w-full h-full">
        {rightAction ? (
          rightAction
        ) : showBell ? (
          <Link href="/notifications" className="ib" aria-label="Notifications">
            <BellIcon />
            {unreadCount > 0 && <span className="dot">{unreadCount}</span>}
          </Link>
        ) : (
          <div className="w-[52px]" />
        )}
      </div>
    </header>
  );
}

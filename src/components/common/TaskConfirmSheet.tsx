"use client";

import React from "react";
import { useTranslation } from "@/context/LanguageContext";

interface TaskConfirmSheetProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TaskConfirmSheet({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
}: TaskConfirmSheetProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop (.sc) */}
      <div
        className="sc z-40 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Bottom Sheet (.sh) */}
      <div className="sh z-50 animate-in slide-in-from-bottom duration-200">
        <h2 className="text-[20px] font-bold leading-snug">
          {t("crop_detail.confirm_title", { task: taskTitle })}
        </h2>
        <p className="m text-[15px]">
          {t("crop_detail.confirm_sub")}
        </p>

        <div className="flex flex-col gap-2.5 mt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="b w-full flex items-center justify-center font-bold"
          >
            {t("crop_detail.yes_completed")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="b o w-full flex items-center justify-center font-bold"
          >
            {t("crop_detail.not_yet")}
          </button>
        </div>
      </div>
    </>
  );
}

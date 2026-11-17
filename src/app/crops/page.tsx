"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { sampleCrops } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function MyCropsPage() {
  const { t } = useTranslation();

  return (
    <div className="s">
      <Header title={t("crops.title")} />

      <main className="bd overflow-y-auto">
        <div className="flex flex-col gap-3">
          {sampleCrops.map((crop) => (
            <Link
              key={crop.id}
              href={`/crops/detail`}
              className="c no-underline hover:opacity-95 transition-opacity"
            >
              {/* Header row with Name and Plot */}
              <div className="r sb">
                <h3 className="font-bold text-[18px]">{crop.cropName}</h3>
                <span className="m text-[15px]">{crop.plotName}</span>
              </div>

              {/* Stage Pill */}
              <div className="my-1">
                <span className="p">{crop.stage}</span>
              </div>

              {/* Harvest Prediction */}
              <p className="font-medium text-[15px] text-[#212121] dark:text-[#E8EAE8]">
                {t("crops.harvest_in", {
                  days: crop.harvestInDays,
                  date: crop.harvestDate,
                })}
              </p>

              {/* Next Task */}
              <p className="m text-[14px]">
                {t("crops.next_task", { task: crop.nextTask })}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-4 pb-2">
          <button
            type="button"
            className="b w-full flex items-center justify-center font-bold"
            onClick={() => alert("Add Crop will open form in next step")}
          >
            {t("crops.add_crop")}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

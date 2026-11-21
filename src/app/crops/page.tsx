"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { useTranslation } from "@/context/LanguageContext";
import { SerializedCrop } from "@/lib/crop-service";
import { sampleCrops } from "@/data/mockData";

export default function MyCropsPage() {
  const { t } = useTranslation();
  const [crops, setCrops] = useState<SerializedCrop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrops() {
      try {
        const res = await fetch("/api/crops");
        if (res.ok) {
          const data = await res.json();
          if (data.crops && data.crops.length > 0) {
            setCrops(data.crops);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load crops from MySQL:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCrops();
  }, []);

  return (
    <div className="s">
      <Header title={t("crops.title")} />

      <main className="bd overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#5F6368] dark:text-[#A3A8A3]">
              Loading your crops from database...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {crops.length > 0 ? (
              crops.map((crop) => (
                <Link
                  key={crop.id}
                  href={`/crops/detail?id=${crop.id}`}
                  className="c no-underline hover:opacity-95 transition-opacity"
                >
                  {/* Header row with Name and Plot */}
                  <div className="r sb">
                    <div>
                      <h3 className="font-bold text-[18px] text-[#212121] dark:text-[#E8EAE8]">
                        {crop.cropName}
                        {crop.variety ? (
                          <span className="text-xs font-normal text-[#5F6368] dark:text-[#A3A8A3] ml-1.5">
                            ({crop.variety})
                          </span>
                        ) : null}
                      </h3>
                      {crop.areaAcres ? (
                        <p className="text-xs text-[#5F6368] dark:text-[#A3A8A3] mt-0.5">
                          {crop.areaAcres} Acres
                        </p>
                      ) : null}
                    </div>
                    <span className="m text-[15px] font-semibold">{crop.plotName}</span>
                  </div>

                  {/* Stage Pill & Progress bar */}
                  <div className="my-1.5">
                    <span className="p font-semibold">{crop.currentStage}</span>
                    <div className="bar mt-2">
                      <i style={{ width: `${crop.progressPercent}%` }} />
                    </div>
                  </div>

                  {/* Harvest Prediction */}
                  <p className="font-medium text-[15px] text-[#212121] dark:text-[#E8EAE8] mt-1">
                    {t("crops.harvest_in", {
                      days: crop.daysRemaining,
                      date: crop.harvestDateFormatted,
                    })}
                  </p>

                  {/* Next Task */}
                  <p className="m text-[14px] mt-0.5">
                    {t("crops.next_task", { task: crop.nextTask })}
                  </p>
                </Link>
              ))
            ) : (
              // Fallback to sample crops if no crops found
              sampleCrops.map((crop) => (
                <Link
                  key={crop.id}
                  href={`/crops/detail`}
                  className="c no-underline hover:opacity-95 transition-opacity"
                >
                  <div className="r sb">
                    <h3 className="font-bold text-[18px]">{crop.cropName}</h3>
                    <span className="m text-[15px]">{crop.plotName}</span>
                  </div>
                  <div className="my-1">
                    <span className="p">{crop.stage}</span>
                  </div>
                  <p className="font-medium text-[15px] text-[#212121] dark:text-[#E8EAE8]">
                    {t("crops.harvest_in", {
                      days: crop.harvestInDays,
                      date: crop.harvestDate,
                    })}
                  </p>
                  <p className="m text-[14px]">
                    {t("crops.next_task", { task: crop.nextTask })}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}

        <div className="mt-auto pt-4 pb-2">
          <Link
            href="/crops/add"
            className="b w-full flex items-center justify-center font-bold no-underline text-center"
          >
            {t("crops.add_crop")}
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

"use client";

import React from "react";
import { Header } from "@/components/common/Header";
import { DropIcon, SunIcon, CloudRainIcon } from "@/components/common/Icons";
import { sampleWeather } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function WeatherPage() {
  const { t } = useTranslation();

  return (
    <div className="s">
      <Header title={t("weather.title")} showBack />

      <main className="bd overflow-y-auto">
        {/* Today's Farm Weather Card */}
        <div className="c py-3 px-4">
          <p className="m text-[14px]">{t("weather.today_farm")}</p>
          <div className="r sb items-baseline my-1">
            <span className="text-[36px] font-bold leading-none">
              {sampleWeather.today.temp}
            </span>
            <span className="text-[17px] font-semibold">
              {sampleWeather.today.condition}
            </span>
          </div>
          <p className="m text-[14px]">
            {t("weather.rain_chance", { percent: "20" })}
          </p>
        </div>

        {/* Next 5 Days Header */}
        <h3 className="font-bold text-[16px] pt-1">
          {t("weather.next_5_days")}
        </h3>

        {/* 5 Day Forecast List */}
        <div className="flex flex-col gap-2.5 pb-3">
          {sampleWeather.next5Days.map((item, idx) => (
            <div key={idx} className="c items-center text-center py-2.5">
              <h4 className="font-bold text-[16px]">{item.day}</h4>
              <p className="m text-[14px]">{item.condition}</p>

              <div className="flex items-center justify-center gap-2 mt-1">
                {item.icon === "rain" ? (
                  <DropIcon className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784]" />
                ) : item.icon === "sun" ? (
                  <SunIcon className="w-5 h-5 text-amber-500" />
                ) : (
                  <CloudRainIcon className="w-5 h-5 text-[#5F6368] dark:text-[#A3A8A3]" />
                )}
                <span className="font-bold text-[16px]">{item.temp}</span>
              </div>

              <p className="m text-[13px]">{item.condition.includes("rain") ? `Rain ${item.rain}` : `Rain ${item.rain}`}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

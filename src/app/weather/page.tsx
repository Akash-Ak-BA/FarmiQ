"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { DropIcon, SunIcon, CloudRainIcon } from "@/components/common/Icons";
import { AgriculturalDisclaimer } from "@/components/common/AgriculturalDisclaimer";
import { sampleWeather } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

const districtCoords: Record<string, { lat: number; lon: number; name: string }> = {
  madurai: { lat: 9.9252, lon: 78.1198, name: "Madurai" },
  coimbatore: { lat: 11.0168, lon: 76.9558, name: "Coimbatore" },
  thanjavur: { lat: 10.787, lon: 79.1378, name: "Thanjavur" },
  guntur: { lat: 16.3067, lon: 80.4365, name: "Guntur" },
  tirupati: { lat: 13.6288, lon: 79.4192, name: "Tirupati" },
  salem: { lat: 11.6643, lon: 78.146, name: "Salem" },
};

export default function WeatherPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [locationName, setLocationName] = useState("Madurai");
  const [currentTemp, setCurrentTemp] = useState("31°C");
  const [condition, setCondition] = useState("Partly cloudy");
  const [rainChance, setRainChance] = useState("20%");
  const [forecastDays, setForecastDays] = useState(sampleWeather.next5Days);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [loading, setLoading] = useState(false);

  const fetchLiveWeather = async (lat = 9.9252, lon = 78.1198, locName = "Madurai") => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        const daily = data.daily;

        setCurrentTemp(`${Math.round(current.temperature_2m)}°C`);
        const rainProb = daily.precipitation_probability_max[0] || 20;
        setRainChance(`${rainProb}%`);
        setCondition(rainProb > 50 ? "Rain expected" : rainProb > 20 ? "Partly cloudy" : "Sunny & Clear");

        // Format next 5 days
        const daysList = [];
        for (let i = 1; i <= 5 && i < daily.time.length; i++) {
          const d = new Date(daily.time[i]);
          const dayName = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
          const maxT = Math.round(daily.temperature_2m_max[i]);
          const minT = Math.round(daily.temperature_2m_min[i]);
          const prob = daily.precipitation_probability_max[i] || 0;
          const isRain = prob >= 40;

          daysList.push({
            day: dayName,
            condition: isRain ? (prob > 70 ? "Heavy rain" : "Light rain") : prob > 20 ? "Cloudy" : "Sunny",
            temp: `${maxT}° / ${minT}°`,
            rain: `${prob}%`,
            icon: isRain ? "rain" : prob > 20 ? "cloud" : "sun",
          });
        }

        if (daysList.length > 0) {
          setForecastDays(daysList);
        }
        setLocationName(locName);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      // Fallback stays in place
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userDist = (user.district || "").toLowerCase().trim();
    const match = districtCoords[userDist] || districtCoords.madurai;
    fetchLiveWeather(match.lat, match.lon, user.district || "Madurai");
  }, [user.district]);

  const handleUseGPS = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchLiveWeather(pos.coords.latitude, pos.coords.longitude, "Your Field Location");
        },
        () => {
          fetchLiveWeather();
        }
      );
    }
  };

  return (
    <div className="s">
      <Header title={t("weather.title")} showBack />

      <main className="bd overflow-y-auto">
        {/* Today's Farm Weather Card */}
        <div className="c py-3 px-4">
          <div className="r sb">
            <p className="m text-[14px]">
              {locationName} Farm • Updated: {lastUpdated}
            </p>
            <button
              type="button"
              onClick={handleUseGPS}
              className="text-xs font-semibold text-[#2E7D32] dark:text-[#81C784] underline"
            >
              {loading ? "Updating..." : "Use GPS"}
            </button>
          </div>

          <div className="r sb items-baseline my-1">
            <span className="text-[36px] font-bold leading-none">
              {currentTemp}
            </span>
            <span className="text-[17px] font-semibold">
              {condition}
            </span>
          </div>

          <p className="m text-[14px]">
            {t("weather.rain_chance", { percent: rainChance.replace("%", "") })}
          </p>
        </div>

        {/* Spraying Advice Warning */}
        {parseInt(rainChance) >= 40 ? (
          <div className="c w py-2.5 px-3.5">
            <h4 className="font-bold text-[14px] text-amber-900 dark:text-amber-200">
              ⚠️ Spraying Advisory: Avoid spraying today
            </h4>
            <p className="m text-xs text-amber-800 dark:text-amber-300">
              Rain is likely ({rainChance}). Chemicals will wash off. Wait for dry conditions.
            </p>
          </div>
        ) : (
          <div className="c py-2.5 px-3.5 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
            <h4 className="font-bold text-[14px] text-emerald-800 dark:text-emerald-300">
              ✓ Good weather for spraying & field work
            </h4>
            <p className="m text-xs text-emerald-700 dark:text-emerald-400">
              Low rain probability ({rainChance}). Best time to spray: early morning or late afternoon.
            </p>
          </div>
        )}

        {/* Next 5 Days Header */}
        <h3 className="font-bold text-[16px] pt-1">
          {t("weather.next_5_days")}
        </h3>

        {/* 5 Day Forecast List */}
        <div className="flex flex-col gap-2.5 pb-3">
          {forecastDays.map((item, idx) => (
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

              <p className="m text-[13px]">Rain chance: {item.rain}</p>
            </div>
          ))}

          {/* Meteorological & IMD Advisory */}
          <AgriculturalDisclaimer type="weather" />
        </div>
      </main>
    </div>
  );
}

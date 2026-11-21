"use client";

import React from "react";

interface AgriculturalDisclaimerProps {
  type?: "general" | "chemical" | "weather" | "market";
  className?: string;
}

export function AgriculturalDisclaimer({
  type = "general",
  className = "",
}: AgriculturalDisclaimerProps) {
  let badge = "Statutory Agricultural Advisory";
  let title = "Government & Agricultural Safety Guidelines";
  let content =
    "Advisories provided in FarmiQ are informational guidance based on ICAR recommendations. Critical decisions should be verified with your local Krishi Vigyan Kendra (KVK) or Block Agriculture Officer.";

  if (type === "chemical") {
    badge = "CIBRC Safety Advisory";
    title = "Central Insecticides Board & Registration Committee Notice";
    content =
      "All chemical recommendations must strictly adhere to product label dosages approved by CIBRC. Always observe the Pre-Harvest Interval (PHI / waiting period), wear certified Personal Protective Equipment (gloves and face masks), avoid spraying in high winds, and store containers safely out of reach of children.";
  } else if (type === "weather") {
    badge = "Meteorological Advisory";
    title = "IMD & Agro-Meteorological Forecast Notice";
    content =
      "Weather forecasts are derived from satellite observational data and India Meteorological Department (IMD) / Open-Meteo models. Localized micro-climate variations may occur. Always inspect your field conditions before executing major harvesting, sowing, or pesticide spraying operations.";
  } else if (type === "market") {
    badge = "Fair Trade Notice";
    title = "Direct Farmer-to-Buyer Marketplace Guidelines";
    content =
      "FarmiQ operates as a direct peer-to-peer facilitation platform with 0% middleman commission. Physical inspection of produce, quality certification, logistics, and payment settlements are agreed directly between the seller farmer and buyer. No transaction fees are charged by FarmiQ.";
  }

  return (
    <div
      className={`c w border-l-4 border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/20 py-2.5 px-3 ${className}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          {badge}
        </span>
      </div>
      <h5 className="font-bold text-[13px] text-[#212121] dark:text-[#E8EAE8]">
        {title}
      </h5>
      <p className="text-[12px] leading-relaxed text-[#5F6368] dark:text-[#A3A8A3] mt-0.5">
        {content}
      </p>
    </div>
  );
}

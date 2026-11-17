"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { sampleMarketPrices } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function MarketPricesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"my" | "all">("my");

  const displayedPrices =
    filter === "my"
      ? sampleMarketPrices.filter((p) => p.myCrop)
      : sampleMarketPrices;

  return (
    <div className="s">
      <Header title={t("market_prices.title")} showBack />

      <main className="bd overflow-y-auto">
        <p className="m text-[14px] pt-1">
          {t("market_prices.updated_hint")}
        </p>

        {/* Filter Pills */}
        <div className="flex gap-2 my-1">
          <button
            type="button"
            onClick={() => setFilter("my")}
            className={`ch ${filter === "my" ? "on" : ""}`}
          >
            {t("market_prices.my_crops")}
          </button>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`ch ${filter === "all" ? "on" : ""}`}
          >
            {t("market_prices.all_crops")}
          </button>
        </div>

        {/* Price Cards List */}
        <div className="flex flex-col gap-2.5">
          {displayedPrices.map((item, idx) => (
            <div key={idx} className="c items-center text-center py-3">
              <h4 className="font-bold text-[18px]">{item.crop}</h4>
              <p className="font-bold text-[22px] tracking-tight text-[#212121] dark:text-[#E8EAE8] my-0.5">
                {item.price}
              </p>
              <p className="m text-[14px]">
                {item.change}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Sell CTA */}
        <div className="mt-auto pt-4 pb-2">
          <Link
            href="/marketplace/sell"
            className="b w-full flex items-center justify-center font-bold no-underline text-center"
          >
            {t("market_prices.btn_sell")}
          </Link>
        </div>
      </main>
    </div>
  );
}

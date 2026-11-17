"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { sampleMarketListings } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"buy" | "my">("buy");

  return (
    <div className="s">
      <Header title={t("marketplace.title")} />

      <main className="bd overflow-y-auto">
        {/* Buy / My Listings Filter Pills */}
        <div className="flex gap-2 my-1">
          <button
            type="button"
            onClick={() => setTab("buy")}
            className={`ch ${tab === "buy" ? "on" : ""}`}
          >
            {t("marketplace.tab_buy")}
          </button>
          <button
            type="button"
            onClick={() => setTab("my")}
            className={`ch ${tab === "my" ? "on" : ""}`}
          >
            {t("marketplace.tab_my_listings")}
          </button>
        </div>

        {/* Listings List */}
        <div className="flex flex-col gap-3">
          {sampleMarketListings.map((listing) => (
            <div key={listing.id} className="c py-3 px-3.5">
              <div className="r sb">
                <h4 className="font-bold text-[17px]">{listing.title}</h4>
                <span className="font-bold text-[16px]">{listing.price}</span>
              </div>

              <p className="m text-[14px] mt-0.5 mb-2">{listing.seller}</p>

              <div className="r gap-2 mt-1">
                <a
                  href={`tel:${listing.phone}`}
                  className="b o sm flex-1 flex items-center justify-center font-bold no-underline text-center"
                >
                  {t("marketplace.btn_call")}
                </a>
                <a
                  href={`https://wa.me/91${listing.phone}?text=Hi%2C+I+am+interested+in+your+${encodeURIComponent(listing.title)}+listing+on+FarmiQ.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="b o sm flex-1 flex items-center justify-center font-bold no-underline text-center"
                >
                  {t("marketplace.btn_whatsapp")}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Sell Your Product Button */}
        <div className="mt-auto pt-4 pb-2">
          <Link
            href="/marketplace/sell"
            className="b w-full flex items-center justify-center font-bold no-underline text-center"
          >
            {t("marketplace.btn_sell")}
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

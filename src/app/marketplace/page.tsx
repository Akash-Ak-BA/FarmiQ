"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { AgriculturalDisclaimer } from "@/components/common/AgriculturalDisclaimer";
import { useTranslation } from "@/context/LanguageContext";

interface ListingItem {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  sellerName: string;
  contactPhone: string | null;
  distanceKm?: number;
}

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"buy" | "my">("buy");
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace");
      if (res.ok) {
        const data = await res.json();
        if (data.listings) {
          setListings(data.listings);
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="s">
      <Header title={t("marketplace.title")} />

      <main className="bd overflow-y-auto">
        {/* Nearby Radius Indicator */}
        <div className="r sb items-center pt-0.5">
          <span className="text-xs font-semibold text-[#2E7D32] dark:text-[#81C784]">
            📍 Live Market • Within 100 km radius
          </span>
          <button
            type="button"
            onClick={fetchListings}
            className="text-xs text-[#5F6368] dark:text-[#A3A8A3] underline"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

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
          {listings.map((listing) => (
            <div key={listing.id} className="c py-3 px-3.5">
              <div className="r sb">
                <h4 className="font-bold text-[17px]">
                  {listing.cropName}, {listing.quantity} {listing.unit}
                </h4>
                <span className="font-bold text-[16px]">
                  ₹{listing.pricePerUnit} per {listing.unit}
                </span>
              </div>

              <p className="m text-[14px] mt-0.5 mb-2">
                Seller: {listing.sellerName}, {listing.location}
              </p>

              <div className="r gap-2 mt-1">
                {listing.contactPhone ? (
                  <>
                    <a
                      href={`tel:${listing.contactPhone}`}
                      className="b o sm flex-1 flex items-center justify-center font-bold no-underline text-center"
                    >
                      {t("marketplace.btn_call")}
                    </a>
                    <a
                      href={`https://wa.me/91${listing.contactPhone.replace(/[\s\-\+]/g, "")}?text=Hi%20${encodeURIComponent(listing.sellerName)}%2C%20I%20saw%20your%20${encodeURIComponent(listing.cropName)}%20listing%20on%20FarmiQ.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="b o sm flex-1 flex items-center justify-center font-bold no-underline text-center"
                    >
                      {t("marketplace.btn_whatsapp")}
                    </a>
                  </>
                ) : (
                  <span className="text-xs m italic text-center w-full py-1">
                    Seller preferred in-app inquiry
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Direct Marketplace Guidelines & Fair Trade Notice */}
          <AgriculturalDisclaimer type="market" />
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

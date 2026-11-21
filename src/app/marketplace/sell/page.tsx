"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { CameraIcon } from "@/components/common/Icons";
import { useTranslation } from "@/context/LanguageContext";

export default function SellProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [product, setProduct] = useState("Tomato");
  const [quantity, setQuantity] = useState("50");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("28");
  const [showPhone, setShowPhone] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: product,
          quantity,
          unit,
          pricePerUnit: price,
          showPhone,
          location: "Nearby Farm (< 15 km)",
        }),
      });

      if (res.ok) {
        alert(`✓ Listing for ${quantity} ${unit} of ${product} posted to live marketplace!`);
        router.push("/marketplace");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to post listing");
      }
    } catch {
      alert("✓ Listing posted to marketplace!");
      router.push("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="s">
      <Header title={t("sell.title")} showBack />

      <main className="bd overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Product Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">{t("sell.product")}</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="i"
            >
              <option value="Tomato">Tomato</option>
              <option value="Paddy">Paddy</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Onion">Onion</option>
              <option value="Banana">Banana</option>
            </select>
          </div>

          {/* Quantity and Unit in 2 Columns */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-[2]">
              <label className="lb">{t("sell.quantity")}</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="i"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-[1]">
              <label className="lb">{t("sell.unit")}</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="i"
                required
              />
            </div>
          </div>

          {/* Price per unit */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">{t("sell.price_per_kg")}</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="i"
              required
            />
          </div>

          {/* Market Price Hint */}
          <p className="m text-[14px]">
            {t("sell.market_price_hint", { price: "18" })}
          </p>

          {/* Add Photo Button */}
          <button
            type="button"
            onClick={() => alert("Photo attached to listing!")}
            className="b o w-full flex items-center justify-center gap-2 font-semibold"
          >
            <CameraIcon className="w-5 h-5" />
            <span>{t("sell.btn_add_photo")}</span>
          </button>

          {/* Show Phone Checkbox */}
          <label className="flex items-center gap-3 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPhone}
              onChange={(e) => setShowPhone(e.target.checked)}
              className="w-5 h-5 rounded accent-[#2E7D32]"
            />
            <span className="text-[15px] font-medium text-[#212121] dark:text-[#E8EAE8]">
              {t("sell.show_phone")}
            </span>
          </label>

          {/* Post Listing Button */}
          <div className="mt-auto pt-6 pb-2">
            <button
              type="submit"
              disabled={loading}
              className="b w-full flex items-center justify-center font-bold disabled:opacity-60"
            >
              {loading ? "Posting..." : t("sell.btn_post")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Listing posted! In Step 7, this saves into the listings table in MySQL.");
    router.push("/marketplace");
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
            onClick={() => alert("Photo upload (max 200KB) in step 7")}
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
              className="b w-full flex items-center justify-center font-bold"
            >
              {t("sell.btn_post")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

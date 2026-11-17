"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { PlusIcon } from "@/components/common/Icons";
import { sampleInventory } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function InventoryPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState(sampleInventory);

  const handleUse = (id: number) => {
    alert("In step 6, 'Use' creates an activity and inventory_movements record in MySQL!");
  };

  const handleAdd = (id: number) => {
    alert("In step 6, 'Add' increases stock quantity!");
  };

  const lowCount = items.filter((i) => i.isLow).length;

  return (
    <div className="s">
      <Header
        title={t("inventory.title")}
        rightAction={
          <button
            type="button"
            onClick={() => alert("Add Item dialog")}
            className="ib"
            aria-label="Add item"
          >
            <PlusIcon />
          </button>
        }
      />

      <main className="bd overflow-y-auto">
        {/* Low Stock Warning Banner */}
        {lowCount > 0 && (
          <div className="c w py-2.5 px-3.5">
            <h4 className="font-bold text-[15px] text-[#212121] dark:text-[#E8EAE8]">
              {t("inventory.low_alert", { count: lowCount })}
            </h4>
          </div>
        )}

        {/* Inventory Items List */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="c items-center text-center py-3">
              <h4 className="font-bold text-[17px]">{item.name}</h4>
              <p className="m text-[15px]">{item.qty}</p>

              {item.isLow && (
                <div className="my-1">
                  <span className="p font-semibold">Low</span>
                </div>
              )}

              <div className="r justify-center gap-2.5 mt-2 w-full max-w-[200px]">
                <button
                  type="button"
                  onClick={() => handleUse(item.id)}
                  className="b o sm flex-1 flex items-center justify-center font-bold"
                >
                  {t("inventory.btn_use")}
                </button>
                <button
                  type="button"
                  onClick={() => handleAdd(item.id)}
                  className="b sm flex-1 flex items-center justify-center font-bold"
                >
                  {t("inventory.btn_add")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Bottom Button */}
        <div className="mt-auto pt-4 pb-2">
          <button
            type="button"
            onClick={() => alert("Add item will open in step 6")}
            className="b w-full flex items-center justify-center font-bold"
          >
            {t("inventory.btn_add_item")}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

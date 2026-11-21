"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { PlusIcon, CameraIcon } from "@/components/common/Icons";
import { sampleInventory } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

interface InvItem {
  id: number;
  name: string;
  qty: string;
  rawQty?: number;
  isLow: boolean;
}

export default function InventoryPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<InvItem[]>(sampleInventory);

  // "Use Item" state
  const [useModalItem, setUseModalItem] = useState<InvItem | null>(null);
  const [useQty, setUseQty] = useState("1");
  const [usePhoto, setUsePhoto] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("farmiq_inventory_items");
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (Array.isArray(saved) && saved.length > 0) {
          setItems([...saved, ...sampleInventory]);
        }
      }
    } catch {}
  }, []);

  const handleOpenUseModal = (item: InvItem) => {
    setUseModalItem(item);
    setUseQty("1");
    setUsePhoto(null);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUsePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmUse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useModalItem) return;

    if (!usePhoto) {
      alert("Please take or upload a photo of the bag or application to verify usage.");
      return;
    }

    // Update quantity
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === useModalItem.id) {
          return {
            ...i,
            qty: `Used (${useQty}) • Updated`,
            isLow: true,
          };
        }
        return i;
      })
    );

    alert(`✓ Recorded: ${useQty} of ${useModalItem.name} used. Verification photo saved to inventory log!`);
    setUseModalItem(null);
    setUsePhoto(null);
  };

  const handleAddStock = (item: InvItem) => {
    const addAmt = prompt(`How many units to add to ${item.name}?`, "1");
    if (addAmt) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, qty: `Stock added (+${addAmt})`, isLow: false } : i
        )
      );
    }
  };

  const lowCount = items.filter((i) => i.isLow).length;

  return (
    <div className="s">
      <Header
        title={t("inventory.title")}
        rightAction={
          <Link href="/inventory/add" className="ib" aria-label="Add item">
            <PlusIcon />
          </Link>
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
                  onClick={() => handleOpenUseModal(item)}
                  className="b o sm flex-1 flex items-center justify-center font-bold"
                >
                  {t("inventory.btn_use")}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddStock(item)}
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
          <Link
            href="/inventory/add"
            className="b w-full flex items-center justify-center font-bold no-underline text-center"
          >
            {t("inventory.btn_add_item")}
          </Link>
        </div>
      </main>

      {/* "Use Item" Verification Modal */}
      {useModalItem && (
        <>
          <div
            className="sc z-40 transition-opacity"
            onClick={() => setUseModalItem(null)}
            aria-hidden="true"
          />
          <div className="sh z-50">
            <div className="r sb pb-1">
              <div>
                <h3 className="font-bold text-[18px]">Use {useModalItem.name}</h3>
                <p className="m text-xs">Verify usage with quantity and photo</p>
              </div>
              <button
                type="button"
                onClick={() => setUseModalItem(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#2A2F2A] flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmUse} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="lb">Quantity Used</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={useQty}
                  onChange={(e) => setUseQty(e.target.value)}
                  className="i"
                  required
                />
              </div>

              {/* Photo Verification Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              <div className="flex flex-col gap-1">
                <label className="lb">Photo Verification (Required)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="ph border-2 border-dashed border-[#9AA09A] hover:border-[#2E7D32] flex flex-col items-center justify-center cursor-pointer p-2 rounded-lg"
                >
                  {usePhoto ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={usePhoto}
                        alt="Usage verification"
                        className="max-h-[90px] w-auto object-contain rounded"
                      />
                      <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        ✓ Photo attached
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#2E7D32] dark:text-[#81C784]">
                      <CameraIcon className="w-6 h-6" />
                      <span className="text-xs font-bold">Take photo of bag / field</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="b w-full flex items-center justify-center font-bold"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { PlusIcon } from "@/components/common/Icons";
import { useTranslation } from "@/context/LanguageContext";

interface Activity {
  id: number;
  crop: string;
  type: string;
  time: string;
  date?: string;
  notes: string;
  cost?: number;
}

const initialActivities: Activity[] = [
  {
    id: 1,
    crop: "Paddy (Plot A)",
    type: "Watering",
    time: "6:30 am",
    date: "Today, 21 Nov",
    notes: "Canal water release for 2 hours",
    cost: 0,
  },
  {
    id: 2,
    crop: "Tomato (Plot B)",
    type: "Fertilizer",
    time: "8:15 am",
    date: "Today, 21 Nov",
    notes: "Applied 1 bag Urea fertilizer",
    cost: 350,
  },
  {
    id: 3,
    crop: "Groundnut (Plot C)",
    type: "Labour",
    time: "11:00 am",
    date: "Today, 21 Nov",
    notes: "2 workers for field weeding",
    cost: 600,
  },
  {
    id: 4,
    crop: "Paddy (Plot A)",
    type: "Sowing",
    time: "Day 1",
    date: "17 Sep 2026",
    notes: "Transplanted 25-day nursery seedlings into puddled field",
    cost: 1200,
  },
  {
    id: 5,
    crop: "Tomato (Plot B)",
    type: "Sowing",
    time: "Day 1",
    date: "27 Aug 2026",
    notes: "Transplanted PKM-1 seedlings on ridges",
    cost: 800,
  },
];

export default function DailyLogPage() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpendBreakdownOpen, setIsSpendBreakdownOpen] = useState(false);

  // Form states
  const [crop, setCrop] = useState("Paddy (Plot A)");
  const [type, setType] = useState("Watering");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("farmiq_daily_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActivities([...parsed, ...initialActivities]);
        }
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      id: Date.now(),
      crop,
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: "Today, 21 Nov",
      notes: notes || "Regular farm activity",
      cost: cost ? parseFloat(cost) : 0,
    };

    const updated = [newActivity, ...activities];
    setActivities(updated);
    try {
      localStorage.setItem("farmiq_daily_logs", JSON.stringify([newActivity]));
    } catch {}

    setIsModalOpen(false);
    setNotes("");
    setCost("");
  };

  // Calculate Spend by Crop
  const spendByCrop = activities.reduce((acc, curr) => {
    const cropKey = curr.crop.includes("Paddy")
      ? "Paddy"
      : curr.crop.includes("Tomato")
      ? "Tomato"
      : curr.crop.includes("Groundnut")
      ? "Groundnut"
      : "General Farm";
    acc[cropKey] = (acc[cropKey] || 0) + (curr.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalCost = Object.values(spendByCrop).reduce((a, b) => a + b, 0);

  return (
    <div className="s">
      <Header
        title={t("daily_log.title")}
        showBack
        rightAction={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="ib"
            aria-label="Add log"
          >
            <PlusIcon />
          </button>
        }
      />

      <main className="bd overflow-y-auto">
        {/* Date and Clickable Total Spend Card */}
        <div
          onClick={() => setIsSpendBreakdownOpen(true)}
          className="c w py-3 px-3.5 cursor-pointer hover:border-[#2E7D32] transition-colors"
          title="Tap to view crop-wise spend breakdown"
        >
          <div className="r sb items-center">
            <div>
              <p className="m text-[13px]">Farm Spend Tracking</p>
              <h3 className="font-bold text-[17px] text-[#212121] dark:text-[#E8EAE8]">
                Total Spent: ₹{totalCost.toLocaleString("en-IN")}
              </h3>
              <span className="text-[11px] text-[#2E7D32] dark:text-[#81C784] font-semibold underline">
                Tap to see spend per crop ▲
              </span>
            </div>
            <div className="bg-[#2E7D32] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
              Breakdown
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="r sb pt-1">
          <h3 className="font-bold text-[17px]">Day 1 to Harvest Activity History</h3>
          <span className="m text-xs">{activities.length} logs</span>
        </div>

        {/* Activities Timeline */}
        <div className="flex flex-col gap-3">
          {activities.map((act) => (
            <div key={act.id} className="c py-3 px-3.5">
              <div className="r sb">
                <span className="p font-semibold">{act.type}</span>
                <span className="m text-[13px]">{act.date || act.time}</span>
              </div>

              <h4 className="font-bold text-[16px] mt-1">{act.crop}</h4>
              <p className="m text-[14px] leading-relaxed">{act.notes}</p>

              {act.cost !== undefined && act.cost > 0 && (
                <div className="pt-1 text-right">
                  <span className="text-xs font-bold text-[#2E7D32] dark:text-[#81C784]">
                    ₹{act.cost}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA to log new activity */}
        <div className="mt-auto pt-4 pb-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="b w-full flex items-center justify-center font-bold"
          >
            {t("daily_log.btn_log_work")}
          </button>
        </div>
      </main>

      {/* Spend by Crop Breakdown Modal Sheet */}
      {isSpendBreakdownOpen && (
        <>
          <div
            className="sc z-40 transition-opacity"
            onClick={() => setIsSpendBreakdownOpen(false)}
            aria-hidden="true"
          />
          <div className="sh z-50">
            <div className="r sb pb-1">
              <div>
                <h3 className="font-bold text-[18px]">Spend Breakdown by Crop</h3>
                <p className="m text-xs">Total Tracked: ₹{totalCost.toLocaleString("en-IN")}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSpendBreakdownOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#2A2F2A] flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 my-2">
              {Object.entries(spendByCrop).map(([cropName, amount]) => (
                <div key={cropName} className="c py-2.5 px-3">
                  <div className="r sb">
                    <span className="font-bold text-[15px]">{cropName}</span>
                    <span className="font-bold text-[16px] text-[#2E7D32] dark:text-[#81C784]">
                      ₹{amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="bar mt-1">
                    <i
                      style={{
                        width: `${totalCost > 0 ? (amount / totalCost) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsSpendBreakdownOpen(false)}
              className="b sm w-full font-bold mt-1"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Log Activity Modal */}
      {isModalOpen && (
        <>
          <div
            className="sc z-40 transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="sh z-50">
            <div className="r sb pb-1">
              <h3 className="font-bold text-[18px]">{t("daily_log.modal_title")}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#2A2F2A] flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="lb">{t("daily_log.crop_label")}</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="i"
                >
                  <option value="Paddy (Plot A)">Paddy (Plot A)</option>
                  <option value="Tomato (Plot B)">Tomato (Plot B)</option>
                  <option value="Groundnut (Plot C)">Groundnut (Plot C)</option>
                  <option value="General Farm">General Farm</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="lb">{t("daily_log.type_label")}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="i"
                >
                  <option value="Watering">Watering</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Pesticide">Pesticide</option>
                  <option value="Weeding">Weeding</option>
                  <option value="Labour">Labour</option>
                  <option value="Harvest">Harvest</option>
                  <option value="Sowing">Sowing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="lb">{t("daily_log.cost_label")}</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 350"
                  className="i"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="lb">{t("daily_log.notes_label")}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Applied 1 bag urea"
                  className="i"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="b w-full flex items-center justify-center font-bold"
                >
                  {t("daily_log.btn_save")}
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

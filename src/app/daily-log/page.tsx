"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { PlusIcon } from "@/components/common/Icons";
import { useTranslation } from "@/context/LanguageContext";

interface Activity {
  id: number;
  crop: string;
  type: string;
  time: string;
  notes: string;
  cost?: number;
}

export default function DailyLogPage() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      crop: "Paddy (Plot A)",
      type: "Watering",
      time: "6:30 am",
      notes: "Canal water release for 2 hours",
      cost: 0,
    },
    {
      id: 2,
      crop: "Tomato (Plot B)",
      type: "Fertilizer",
      time: "8:15 am",
      notes: "Applied 1 bag Urea fertilizer",
      cost: 350,
    },
    {
      id: 3,
      crop: "Groundnut (Plot C)",
      type: "Labour",
      time: "11:00 am",
      notes: "2 workers for field weeding",
      cost: 600,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState("Paddy (Plot A)");
  const [type, setType] = useState("Watering");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      id: Date.now(),
      crop,
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      notes: notes || "Regular activity",
      cost: cost ? parseFloat(cost) : undefined,
    };
    setActivities([newActivity, ...activities]);
    setIsModalOpen(false);
    setNotes("");
    setCost("");
  };

  const totalCost = activities.reduce((acc, curr) => acc + (curr.cost || 0), 0);

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
        {/* Date and Summary Card */}
        <div className="r sb pt-1">
          <div>
            <p className="m text-[14px]">Tuesday, 17 Nov</p>
            <h3 className="font-bold text-[18px]">{t("daily_log.today")}</h3>
          </div>
          <div className="text-right">
            <span className="m text-[13px]">Total spent</span>
            <p className="font-bold text-[17px] text-[#2E7D32] dark:text-[#81C784]">
              ₹{totalCost}
            </p>
          </div>
        </div>

        {/* Activity Cards List */}
        <div className="flex flex-col gap-3">
          {activities.map((act) => (
            <div key={act.id} className="c py-3 px-3.5">
              <div className="r sb">
                <span className="p font-semibold">{act.type}</span>
                <span className="m text-[13px]">{act.time}</span>
              </div>

              <h4 className="font-bold text-[16px] mt-1">{act.crop}</h4>
              <p className="m text-[14px] leading-relaxed">{act.notes}</p>

              {act.cost !== undefined && act.cost > 0 && (
                <div className="pt-1 text-right">
                  <span className="text-xs font-semibold text-[#5F6368] dark:text-[#A3A8A3]">
                    Cost: ₹{act.cost}
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

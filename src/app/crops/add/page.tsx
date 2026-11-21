"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { useTranslation } from "@/context/LanguageContext";

const starterCrops = [
  { name: "Paddy", durationDays: 120, defaultStage: "Sowing", stages: ["Sowing", "Germination", "Vegetative", "Flowering", "Harvest"] },
  { name: "Tomato", durationDays: 100, defaultStage: "Sowing", stages: ["Sowing", "Germination", "Vegetative", "Fruiting", "Harvest"] },
  { name: "Groundnut", durationDays: 110, defaultStage: "Sowing", stages: ["Sowing", "Germination", "Vegetative", "Pod formation", "Harvest"] },
  { name: "Onion", durationDays: 120, defaultStage: "Sowing", stages: ["Sowing", "Germination", "Vegetative", "Bulb formation", "Harvest"] },
  { name: "Banana", durationDays: 300, defaultStage: "Planting", stages: ["Planting", "Establishment", "Vegetative", "Flowering", "Harvest"] },
];

export default function AddCropPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedCropName, setSelectedCropName] = useState("Paddy");
  const [variety, setVariety] = useState("BPT 5204");
  const [fieldSize, setFieldSize] = useState("2.5");
  const [plotName, setPlotName] = useState("Plot A");
  const [sowingDate, setSowingDate] = useState(() => new Date().toISOString().split("T")[0]);

  const selectedCrop = starterCrops.find((c) => c.name === selectedCropName) || starterCrops[0];

  // Calculate expected harvest date = sowing date + duration days
  const sowingDateObj = new Date(sowingDate);
  const harvestDateObj = new Date(sowingDateObj.getTime() + selectedCrop.durationDays * 24 * 60 * 60 * 1000);
  const harvestDateStr = harvestDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Crop ${selectedCropName} (${fieldSize} acres on ${plotName}) added successfully! Full ${selectedCrop.durationDays}-day task timeline scheduled.`);
    router.push("/crops");
  };

  return (
    <div className="s">
      <Header title="Add New Crop" showBack />

      <main className="bd overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Pick Crop */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">Select Crop</label>
            <select
              value={selectedCropName}
              onChange={(e) => setSelectedCropName(e.target.value)}
              className="i"
            >
              {starterCrops.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.durationDays} days)
                </option>
              ))}
            </select>
          </div>

          {/* Variety */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">Crop Variety (optional)</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="e.g. BPT 5204 / PKM-1"
              className="i"
            />
          </div>

          {/* Field Size / Area */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">Field Size (in Acres)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={fieldSize}
              onChange={(e) => setFieldSize(e.target.value)}
              placeholder="e.g. 2.5"
              className="i"
              required
            />
          </div>

          {/* Plot Name */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">Plot Name</label>
            <input
              type="text"
              value={plotName}
              onChange={(e) => setPlotName(e.target.value)}
              placeholder="e.g. Plot A, North Field"
              className="i"
              required
            />
          </div>

          {/* Sowing Date */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">Sowing Date</label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="i"
              required
            />
          </div>

          {/* Prediction Preview Box */}
          <div className="c w py-3 px-3.5 mt-1">
            <span className="text-xs font-semibold uppercase text-[#5F6368] dark:text-[#A3A8A3]">
              Schedule & Harvest Prediction
            </span>
            <h4 className="font-bold text-[16px] text-[#212121] dark:text-[#E8EAE8] mt-1">
              Estimated Harvest: {harvestDateStr}
            </h4>
            <p className="m text-[13px] mt-0.5">
              Duration: {selectedCrop.durationDays} days • 5 growth stages with automated task reminders.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-3 pb-2">
            <button
              type="submit"
              className="b w-full flex items-center justify-center font-bold"
            >
              + Add crop to my farm
            </button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { useTranslation } from "@/context/LanguageContext";

interface CropMasterItem {
  id: number;
  nameEn: string;
  nameTa?: string;
  nameTe?: string;
  durationDays: number;
  stages?: string[];
}

const fallbackStarterCrops: CropMasterItem[] = [
  { id: 1, nameEn: "Paddy", durationDays: 120, stages: ["Sowing", "Germination", "Vegetative", "Flowering", "Harvest"] },
  { id: 2, nameEn: "Tomato", durationDays: 100, stages: ["Sowing", "Germination", "Vegetative", "Fruiting", "Harvest"] },
  { id: 3, nameEn: "Groundnut", durationDays: 110, stages: ["Sowing", "Germination", "Vegetative", "Pod formation", "Harvest"] },
  { id: 4, nameEn: "Onion", durationDays: 120, stages: ["Sowing", "Germination", "Vegetative", "Bulb formation", "Harvest"] },
  { id: 5, nameEn: "Banana", durationDays: 300, stages: ["Planting", "Establishment", "Vegetative", "Flowering", "Harvest"] },
];

export default function AddCropPage() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [availableCrops, setAvailableCrops] = useState<CropMasterItem[]>(fallbackStarterCrops);
  const [selectedCropName, setSelectedCropName] = useState("Paddy");
  const [variety, setVariety] = useState("BPT 5204");
  const [fieldSize, setFieldSize] = useState("2.5");
  const [plotName, setPlotName] = useState("Plot A");
  const [sowingDate, setSowingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaster() {
      try {
        const res = await fetch("/api/crop-master");
        if (res.ok) {
          const data = await res.json();
          if (data.cropMasters && data.cropMasters.length > 0) {
            setAvailableCrops(data.cropMasters);
          }
        }
      } catch (err) {
        console.error("Could not fetch crop master:", err);
      }
    }
    fetchMaster();
  }, []);

  const selectedCrop =
    availableCrops.find((c) => c.nameEn === selectedCropName) || availableCrops[0];

  // Calculate expected harvest date = sowing date + duration days
  const sowingDateObj = new Date(sowingDate);
  const harvestDateObj = new Date(
    sowingDateObj.getTime() + (selectedCrop.durationDays || 120) * 24 * 60 * 60 * 1000
  );
  const harvestDateStr = harvestDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: selectedCropName,
          variety: variety.trim(),
          fieldSize: parseFloat(fieldSize) || 1.0,
          plotName: plotName.trim(),
          sowingDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add crop to database.");
      }

      alert(
        `✓ ${selectedCropName} (${fieldSize} acres on ${plotName}) saved to your farm database!\n5 lifecycle tasks scheduled until ${harvestDateStr}.`
      );
      router.push("/crops");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save crop");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="s">
      <Header title="Add New Crop" showBack />

      <main className="bd overflow-y-auto">
        {errorMessage && (
          <div className="p-3 mb-2 rounded-lg bg-red-100 text-red-800 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Pick Crop */}
          <div className="flex flex-col gap-1.5">
            <label className="lb">Select Crop</label>
            <select
              value={selectedCropName}
              onChange={(e) => setSelectedCropName(e.target.value)}
              className="i"
              disabled={isSubmitting}
            >
              {availableCrops.map((c) => {
                const localizedName =
                  language === "ta" && c.nameTa
                    ? c.nameTa
                    : language === "te" && c.nameTe
                    ? c.nameTe
                    : c.nameEn;
                return (
                  <option key={c.id || c.nameEn} value={c.nameEn}>
                    {localizedName} ({c.nameEn}) - {c.durationDays} days
                  </option>
                );
              })}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              Duration: {selectedCrop.durationDays} days • Automated lifecycle reminders will be added to your schedule.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-3 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="b w-full flex items-center justify-center font-bold"
            >
              {isSubmitting ? "Saving to database..." : "+ Add crop to my farm"}
            </button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

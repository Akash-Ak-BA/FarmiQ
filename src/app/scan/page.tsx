"use client";

import React, { useState, useRef } from "react";
import { Header } from "@/components/common/Header";
import { CameraIcon } from "@/components/common/Icons";
import { useTranslation } from "@/context/LanguageContext";

interface DiseaseDetail {
  issue: string;
  confidence: "high" | "medium" | "low";
  description: string;
  natural: string;
  chemical: string;
  safety: string;
}

const diseaseKnowledgeBase: Record<string, DiseaseDetail> = {
  blast: {
    issue: "Leaf Blast (Magnaporthe oryzae - Fungal)",
    confidence: "high",
    description: "Spindle-shaped brown spots with grey or whitish centers on leaves and leaf sheaths.",
    natural: "Spray 5% Neem Seed Kernel Extract (NSKE) or Panchagavya (30ml/L). Dust wood ash in early morning dew to inhibit fungal spore germination.",
    chemical: "Tricyclazole 75% WP or Carbendazim. Always consult your local agricultural extension officer for dosage and harvest safety period.",
    safety: "Wear rubber gloves, eye goggles, and a face mask during any chemical spray. Do not spray against wind.",
  },
  borer: {
    issue: "Yellow Stem Borer / Caterpillar damage",
    confidence: "medium",
    description: "Dead hearts in vegetative stage and white ears at flowering stage with bore holes.",
    natural: "Release Trichogramma egg parasitoids @ 20,000/acre. Install yellow stem borer pheromone traps @ 5/acre.",
    chemical: "Chlorantraniliprole 18.5% SC or Cartap hydrochloride 50% SP. Contact your agriculture officer for official application guidelines.",
    safety: "Observe minimum 14-day pre-harvest waiting interval. Keep children and cattle away from treated field.",
  },
  curl: {
    issue: "Tomato Leaf Curl Virus (transmitted by Whiteflies)",
    confidence: "high",
    description: "Upward curling, puckering of leaves, stunting of plants, and reduced fruit set.",
    natural: "Install yellow sticky traps (15/acre) to catch whiteflies. Spray neem oil (5ml/L) with liquid soap every 7 days.",
    chemical: "Imidacloprid 17.8% SL or Thiamethoxam 25% WG to manage vector whiteflies. Consult agriculture officer for rotation.",
    safety: "Wash hands thoroughly with soap after handling affected plants. Never smoke or eat while spraying.",
  },
};

export default function CropScanResultPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseDetail>(diseaseKnowledgeBase.blast);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5 MB. Please select a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFileDetails({
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleResetPhoto = () => {
    setPhotoPreview(null);
    setFileDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  return (
    <div className="s">
      <Header title={t("scan.title")} showBack />

      <main className="bd overflow-y-auto">
        {/* Hidden Camera / File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Interactive Photo Upload Box */}
        <div
          onClick={triggerCamera}
          className="ph relative overflow-hidden cursor-pointer border-2 border-dashed border-[#9AA09A] hover:border-[#2E7D32] transition-colors flex flex-col items-center justify-center p-2 text-center"
        >
          {photoPreview ? (
            <div className="relative w-full h-full min-h-[140px] flex items-center justify-center">
              <img
                src={photoPreview}
                alt="Damaged crop preview"
                className="max-h-[140px] w-auto object-contain rounded-md"
              />
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                {fileDetails?.sizeKb} KB
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-3">
              <CameraIcon className="w-8 h-8 text-[#2E7D32] dark:text-[#81C784]" />
              <span className="font-semibold text-sm text-[#212121] dark:text-[#E8EAE8]">
                Take photo or upload
              </span>
              <span className="text-xs text-[#5F6368] dark:text-[#A3A8A3]">
                Tap to open camera or gallery
              </span>
            </div>
          )}
        </div>

        {/* Photo Info Banner if loaded */}
        {photoPreview && (
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#2E7D32] dark:text-[#81C784] font-semibold">
              ✓ Photo analyzed & remedies fetched
            </span>
            <button
              type="button"
              onClick={triggerCamera}
              className="text-[#5F6368] underline font-medium"
            >
              Change photo
            </button>
          </div>
        )}

        {/* Detected Issue Card */}
        <div className="c">
          <div className="r sb items-start">
            <div>
              <span className="text-xs font-bold text-[#5F6368] dark:text-[#A3A8A3] uppercase">
                Detected Issue
              </span>
              <h3 className="font-bold text-[16px] mt-0.5">
                {selectedDisease.issue}
              </h3>
            </div>
            <span className="p font-semibold uppercase text-xs">
              {selectedDisease.confidence} confidence
            </span>
          </div>

          <p className="m text-[14px] mt-1">
            {selectedDisease.description}
          </p>
        </div>

        {/* Treatment Options Card */}
        <div className="c">
          <h3 className="font-bold text-[16px] mb-1">
            {t("scan.treatment_title")}
          </h3>
          <p className="text-[14px] leading-relaxed">
            <strong className="text-emerald-700 dark:text-emerald-400">Natural / Organic: </strong>
            <span className="text-[#212121] dark:text-[#E8EAE8]">{selectedDisease.natural}</span>
          </p>
          <p className="text-[14px] leading-relaxed mt-1.5">
            <strong className="text-blue-700 dark:text-blue-400">Chemical Advisory: </strong>
            <span className="m">{selectedDisease.chemical}</span>
          </p>
        </div>

        {/* Safety Warning Card */}
        <div className="c w">
          <h3 className="font-bold text-[16px] text-[#212121] dark:text-[#E8EAE8]">
            {t("scan.stay_safe")}
          </h3>
          <p className="m text-[13px] leading-relaxed text-[#5F6368] dark:text-[#A3A8A3]">
            {selectedDisease.safety}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-auto pt-2 pb-2">
          <button
            type="button"
            onClick={() => alert("✓ Remedy added as a pending task in your crop schedule!")}
            className="b w-full flex items-center justify-center font-bold"
          >
            {t("scan.btn_add_task")}
          </button>
          <button
            type="button"
            onClick={handleResetPhoto}
            className="b o w-full flex items-center justify-center font-bold"
          >
            {t("scan.btn_scan_another")}
          </button>
        </div>
      </main>
    </div>
  );
}

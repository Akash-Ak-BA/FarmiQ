"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/common/Header";
import { CameraIcon } from "@/components/common/Icons";
import { sampleCropDamage } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function CropScanResultPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);

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
              ✓ Ready for Gemini AI analysis
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

        {/* Possible Issue Card */}
        <div className="c">
          <h3 className="font-bold text-[16px]">
            {t("scan.possible_issue", { issue: sampleCropDamage.detectedIssue })}
          </h3>
          <div className="my-1">
            <span className="p font-semibold">
              {t("scan.confidence", { level: sampleCropDamage.confidence })}
            </span>
          </div>
          <p className="m text-[14px]">
            {sampleCropDamage.description}
          </p>
        </div>

        {/* Treatment Options Card */}
        <div className="c">
          <h3 className="font-bold text-[16px] mb-1">
            {t("scan.treatment_title")}
          </h3>
          <p className="text-[14px] leading-relaxed">
            <strong>Natural: </strong>
            <span className="m">{sampleCropDamage.naturalTreatment}</span>
          </p>
          <p className="text-[14px] leading-relaxed mt-1">
            <strong>Chemical: </strong>
            <span className="m">{sampleCropDamage.chemicalAdvice}</span>
          </p>
        </div>

        {/* Safety Warning Card */}
        <div className="c w">
          <h3 className="font-bold text-[16px] text-[#212121] dark:text-[#E8EAE8]">
            {t("scan.stay_safe")}
          </h3>
          <p className="m text-[13px] leading-relaxed text-[#5F6368] dark:text-[#A3A8A3]">
            {sampleCropDamage.safetyNote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-auto pt-2 pb-2">
          <button
            type="button"
            onClick={() => alert("Treatment scheduled as a task!")}
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

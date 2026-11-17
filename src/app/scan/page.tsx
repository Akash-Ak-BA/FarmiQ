"use client";

import React from "react";
import { Header } from "@/components/common/Header";
import { sampleCropDamage } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function CropScanResultPage() {
  const { t } = useTranslation();

  return (
    <div className="s">
      <Header title={t("scan.title")} showBack />

      <main className="bd overflow-y-auto">
        {/* Photo Box */}
        <div className="ph">
          {sampleCropDamage.photoPlaceholder}
        </div>

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
            onClick={() => alert("Camera scan will open in step 9")}
            className="b o w-full flex items-center justify-center font-bold"
          >
            {t("scan.btn_scan_another")}
          </button>
        </div>
      </main>
    </div>
  );
}

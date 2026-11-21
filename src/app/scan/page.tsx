"use client";

import React, { useState, useRef } from "react";
import { Header } from "@/components/common/Header";
import { CameraIcon } from "@/components/common/Icons";
import { AgriculturalDisclaimer } from "@/components/common/AgriculturalDisclaimer";
import { useTranslation } from "@/context/LanguageContext";

interface AnalysisResult {
  detectedIssue: string;
  confidence: "high" | "medium" | "low";
  howAffected: string;
  naturalTreatment: string;
  chemicalAdvice: string;
  safetyNote: string;
}

export default function CropScanResultPage() {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);
  const [isPhotoConfirmed, setIsPhotoConfirmed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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
        setIsPhotoConfirmed(false);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmAndAnalyze = async () => {
    if (!photoPreview) return;
    setIsPhotoConfirmed(true);
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/crop-check/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: photoPreview,
          language,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setAnalysisResult(data.result);
      } else {
        alert("Could not analyze photo. Please try again.");
      }
    } catch {
      alert("Analysis error. Please verify network connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetPhoto = () => {
    setPhotoPreview(null);
    setFileDetails(null);
    setIsPhotoConfirmed(false);
    setAnalysisResult(null);
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

        {/* 1. Photo Capture Box */}
        <div
          onClick={!photoPreview ? triggerCamera : undefined}
          className={`ph relative overflow-hidden ${
            !photoPreview ? "cursor-pointer" : ""
          } border-2 border-dashed border-[#9AA09A] flex flex-col items-center justify-center p-2 text-center transition-colors min-h-[140px]`}
        >
          {photoPreview ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={photoPreview}
                alt="Uploaded crop leaf"
                className="max-h-[140px] w-auto object-contain rounded-md"
              />
              <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                {fileDetails?.sizeKb} KB
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4">
              <CameraIcon className="w-9 h-9 text-[#2E7D32] dark:text-[#81C784]" />
              <span className="font-bold text-[15px] text-[#212121] dark:text-[#E8EAE8]">
                Take photo or upload damaged leaf
              </span>
              <span className="text-xs text-[#5F6368] dark:text-[#A3A8A3]">
                Tap to open camera or gallery
              </span>
            </div>
          )}
        </div>

        {/* 2. Photo Confirmation Step: Asks user if the photo is okay */}
        {photoPreview && !isPhotoConfirmed && (
          <div className="c border-2 border-[#2E7D32] bg-[#E8F5E9] dark:bg-[#1A2E1A] py-3 px-3.5 flex flex-col gap-2.5 animate-in fade-in">
            <div>
              <h3 className="font-bold text-[16px] text-[#1B5E20] dark:text-[#81C784]">
                Is this photo clear and okay to analyze?
              </h3>
              <p className="text-xs text-[#212121] dark:text-[#E8EAE8] mt-0.5">
                Make sure the damaged spots, leaf veins, or pest symptoms are clearly visible.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmAndAnalyze}
                className="b w-full flex items-center justify-center font-bold"
              >
                ✓ Yes, Upload & Analyze Photo
              </button>
              <button
                type="button"
                onClick={triggerCamera}
                className="b o w-full flex items-center justify-center font-bold"
              >
                Retake / Change Photo
              </button>
            </div>
          </div>
        )}

        {/* 3. Analyzing State Indicator */}
        {isAnalyzing && (
          <div className="c py-6 items-center text-center flex flex-col gap-3">
            <div className="w-8 h-8 border-3 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h4 className="font-bold text-[16px]">Analyzing Crop Damage...</h4>
              <p className="m text-xs mt-1">
                Scanning leaf surface, identifying fungal/pest symptoms, and fetching verified remedies.
              </p>
            </div>
          </div>
        )}

        {/* 4. Analyzed Results (Defect, How Affected, Natural/Chemical Remedies, Safety) */}
        {analysisResult && (
          <div className="flex flex-col gap-3 animate-in fade-in pb-3">
            {/* Detected Defect Card */}
            <div className="c border-l-4 border-l-[#2E7D32]">
              <div className="r sb items-start">
                <div className="flex-1 pr-2">
                  <span className="text-xs font-bold uppercase text-[#5F6368] dark:text-[#A3A8A3]">
                    Identified Defect / Disease
                  </span>
                  <h3 className="font-bold text-[17px] text-[#212121] dark:text-[#E8EAE8] mt-0.5 leading-snug">
                    {analysisResult.detectedIssue}
                  </h3>
                </div>
                <span className="p font-bold uppercase text-[11px] flex-shrink-0">
                  {analysisResult.confidence} confidence
                </span>
              </div>
            </div>

            {/* How It Was Affected */}
            <div className="c">
              <h4 className="font-bold text-[15px] text-[#212121] dark:text-[#E8EAE8] mb-1">
                How It Affects Your Crop
              </h4>
              <p className="text-[14px] leading-relaxed text-[#5F6368] dark:text-[#A3A8A3]">
                {analysisResult.howAffected}
              </p>
            </div>

            {/* Treatment Options: Natural & Chemical */}
            <div className="c">
              <h4 className="font-bold text-[15px] mb-2">
                Treatment Options
              </h4>

              <div className="flex flex-col gap-2.5">
                {/* Natural / Organic Way */}
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <strong className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                      Natural & Organic Way
                    </strong>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[#212121] dark:text-[#E8EAE8]">
                    {analysisResult.naturalTreatment}
                  </p>
                </div>

                {/* Chemical Advisor */}
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <strong className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                      Chemical Advisor
                    </strong>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[#212121] dark:text-[#E8EAE8]">
                    {analysisResult.chemicalAdvice}
                  </p>
                </div>
              </div>
            </div>

            {/* Stay Safe Warning Box */}
            <div className="c w">
              <h4 className="font-bold text-[15px] text-[#212121] dark:text-[#E8EAE8]">
                Stay Safe Guidelines
              </h4>
              <p className="m text-[13px] leading-relaxed text-[#5F6368] dark:text-[#A3A8A3] mt-0.5">
                {analysisResult.safetyNote}
              </p>
            </div>

            {/* CIBRC & Government Statutory Advisory */}
            <AgriculturalDisclaimer type="chemical" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => alert(`✓ Treatment task for "${analysisResult.detectedIssue}" added to your crop schedule!`)}
                className="b w-full flex items-center justify-center font-bold"
              >
                + Add treatment as task
              </button>
              <button
                type="button"
                onClick={handleResetPhoto}
                className="b o w-full flex items-center justify-center font-bold"
              >
                Scan another photo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

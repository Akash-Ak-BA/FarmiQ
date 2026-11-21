"use client";

import React from "react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1E201E] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Legal & Privacy
            </span>
            <h3 className="text-lg font-bold text-[#212121] dark:text-[#E8EAE8]">
              Farmer Privacy Policy & Data Rights
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white border border-gray-200 dark:border-gray-700 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm text-[#212121] dark:text-[#E8EAE8] leading-relaxed">
          {/* Badge */}
          <div className="p-2.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
            <strong>Compliance Status:</strong> Fully aligned with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Ministry of Agriculture & Farmers Welfare (MoA&FW)</strong> guidelines.
          </div>

          {/* Section 1: Farmer Sovereignty */}
          <div>
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-1">
              1. Farmer Data Sovereignty & 100% Ownership
            </h4>
            <p className="text-[#5F6368] dark:text-[#A3A8A3]">
              All farm data recorded in FarmiQ — including crop types, varieties, plot acreages, soil parameters, sowing dates, yield estimates, input logs, and financial transactions — remains the exclusive property of the farmer. FarmiQ does <strong>NOT</strong> sell, broker, or commercially distribute your private farm data to agribusiness corporations or advertising networks.
            </p>
          </div>

          {/* Section 2: GPS & Location Use */}
          <div>
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-1">
              2. Location & GPS Usage
            </h4>
            <p className="text-[#5F6368] dark:text-[#A3A8A3]">
              Location data is gathered only with your explicit permission and is used exclusively for:
            </p>
            <ul className="list-disc pl-5 mt-1 text-[#5F6368] dark:text-[#A3A8A3] space-y-0.5">
              <li>Delivering localized weather alerts and rain forecasts for your block.</li>
              <li>Calculating distance radii (&le; 100 km) for direct buyer-seller marketplace connections.</li>
            </ul>
          </div>

          {/* Section 3: Phone Number Privacy */}
          <div>
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-1">
              3. Phone Number & Identity Privacy
            </h4>
            <p className="text-[#5F6368] dark:text-[#A3A8A3]">
              Your phone number is strictly protected. In the FarmiQ Marketplace, your contact phone number is <strong>hidden by default</strong> and is only displayed to buyers if you voluntarily check the "Show phone number to buyers" box when listing produce.
            </p>
          </div>

          {/* Section 4: Security Architecture */}
          <div>
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-1">
              4. Security & Cryptographic Standards
            </h4>
            <p className="text-[#5F6368] dark:text-[#A3A8A3]">
              FarmiQ protects your account with industry-standard cryptographic practices:
            </p>
            <ul className="list-disc pl-5 mt-1 text-[#5F6368] dark:text-[#A3A8A3] space-y-0.5">
              <li>Passwords are salted and hashed using <strong>bcrypt</strong> before saving.</li>
              <li>Sessions utilize cryptographically generated 256-bit tokens in <strong>HTTP-only, secure cookies</strong>.</li>
              <li>Database queries enforce strict <strong>Row-Level Privacy</strong> scoped to your user ID.</li>
            </ul>
          </div>

          {/* Section 5: Right to Erasure */}
          <div>
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base mb-1">
              5. Right to Erasure, Correction & Export
            </h4>
            <p className="text-[#5F6368] dark:text-[#A3A8A3]">
              Under Section 12 of the DPDP Act 2023, you have the right to review, update, or completely delete your account and all associated farm records at any time from the Settings menu.
            </p>
          </div>

          {/* Section 6: Grievance Officer */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#141514] border border-gray-200 dark:border-gray-800 text-xs">
            <h5 className="font-bold mb-1">Data Protection & Grievance Redressal</h5>
            <p className="text-[#5F6368] dark:text-[#A3A8A3]">
              For any privacy inquiries or grievance redressal under Rule 3(2) of the Information Technology Rules, contact our Grievance Officer:
            </p>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
              FarmiQ Farmer Care: privacy@farmiq.app • Thanjavur, Tamil Nadu, India
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#141514] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="b font-bold text-xs px-6 py-2"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

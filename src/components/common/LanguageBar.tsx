"use client";

import React from "react";
import { useTranslation, Language } from "@/context/LanguageContext";

export function LanguageBar() {
  const { language, setLanguage } = useTranslation();

  const languages: { id: Language; label: string }[] = [
    { id: "en", label: "English" },
    { id: "ta", label: "தமிழ்" },
    { id: "te", label: "తెలుగు" },
  ];

  return (
    <footer className="ft">
      {languages.map((lang) => (
        <button
          key={lang.id}
          type="button"
          onClick={() => setLanguage(lang.id)}
          className={`lg ${language === lang.id ? "on" : ""}`}
        >
          {lang.label}
        </button>
      ))}
    </footer>
  );
}

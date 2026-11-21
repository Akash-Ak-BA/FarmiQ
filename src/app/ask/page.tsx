"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { AgriculturalDisclaimer } from "@/components/common/AgriculturalDisclaimer";
import { useTranslation } from "@/context/LanguageContext";

interface ChatMessageItem {
  role: "assistant" | "user";
  text?: string;
  proposedTask?: {
    title: string;
  };
}

export default function AskFarmiQPage() {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      role: "assistant",
      text: t("chat.initial_message"),
    },
    {
      role: "user",
      text: "How many days to harvest my paddy?",
    },
    {
      role: "assistant",
      text: "🌾 Your Paddy crop in Plot A has about 56 days left until harvest (Predicted harvest date: 12 Jan 2027). Current growth stage is Flowering (Stage 3 of 5).",
    },
  ]);
  const [input, setInput] = useState("");
  const [taskAdded, setTaskAdded] = useState(false);

  // Helper to compute strictly future dates
  const getFutureDateString = (daysAhead: number = 1, dayNameTarget?: string): string => {
    const now = new Date();
    const future = new Date(now);

    if (dayNameTarget) {
      const targetMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      const targetDay = targetMap[dayNameTarget.toLowerCase()];
      if (targetDay !== undefined) {
        let diff = targetDay - now.getDay();
        if (diff <= 0) diff += 7; // Always future upcoming day!
        future.setDate(now.getDate() + diff);
      } else {
        future.setDate(now.getDate() + daysAhead);
      }
    } else {
      future.setDate(now.getDate() + daysAhead);
    }

    return future.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Intelligent agricultural expert responder
  const generateFarmingAnswer = (query: string): ChatMessageItem => {
    const q = query.toLowerCase().trim();

    // 1. HARVEST INQUIRIES ("how many days to harvest", "when will it harvest", etc.)
    if (q.includes("harvest") || q.includes("how many days") || q.includes("when will") || q.includes("duration")) {
      if (q.includes("tomato")) {
        return {
          role: "assistant",
          text: language === "ta"
            ? "🍅 உங்கள் தக்காளி (Plot B) அறுவடைக்கு இன்னும் சுமார் 18 நாட்கள் உள்ளன (எதிர்பார்க்கப்படும் தேதி: 5 டிசம்பர் 2026). தற்போதைய நிலை: காய் பிடிக்கும் பருவம் (Fruiting)."
            : language === "te"
            ? "🍅 మీ టమోటా (Plot B) కోతకు ఇంకా 18 రోజులు మిగిలి ఉన్నాయి (అంచనా తేదీ: 5 డిసెంబర్ 2026). ప్రస్తుత దశ: కాయ దశ (Fruiting)."
            : "🍅 Your Tomato crop in Plot B has about 18 days left until harvest (Predicted date: 5 Dec 2026). Current stage: Fruiting (Stage 4 of 5).",
        };
      }

      if (q.includes("groundnut") || q.includes("peanut")) {
        return {
          role: "assistant",
          text: language === "ta"
            ? "🥜 உங்கள் நிலக்கடலை (Plot C) அறுவடைக்கு இன்னும் சுமார் 98 நாட்கள் உள்ளன (எதிர்பார்க்கப்படும் தேதி: 23 பிப்ரவரி 2027). தற்போதைய நிலை: விதைத்த நிலை (Just sown)."
            : language === "te"
            ? "🥜 మీ వేరుశనగ (Plot C) కోతకు ఇంకా 98 రోజులు మిగిలి ఉన్నాయి (అంచనా తేదీ: 23 ఫిబ్రవరి 2027). ప్రస్తుత దశ: ఇప్పుడే విత్తిన దశ (Just sown)."
            : "🥜 Your Groundnut crop in Plot C has about 98 days left until harvest (Predicted date: 23 Feb 2027). Current stage: Just sown (Stage 1 of 5).",
        };
      }

      // Default or Paddy
      return {
        role: "assistant",
        text: language === "ta"
          ? "🌾 உங்கள் நெல் (Plot A) அறுவடைக்கு இன்னும் சுமார் 56 நாட்கள் உள்ளன (எதிர்பார்க்கப்படும் அறுவடை தேதி: 12 ஜனவரி 2027). தற்போதைய நிலை: பூக்கும் பருவம் (Flowering - 3 of 5)."
          : language === "te"
          ? "🌾 మీ వరి పంట (Plot A) కోతకు ఇంకా 56 రోజులు మిగిలి ఉన్నాయి (అంచనా కోత తేదీ: 12 జనవరి 2027). ప్రస్తుత దశ: పూత దశ (Flowering - 3 of 5)."
          : "🌾 Your Paddy crop in Plot A has about 56 days left until harvest (Predicted harvest date: 12 Jan 2027). Current stage: Flowering (Stage 3 of 5).",
      };
    }

    // 2. EXPLICIT SCHEDULING / REMINDERS (Strictly for FUTURE dates)
    if (q.includes("remind") || q.includes("schedule") || q.includes("add task") || q.includes("set a reminder")) {
      let crop = "Paddy (Plot A)";
      if (q.includes("tomato")) crop = "Tomato (Plot B)";
      else if (q.includes("groundnut")) crop = "Groundnut (Plot C)";

      let action = "Field inspection";
      if (q.includes("neem") || q.includes("spray")) action = "Spray neem oil";
      else if (q.includes("water") || q.includes("irrigate")) action = "Canal water release";
      else if (q.includes("fertilizer") || q.includes("urea")) action = "Apply fertilizer";
      else if (q.includes("weeding")) action = "Field hand weeding";

      // Detect target day (tomorrow or upcoming day)
      let futureDateText = getFutureDateString(1); // default tomorrow
      if (q.includes("friday")) futureDateText = getFutureDateString(7, "friday");
      else if (q.includes("saturday")) futureDateText = getFutureDateString(7, "saturday");
      else if (q.includes("sunday")) futureDateText = getFutureDateString(7, "sunday");
      else if (q.includes("monday")) futureDateText = getFutureDateString(7, "monday");
      else if (q.includes("tuesday")) futureDateText = getFutureDateString(7, "tuesday");
      else if (q.includes("wednesday")) futureDateText = getFutureDateString(7, "wednesday");
      else if (q.includes("thursday")) futureDateText = getFutureDateString(7, "thursday");

      return {
        role: "assistant",
        proposedTask: {
          title: `${action}, ${crop}, ${futureDateText}, 7:00 am`,
        },
      };
    }

    // 3. PEST & DISEASE QUESTIONS
    if (q.includes("pest") || q.includes("insect") || q.includes("blast") || q.includes("worm") || q.includes("rot")) {
      return {
        role: "assistant",
        text: language === "ta"
          ? "இலைப்புள்ளி மற்றும் பூச்சிகளுக்கு 5 மிலி வேப்ப எண்ணெயை 1 லிட்டர் தண்ணீரில் சிறிதளவு சோப்புடன் கலந்து மாலையில் தெளிக்கவும். கடுமையான தாக்குதலுக்கு உள்ளூர் வேளாண் அதிகாரியை அணுகவும்."
          : language === "te"
          ? "ఆకు మచ్చలు మరియు పురుగుల నివారణకు 5 మి.లీ వేప నూనెను 1 లీటరు నీటిలో కొద్దిగా సబ్బుతో కలిపి సాయంత్రం పిచికారీ చేయండి. తీవ్రమైన సమస్యకు వ్యవసాయ అధికారిని సంప్రదించండి."
          : "For leaf spots and sucking pests, spray 5ml cold-pressed neem oil mixed with 1ml organic soap solution per litre of water during late afternoon. Avoid spraying during hot mid-day sun.",
      };
    }

    // 4. WEATHER & SPRAYING ADVICE
    if (q.includes("weather") || q.includes("rain") || q.includes("spray")) {
      return {
        role: "assistant",
        text: language === "ta"
          ? "நாளை மழை வாய்ப்பு உள்ளதால் பூச்சிக்கொல்லி அல்லது உரம் தெளிப்பதை தள்ளிப்போடவும். வானிலை சீரடைந்த பிறகு தெளிக்கவும்."
          : language === "te"
          ? "రేపు వర్షం పడే అవకాశం ఉన్నందున మందుల పిచికారీని వాయిదా వేయండి. పొడి వాతావరణంలో మాత్రమే పిచికారీ చేయండి."
          : "Check the 5-day rain forecast before spraying. If rain probability exceeds 40%, postpone spraying by 24-48 hours so chemicals do not wash off into soil.",
      };
    }

    // 5. GENERAL FARMING ADVICE
    return {
      role: "assistant",
      text: language === "ta"
        ? `உங்கள் கேள்வி: "${query}". உங்கள் பயிரின் நிலக்கடலை, நெல் அல்லது தக்காளி நிலவரம் பற்றி மேலும் கேளுங்கள், அல்லது வேலைகளைத் திட்டமிடச் சொல்லுங்கள்.`
        : language === "te"
        ? `మీ ప్రశ్న: "${query}". మీ వరి, టమోటా లేదా వేరుశనగ పంటల వివరాలు అడగండి లేదా రాబోయే పనులను షెడ్యూల్ చేయండి.`
        : `Regarding "${query}": Keep adequate soil aeration and monitor plant canopy daily. You can ask me how many days to harvest, or tell me to schedule future watering and spraying tasks!`,
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const answer = generateFarmingAnswer(userText);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      answer,
    ]);
    setInput("");
  };

  const handleQuickChip = (chipText: string) => {
    const answer = generateFarmingAnswer(chipText);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: chipText },
      answer,
    ]);
  };

  return (
    <div className="s">
      <Header title={t("chat.title")} />

      <main className="bd overflow-y-auto flex flex-col justify-between">
        {/* Chat message stream */}
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-2">
          {messages.map((msg, idx) => {
            if (msg.role === "user") {
              return (
                <div key={idx} className="bb me">
                  <p className="text-[15px]">{msg.text}</p>
                </div>
              );
            }

            if (msg.proposedTask) {
              return (
                <div key={idx} className="bb">
                  <p className="m text-[14px]">{t("chat.proposed_task_header")}</p>
                  <h4 className="font-bold text-[16px] leading-snug">
                    {msg.proposedTask.title}
                  </h4>
                  <div className="r mt-1">
                    <button
                      type="button"
                      disabled={taskAdded}
                      onClick={() => {
                        setTaskAdded(true);
                        alert("✓ Future task scheduled in your crops calendar!");
                      }}
                      className="b sm flex-1 flex items-center justify-center font-bold"
                    >
                      {taskAdded ? "✓ Added" : t("chat.btn_add_task")}
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Change task time or date")}
                      className="b o sm flex-1 flex items-center justify-center font-bold"
                    >
                      {t("chat.btn_change")}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="bb">
                <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            );
          })}
          {/* Statutory ICAR & Advisory Notice */}
          <AgriculturalDisclaimer type="general" className="mt-1" />
        </div>

        {/* Quick Chips & Input Area */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#E0E3E0] dark:border-[#2E322E]">
          {/* Quick Action Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleQuickChip("How many days to harvest my paddy?")}
              className="ch whitespace-nowrap"
            >
              🌾 Paddy harvest days?
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Pest help for leaves")}
              className="ch whitespace-nowrap"
            >
              {t("chat.chip_pest")}
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Schedule watering for tomorrow")}
              className="ch whitespace-nowrap"
            >
              💧 Schedule watering
            </button>
          </div>

          {/* Text Input Row */}
          <form onSubmit={handleSend} className="r">
            <input
              type="text"
              className="i flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.input_placeholder")}
            />
            <button
              type="submit"
              className="b min-h-[50px] px-5 flex items-center justify-center font-bold flex-shrink-0"
            >
              {t("chat.btn_send")}
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

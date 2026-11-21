"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
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
      text: "Remind me to spray neem oil on Friday for tomato.",
    },
    {
      role: "assistant",
      proposedTask: {
        title: "Spray neem oil, Tomato (Plot B), Fri 20 Nov, 7:00 am",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [taskAdded, setTaskAdded] = useState(false);

  // Intelligent farming advisory responder
  const generateFarmingAnswer = (query: string): ChatMessageItem => {
    const q = query.toLowerCase();

    // Check if user is asking to schedule or remind a task
    if (q.includes("remind") || q.includes("schedule") || q.includes("task") || q.includes("add")) {
      let crop = "Paddy";
      if (q.includes("tomato")) crop = "Tomato (Plot B)";
      else if (q.includes("groundnut")) crop = "Groundnut (Plot C)";
      else if (q.includes("paddy")) crop = "Paddy (Plot A)";

      let action = "Field inspection";
      if (q.includes("neem") || q.includes("spray")) action = "Spray neem oil (5ml/L)";
      else if (q.includes("water") || q.includes("irrigate")) action = "Irrigation release";
      else if (q.includes("fertilizer") || q.includes("urea")) action = "Apply fertilizer dosage";
      else if (q.includes("weeding")) action = "Hand weeding & hoeing";

      return {
        role: "assistant",
        proposedTask: {
          title: `${action}, ${crop}, Fri 20 Nov, 7:00 am`,
        },
      };
    }

    // Pest help
    if (q.includes("pest") || q.includes("insect") || q.includes("worm") || q.includes("blast") || q.includes("rot")) {
      return {
        role: "assistant",
        text: language === "ta"
          ? "பூச்சி அல்லது பூஞ்சை தாக்குதலுக்கு 5 மிலி வேப்ப எண்ணெயை 1 லிட்டர் தண்ணீரில் சிறிதளவு காதி சோப்புடன் கலந்து மாலையில் தெளிக்கவும். கடுமையான தாக்குதலுக்கு உள்ளூர் வேளாண் அதிகாரியை அணுகவும்."
          : language === "te"
          ? "తెగుళ్లు లేదా పురుగుల నివారణకు 5 మి.లీ వేప నూనెను 1 లీటరు నీటిలో కొద్దిగా సబ్బు కలిపి సాయంత్రం పిచికారీ చేయండి. తీవ్రమైన సమస్య ఉంటే వ్యవసాయ అధికారిని సంప్రదించండి."
          : "For leaf pests and fungal spots, spray 5ml cold-pressed neem oil mixed with 1ml liquid soap per litre of water in the late afternoon. For severe infestations, consult your local agriculture officer.",
      };
    }

    // Weather help
    if (q.includes("weather") || q.includes("rain") || q.includes("spray")) {
      return {
        role: "assistant",
        text: language === "ta"
          ? "நாளை லேசான மழைக்கு வாய்ப்புள்ளது (மழை வாய்ப்பு 80%). எனவே உரம் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை 2 நாட்களுக்கு தள்ளிப்போடுவது நல்லது."
          : language === "te"
          ? "రేపు తేలికపాటి వర్షం పడే అవకాశం ఉంది (80%). కాబట్టి ఎరువులు మరియు మందుల పిచికారీని 2 రోజులు వాయిదా వేయండి."
          : "Heavy rain is expected tomorrow with 80% probability. Delay pesticide spraying and fertilizer application until sunny conditions return on Friday.",
      };
    }

    // Fertilizer / nutrients
    if (q.includes("fertilizer") || q.includes("urea") || q.includes("growth")) {
      return {
        role: "assistant",
        text: language === "ta"
          ? "பூக்கும் பருவத்தில் தழைச்சத்து (Urea) மற்றும் சாம்பல் சத்து (Potash) சரிவிகிதத்தில் இடவும். ஏக்கருக்கு 25 கிலோ யூரியா மற்றும் 15 கிலோ பொட்டாஷ் போதுமானது."
          : language === "te"
          ? "పూత దశలో యూరియా మరియు పొటాష్ సమతుల్యంగా వేయండి. ఎకరానికి 25 కిలోల యూరియా మరియు 15 కిలోల పొటాష్ సిఫార్సు చేయబడింది."
          : "During the flowering stage, apply balanced nitrogen and potash. For paddy and tomato, top-dress with 25 kg Urea and 15 kg MOP per acre under moist soil conditions.",
      };
    }

    // Default farming advice
    return {
      role: "assistant",
      text: language === "ta"
        ? `உங்கள் கேள்வி: "${query}". உங்கள் பயிரின் தற்போதைய வளர்ச்சி நிலைக்கு ஏற்ப பாசனம் மற்றும் களையெடுப்பை சரியான நேரத்தில் மேற்கொள்ளவும்.`
        : language === "te"
        ? `మీ ప్రశ్న: "${query}". మీ పంట ప్రస్తుత పెరుగుదల దశకు అనుగుణంగా నీటి యాజమాన్యం మరియు కలుపు నివారణను సమయానికి చేపట్టండి.`
        : `Regarding "${query}": Keep soil moisture consistent and ensure adequate drainage during this stage. You can also ask me to schedule a spraying or irrigation reminder anytime!`,
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
                        alert("✓ Task added to your crops schedule!");
                      }}
                      className="b sm flex-1 flex items-center justify-center font-bold"
                    >
                      {taskAdded ? "✓ Added" : t("chat.btn_add_task")}
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Edit task time or date")}
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
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Chips & Input Area */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#E0E3E0] dark:border-[#2E322E]">
          {/* Quick Action Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleQuickChip("Pest help for leaves")}
              className="ch whitespace-nowrap"
            >
              {t("chat.chip_pest")}
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Is it safe to spray today?")}
              className="ch whitespace-nowrap"
            >
              {t("chat.chip_weather")}
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Schedule watering tomorrow")}
              className="ch whitespace-nowrap"
            >
              {t("chat.chip_task")}
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

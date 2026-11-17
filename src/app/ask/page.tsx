"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { useTranslation } from "@/context/LanguageContext";

export default function AskFarmiQPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
      {
        role: "assistant",
        text: `I understand your question about "${input}". In Step 9, this will call the Gemini AI for real-time agricultural guidance!`,
      },
    ]);
    setInput("");
  };

  const handleQuickChip = (chip: string) => {
    setInput(chip);
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
                      onClick={() => setTaskAdded(true)}
                      className="b sm flex-1 flex items-center justify-center font-bold"
                    >
                      {taskAdded ? "✓ Added" : t("chat.btn_add_task")}
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Change task details in step 9")}
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
              onClick={() => handleQuickChip("Pest help")}
              className="ch whitespace-nowrap"
            >
              {t("chat.chip_pest")}
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Weather forecast")}
              className="ch whitespace-nowrap"
            >
              {t("chat.chip_weather")}
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Add a task")}
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

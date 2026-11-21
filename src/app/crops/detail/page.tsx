"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { TaskConfirmSheet } from "@/components/common/TaskConfirmSheet";
import { useTranslation } from "@/context/LanguageContext";

interface TaskItem {
  id: number;
  cropName: string;
  plotName: string;
  title: string;
  due: string;
  status: "pending" | "done";
}

interface CropSection {
  cropName: string;
  plotName: string;
  stage: string;
  stageProgress: number; // e.g. 60%
  daysRemaining: number;
  harvestDate: string;
  tasks: TaskItem[];
}

export default function CropDetailPage() {
  const { t } = useTranslation();

  const [cropSections, setCropSections] = useState<CropSection[]>([
    {
      cropName: "Paddy",
      plotName: "Plot A",
      stage: "Flowering (Stage 3 of 5)",
      stageProgress: 60,
      daysRemaining: 56,
      harvestDate: "12 Jan 2027",
      tasks: [
        { id: 101, cropName: "Paddy", plotName: "Plot A", title: "Apply fertilizer (Urea & Potash)", due: "Tomorrow", status: "pending" },
        { id: 102, cropName: "Paddy", plotName: "Plot A", title: "Check for leaf blast and stem pests", due: "Fri 20 Nov", status: "pending" },
        { id: 103, cropName: "Paddy", plotName: "Plot A", title: "Drain field water for tillering aerate", due: "Mon 23 Nov", status: "pending" },
        { id: 104, cropName: "Paddy", plotName: "Plot A", title: "Panicle initiation foliar spray", due: "15 Dec 2026", status: "pending" },
        { id: 105, cropName: "Paddy", plotName: "Plot A", title: "Final grain harvest & threshing", due: "12 Jan 2027", status: "pending" },
      ],
    },
    {
      cropName: "Tomato",
      plotName: "Plot B",
      stage: "Fruiting (Stage 4 of 5)",
      stageProgress: 80,
      daysRemaining: 18,
      harvestDate: "5 Dec 2026",
      tasks: [
        { id: 201, cropName: "Tomato", plotName: "Plot B", title: "Spray neem oil on leaves", due: "Fri 20 Nov", status: "pending" },
        { id: 202, cropName: "Tomato", plotName: "Plot B", title: "Tying and stake support check", due: "Sun 22 Nov", status: "pending" },
        { id: 203, cropName: "Tomato", plotName: "Plot B", title: "Potassium micronutrient booster", due: "Wed 25 Nov", status: "pending" },
        { id: 204, cropName: "Tomato", plotName: "Plot B", title: "First selective picking & grading", due: "1 Dec 2026", status: "pending" },
        { id: 205, cropName: "Tomato", plotName: "Plot B", title: "Main harvest & crate packing", due: "5 Dec 2026", status: "pending" },
      ],
    },
    {
      cropName: "Groundnut",
      plotName: "Plot C",
      stage: "Just sown (Stage 1 of 5)",
      stageProgress: 20,
      daysRemaining: 98,
      harvestDate: "23 Feb 2027",
      tasks: [
        { id: 301, cropName: "Groundnut", plotName: "Plot C", title: "Field weeding & inter-row hoeing", due: "Mon 23 Nov", status: "pending" },
        { id: 302, cropName: "Groundnut", plotName: "Plot C", title: "Gypsum application around root zone", due: "10 Dec 2026", status: "pending" },
        { id: 303, cropName: "Groundnut", plotName: "Plot C", title: "Pod pegging moisture check", due: "25 Dec 2026", status: "pending" },
        { id: 304, cropName: "Groundnut", plotName: "Plot C", title: "Foliar nutrient booster spray", due: "15 Jan 2027", status: "pending" },
        { id: 305, cropName: "Groundnut", plotName: "Plot C", title: "Harvest digging & pod sun-drying", due: "23 Feb 2027", status: "pending" },
      ],
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenConfirm = (task: TaskItem) => {
    setSelectedTask(task);
    setIsConfirmOpen(true);
  };

  const handleConfirmTask = () => {
    if (!selectedTask) return;

    // 1. Mark task done and remove from pending schedule
    setCropSections((prev) =>
      prev.map((section) => ({
        ...section,
        tasks: section.tasks.map((t) =>
          t.id === selectedTask.id ? { ...t, status: "done" } : t
        ),
      }))
    );

    // 2. Automatically log to Daily Log in localStorage
    try {
      const existingLogsStr = localStorage.getItem("farmiq_daily_logs");
      const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      const newLog = {
        id: Date.now(),
        crop: `${selectedTask.cropName} (${selectedTask.plotName})`,
        type: selectedTask.title.includes("fertilizer") ? "Fertilizer" : selectedTask.title.includes("weeding") ? "Weeding" : selectedTask.title.includes("spray") ? "Pesticide" : "Task",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        notes: `Completed task: ${selectedTask.title}`,
        cost: 0,
      };
      localStorage.setItem("farmiq_daily_logs", JSON.stringify([newLog, ...existingLogs]));
    } catch {}

    // 3. Show confirmation toast
    setToastMessage(`✓ "${selectedTask.title}" completed & added to Daily Log!`);
    setTimeout(() => setToastMessage(null), 3500);

    setIsConfirmOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="s">
      <Header title="Crop Tasks & Schedules" showBack />

      <main className="bd overflow-y-auto">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold text-center shadow-md animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* List of Growing Crops and their next 5 scheduled tasks */}
        <div className="flex flex-col gap-5 pb-4">
          {cropSections.map((crop) => (
            <div key={crop.cropName} className="flex flex-col gap-2.5">
              {/* Crop Heading Card */}
              <div className="c border-l-4 border-l-[#2E7D32]">
                <div className="r sb">
                  <h3 className="font-bold text-[18px] text-[#212121] dark:text-[#E8EAE8]">
                    {crop.cropName} ({crop.plotName})
                  </h3>
                  <span className="p font-semibold">{crop.stage}</span>
                </div>

                <div className="bar my-1">
                  <i style={{ width: `${crop.stageProgress}%` }} />
                </div>

                <div className="r sb text-xs m">
                  <span>Harvest: {crop.harvestDate}</span>
                  <span className="font-semibold text-[#2E7D32] dark:text-[#81C784]">
                    {crop.daysRemaining} days left
                  </span>
                </div>
              </div>

              {/* Next 5 Tasks for this Crop */}
              <div className="flex flex-col gap-2 pl-1">
                {crop.tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`c py-2.5 px-3 ${
                      task.status === "done" ? "opacity-60 bg-gray-50 dark:bg-[#181a18]" : ""
                    }`}
                  >
                    <div className="r sb items-start">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#5F6368] dark:text-[#A3A8A3]">
                            Task {idx + 1}:
                          </span>
                          <h4 className="font-bold text-[15px] leading-snug">
                            {task.title}
                          </h4>
                        </div>
                        <p className="m text-[13px] mt-0.5">Due: {task.due}</p>
                      </div>

                      <div className="flex-shrink-0">
                        {task.status === "done" ? (
                          <span className="inline-block py-1 px-3 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                            ✓ Done
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(task)}
                            className="b sm !min-h-[38px] px-3.5 text-xs font-bold"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Confirmation Bottom Sheet */}
      <TaskConfirmSheet
        isOpen={isConfirmOpen}
        taskTitle={selectedTask?.title || "Task"}
        onConfirm={handleConfirmTask}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <BottomNav />
    </div>
  );
}

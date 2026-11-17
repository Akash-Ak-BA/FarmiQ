"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { TaskConfirmSheet } from "@/components/common/TaskConfirmSheet";
import { sampleCropDetail } from "@/data/mockData";
import { useTranslation } from "@/context/LanguageContext";

export default function CropDetailPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(sampleCropDetail.tasks);
  const [selectedTask, setSelectedTask] = useState<{ id: number; title: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleOpenConfirm = (task: { id: number; title: string }) => {
    setSelectedTask(task);
    setIsConfirmOpen(true);
  };

  const handleConfirmTask = () => {
    if (selectedTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, status: "done" } : t))
      );
    }
    setIsConfirmOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="s">
      <Header title={`${sampleCropDetail.cropName}, ${sampleCropDetail.plotName}`} showBack />

      <main className="bd overflow-y-auto">
        {/* Stage & Prediction Card */}
        <div className="c">
          <div className="r sb">
            <span className="font-bold text-[16px]">
              {t("crop_detail.stage", { stage: sampleCropDetail.stage })}
            </span>
            <span className="m text-[14px]">
              {sampleCropDetail.stageIndex} of {sampleCropDetail.stageTotal}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bar my-1">
            <i style={{ width: `${(sampleCropDetail.stageIndex / sampleCropDetail.stageTotal) * 100}%` }} />
          </div>

          <p className="font-bold text-[16px] mt-1">
            {t("crop_detail.predicted_harvest", { date: sampleCropDetail.predictedHarvest })}
          </p>
          <p className="m text-[14px]">
            {t("crop_detail.days_left", { days: sampleCropDetail.daysLeft })}
          </p>
        </div>

        {/* Upcoming Tasks Section */}
        <h3 className="font-bold text-[16px] pt-1">
          {t("crop_detail.upcoming_tasks")}
        </h3>

        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <div key={task.id} className="c items-center text-center py-3">
              <h4 className="font-bold text-[17px]">{task.title}</h4>
              <p className="m text-[14px]">{task.due}</p>

              <div className="mt-2 w-full max-w-[140px]">
                {task.status === "done" ? (
                  <span className="inline-block py-1.5 px-4 rounded bg-[#E8F5E9] dark:bg-[#2A2F2A] text-[#2E7D32] dark:text-[#81C784] font-semibold text-xs">
                    ✓ Completed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenConfirm(task)}
                    className="b sm w-full flex items-center justify-center font-bold"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Confirmation Bottom Sheet Popup */}
      <TaskConfirmSheet
        isOpen={isConfirmOpen}
        taskTitle={selectedTask?.title || "Apply fertilizer"}
        onConfirm={handleConfirmTask}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

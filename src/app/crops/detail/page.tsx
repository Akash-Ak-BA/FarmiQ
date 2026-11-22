"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { TaskConfirmSheet } from "@/components/common/TaskConfirmSheet";
import { useTranslation } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { SerializedCrop } from "@/lib/crop-service";

interface TaskItem {
  id: string;
  cropId: string | null;
  cropName: string;
  plotName: string;
  title: string;
  dueDate: string;
  status: "pending" | "done";
  dueFormatted: string;
}

function CropDetailContent() {
  const { t } = useTranslation();
  const { refreshNotifications } = useNotifications();
  const searchParams = useSearchParams();
  const selectedCropId = searchParams.get("id");

  const [crops, setCrops] = useState<SerializedCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCropId, setActiveCropId] = useState<string | null>(selectedCropId);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check-in modal state
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinHealth, setCheckinHealth] = useState<"good" | "average" | "poor">("good");
  const [checkinStage, setCheckinStage] = useState("");
  const [checkinNotes, setCheckinNotes] = useState("");
  const [isSavingCheckin, setIsSavingCheckin] = useState(false);

  // Fetch crops and their scheduled tasks from MySQL
  const loadCropsFromDb = async () => {
    try {
      const res = await fetch("/api/crops");
      if (res.ok) {
        const data = await res.json();
        if (data.crops && data.crops.length > 0) {
          setCrops(data.crops);
          if (!activeCropId) {
            setActiveCropId(data.crops[0].id);
          } else if (!data.crops.some((c: SerializedCrop) => c.id === activeCropId)) {
            setActiveCropId(data.crops[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load crop details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCropsFromDb();
  }, []);

  useEffect(() => {
    if (selectedCropId) {
      setActiveCropId(selectedCropId);
    }
  }, [selectedCropId]);

  const currentCrop = crops.find((c) => c.id === activeCropId) || crops[0];

  const handleOpenConfirm = (task: TaskItem) => {
    setSelectedTask(task);
    setIsConfirmOpen(true);
  };

  const handleConfirmTask = async () => {
    if (!selectedTask) return;
    const taskToComplete = selectedTask;

    // 1. Mark task done in local state (optimistic)
    setCrops((prev) =>
      prev.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) =>
          t.id === taskToComplete.id ? { ...t, status: "done" } : t
        ),
      }))
    );

    // 2. Call backend transaction API
    try {
      await fetch(`/api/tasks/${taskToComplete.id}/complete`, { method: "POST" });
      refreshNotifications();
    } catch (err) {
      console.error("Failed to complete task in database:", err);
    }

    // 3. Automatically log to Daily Log in localStorage & activities
    try {
      const existingLogsStr = localStorage.getItem("farmiq_daily_logs");
      const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      const newLog = {
        id: Date.now(),
        crop: `${taskToComplete.cropName} (${taskToComplete.plotName})`,
        type: taskToComplete.title.toLowerCase().includes("fertilizer")
          ? "Fertilizer"
          : taskToComplete.title.toLowerCase().includes("weeding")
          ? "Weeding"
          : taskToComplete.title.toLowerCase().includes("spray")
          ? "Pesticide"
          : "Task",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        notes: `Completed task: ${taskToComplete.title}`,
        cost: 0,
      };
      localStorage.setItem("farmiq_daily_logs", JSON.stringify([newLog, ...existingLogs]));
    } catch {}

    // 4. Show confirmation toast
    setToastMessage(`✓ "${taskToComplete.title}" completed & logged in database!`);
    setTimeout(() => setToastMessage(null), 3500);

    setIsConfirmOpen(false);
    setSelectedTask(null);
  };

  // Submit checkin to MySQL
  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCrop) return;
    setIsSavingCheckin(true);

    try {
      const res = await fetch(`/api/crops/${currentCrop.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          growthStage: checkinStage.trim() || currentCrop.currentStage,
          health: checkinHealth,
          notes: checkinNotes.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save checkin to database");
      }

      setToastMessage("✓ Crop check-in recorded successfully in database!");
      setTimeout(() => setToastMessage(null), 3500);
      setIsCheckinModalOpen(false);
      setCheckinNotes("");
      // Reload crop data
      await loadCropsFromDb();
    } catch (err: any) {
      alert(err.message || "Could not record checkin.");
    } finally {
      setIsSavingCheckin(false);
    }
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#5F6368] dark:text-[#A3A8A3]">
              Loading crop schedules from database...
            </p>
          </div>
        ) : crops.length === 0 ? (
          <div className="c text-center py-12">
            <p className="font-semibold text-base mb-2">No crops in database yet</p>
            <p className="m text-sm mb-4">Add your first crop to generate schedules.</p>
            <a href="/crops/add" className="b inline-block font-bold">
              + Add Crop
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {/* Crop Selector Tabs (if more than 1 crop) */}
            {crops.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {crops.map((c) => {
                  const isSelected = c.id === currentCrop?.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCropId(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-[#2E7D32] text-white shadow-sm"
                          : "bg-gray-100 dark:bg-[#1E201E] text-[#5F6368] dark:text-[#A3A8A3] border border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      {c.cropName} ({c.plotName})
                    </button>
                  );
                })}
              </div>
            )}

            {currentCrop && (
              <div className="flex flex-col gap-4">
                {/* Crop Header Summary Card */}
                <div className="c border-l-4 border-l-[#2E7D32]">
                  <div className="r sb">
                    <div>
                      <h3 className="font-bold text-[19px] text-[#212121] dark:text-[#E8EAE8]">
                        {currentCrop.cropName}
                        {currentCrop.variety ? (
                          <span className="text-xs font-normal text-[#5F6368] dark:text-[#A3A8A3] ml-1.5">
                            ({currentCrop.variety})
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-xs font-medium text-[#5F6368] dark:text-[#A3A8A3] mt-0.5">
                        {currentCrop.farmName} • {currentCrop.plotName}
                        {currentCrop.areaAcres ? ` • ${currentCrop.areaAcres} Acres` : ""}
                      </p>
                    </div>
                    <span className="p font-semibold">{currentCrop.currentStage}</span>
                  </div>

                  <div className="bar my-2.5">
                    <i style={{ width: `${currentCrop.progressPercent}%` }} />
                  </div>

                  <div className="r sb text-xs m">
                    <span>
                      Sown: {currentCrop.sowingDate} • Harvest: {currentCrop.harvestDateFormatted}
                    </span>
                    <span className="font-bold text-[#2E7D32] dark:text-[#81C784]">
                      {currentCrop.daysRemaining} days left
                    </span>
                  </div>
                </div>

                {/* Section: Next 5 Scheduled Tasks */}
                <div>
                  <div className="r sb mb-2">
                    <h4 className="font-bold text-[16px] text-[#212121] dark:text-[#E8EAE8]">
                      Scheduled Tasks for {currentCrop.cropName}
                    </h4>
                    <span className="text-xs text-[#5F6368] dark:text-[#A3A8A3]">
                      {currentCrop.tasks.filter((t) => t.status === "pending").length} pending
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {currentCrop.tasks.length > 0 ? (
                      currentCrop.tasks.map((task, idx) => (
                        <div
                          key={task.id}
                          className={`c py-2.5 px-3 transition-opacity ${
                            task.status === "done"
                              ? "opacity-60 bg-gray-50 dark:bg-[#181a18]"
                              : ""
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
                              <p className="m text-[13px] mt-0.5">Due: {task.dueFormatted}</p>
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
                      ))
                    ) : (
                      <div className="c py-4 text-center">
                        <p className="m text-xs">No pending tasks for this crop.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Crop Check-ins / Monitoring */}
                <div>
                  <div className="r sb mb-2">
                    <h4 className="font-bold text-[16px] text-[#212121] dark:text-[#E8EAE8]">
                      Monitoring & Check-ins
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsCheckinModalOpen(true)}
                      className="text-xs font-bold text-[#2E7D32] dark:text-[#81C784] underline"
                    >
                      + Record Check-in
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {currentCrop.checkins && currentCrop.checkins.length > 0 ? (
                      currentCrop.checkins.map((chk) => (
                        <div key={chk.id} className="c py-2 px-3">
                          <div className="r sb mb-0.5">
                            <span className="text-xs font-bold text-[#212121] dark:text-[#E8EAE8]">
                              Checked: {chk.checkedOn}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                                chk.health === "good"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : chk.health === "average"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                              }`}
                            >
                              Health: {chk.health}
                            </span>
                          </div>
                          {chk.growthStage && (
                            <p className="text-xs font-medium text-[#5F6368] dark:text-[#A3A8A3]">
                              Stage: {chk.growthStage}
                            </p>
                          )}
                          {chk.notes && (
                            <p className="m text-[13px] mt-1 leading-relaxed">{chk.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="c py-3 text-center">
                        <p className="m text-xs">No check-ins recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Record Check-in Modal */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1E201E] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3.5">
            <h3 className="font-bold text-[17px] text-[#212121] dark:text-[#E8EAE8]">
              Record Check-in: {currentCrop?.cropName}
            </h3>

            <form onSubmit={handleSaveCheckin} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="lb text-xs">Crop Health</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["good", "average", "poor"] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setCheckinHealth(h)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                        checkinHealth === h
                          ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                          : "bg-gray-50 dark:bg-[#121312] text-[#5F6368] dark:text-[#A3A8A3] border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="lb text-xs">Growth Stage (optional)</label>
                <input
                  type="text"
                  value={checkinStage}
                  onChange={(e) => setCheckinStage(e.target.value)}
                  placeholder={currentCrop?.currentStage || "e.g. Flowering"}
                  className="i text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="lb text-xs">Observation Notes</label>
                <textarea
                  rows={3}
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  placeholder="Notes on pests, leaf color, soil moisture..."
                  className="i text-sm resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="b o flex-1 font-bold text-xs"
                  disabled={isSavingCheckin}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="b flex-1 font-bold text-xs"
                  disabled={isSavingCheckin}
                >
                  {isSavingCheckin ? "Saving..." : "Save Check-in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default function CropDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="s flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CropDetailContent />
    </Suspense>
  );
}

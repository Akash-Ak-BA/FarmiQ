"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface DbStatus {
  status: string;
  message?: string;
  database_connected: boolean;
  database_name?: string;
  tables_count?: number;
  error?: string;
  timestamp?: string;
}

export default function HelloPage() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkDb = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        status: "error",
        database_connected: false,
        error: err.message || "Failed to reach health endpoint",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDb();
  }, []);

  return (
    <div className="farmiq-screen">
      {/* Header with FarmiQ Branding */}
      <header className="farmiq-header px-4">
        <div className="flex items-center justify-center">
          <Image
            src="/farmiq_plant_white.svg"
            alt="FarmiQ Logo"
            width={32}
            height={32}
            priority
          />
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/farmiq_wordmark.png"
            alt="FarmiQ Wordmark"
            width={110}
            height={28}
            className="h-6 w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-emerald-300 animate-pulse"></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* Welcome Card */}
        <div className="farmiq-card">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <Image
                src="/farmiq_plant_green.svg"
                alt="Plant Icon"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#212121] leading-tight">
                FarmiQ
              </h1>
              <p className="text-xs text-[#5F6368]">
                Smart Farming Assistant • Step 1
              </p>
            </div>
          </div>
          <p className="text-sm text-[#212121] mt-1 leading-relaxed">
            Welcome! The FarmiQ foundation has been successfully initialized with
            Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>

        {/* Database Connection Status Card */}
        <div className="farmiq-card border-l-4 border-l-[#2E7D32]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">
              Database Status
            </span>
            <button
              onClick={checkDb}
              disabled={loading}
              className="text-xs text-[#2E7D32] font-semibold underline disabled:opacity-50"
            >
              {loading ? "Checking..." : "Re-check"}
            </button>
          </div>

          {loading ? (
            <div className="py-3 flex items-center gap-2 text-sm text-[#5F6368]">
              <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
              Checking database connection...
            </div>
          ) : dbStatus?.database_connected ? (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <span className="text-lg">✅</span> Connected to{" "}
                {dbStatus.database_name || "TiDB Cloud / MySQL"}
              </div>
              <p className="text-xs text-[#5F6368]">
                Found {dbStatus.tables_count ?? 0} tables in the schema.
              </p>
            </div>
          ) : dbStatus?.status === "pending_config" ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                <span className="text-base">⏳</span> DATABASE_URL not set yet
              </div>
              <p className="text-xs text-[#5F6368] leading-normal">
                To connect to your TiDB Cloud or local MySQL Workbench database,
                add your <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">DATABASE_URL</code> to{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
              </p>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <span className="text-base">❌</span> Connection Error
              </div>
              <p className="text-xs text-red-500 font-mono break-all">
                {dbStatus?.error}
              </p>
            </div>
          )}
        </div>

        {/* Step 1 Deliverables Summary */}
        <div className="farmiq-card">
          <h2 className="text-sm font-bold text-[#212121] mb-2">
            Step 1 Setup Checklist
          </h2>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <strong className="text-[#212121]">Next.js 14 App Router</strong>
                <p className="text-[#5F6368]">TypeScript, App Router, responsive mobile-first shell.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <strong className="text-[#212121]">Design System & Theme</strong>
                <p className="text-[#5F6368]">Tailwind CSS configured with FarmiQ colors (#2E7D32, #F5F7F5).</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <strong className="text-[#212121]">Database Schema</strong>
                <p className="text-[#5F6368]">Prisma schema created matching all 20 tables & view from farmiq_schema.sql.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <strong className="text-[#212121]">Environment Template</strong>
                <p className="text-[#5F6368]">.env.example created with all required secrets and configuration keys.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <strong className="text-[#212121]">Database Health Check</strong>
                <p className="text-[#5F6368]">Read-only verification script and /api/health endpoint ready.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language Preview */}
        <div className="farmiq-card bg-[#FFF3E0] border-[#FFCC80]">
          <h3 className="text-xs font-bold text-[#212121] mb-1">
            Languages Supported
          </h3>
          <p className="text-xs text-[#5F6368]">
            English • தமிழ் (Tamil) • తెలుగు (Telugu)
          </p>
        </div>
      </main>

      {/* Footer info */}
      <footer className="p-3 text-center text-xs text-[#5F6368] border-t border-[#E0E3E0] bg-white">
        FarmiQ • Built for Indian Farmers
      </footer>
    </div>
  );
}

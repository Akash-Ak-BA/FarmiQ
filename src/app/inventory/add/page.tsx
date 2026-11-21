"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";

export default function AddInventoryItemPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("fertilizer");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("bags");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [lowStockLevel, setLowStockLevel] = useState("2");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    try {
      const existingStr = localStorage.getItem("farmiq_inventory_items");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const newItem = {
        id: Date.now(),
        name,
        category,
        qty: `${quantity} ${unit}`,
        rawQty: parseFloat(quantity),
        unit,
        costPerUnit: costPerUnit ? parseFloat(costPerUnit) : 0,
        lowStockLevel: parseFloat(lowStockLevel),
        isLow: parseFloat(quantity) <= parseFloat(lowStockLevel),
      };
      localStorage.setItem("farmiq_inventory_items", JSON.stringify([newItem, ...existing]));
    } catch {}

    alert(`Item "${name}" (${quantity} ${unit}) added to inventory!`);
    router.push("/inventory");
  };

  return (
    <div className="s">
      <Header title="Add Inventory Item" showBack />

      <main className="bd overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="lb">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DAP Fertilizer, Bio Neem Spray"
              className="i"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="lb">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="i"
            >
              <option value="fertilizer">Fertilizer</option>
              <option value="pesticide">Pesticide</option>
              <option value="seed">Seeds</option>
              <option value="tool">Tools & Equipment</option>
              <option value="produce">Harvested Produce</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-[2]">
              <label className="lb">Quantity to Add</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5"
                className="i"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-[1]">
              <label className="lb">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="i"
              >
                <option value="bags">bags</option>
                <option value="kg">kg</option>
                <option value="litres">litres</option>
                <option value="packets">packets</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="lb">Cost per unit (₹) (optional)</label>
            <input
              type="number"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              placeholder="e.g. 450"
              className="i"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="lb">Low Stock Alert Threshold</label>
            <input
              type="number"
              value={lowStockLevel}
              onChange={(e) => setLowStockLevel(e.target.value)}
              placeholder="Alert when stock falls to..."
              className="i"
              required
            />
          </div>

          <div className="pt-3 pb-2">
            <button
              type="submit"
              className="b w-full flex items-center justify-center font-bold"
            >
              + Add item to inventory
            </button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

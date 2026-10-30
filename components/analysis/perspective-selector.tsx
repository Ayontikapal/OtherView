"use client";

import React from "react";
import { PerspectiveId, PERSPECTIVES_CONFIG } from "@/types/analysis";
import {
  Accessibility,
  Eye,
  Footprints,
  BrainCircuit,
  LayoutGrid,
} from "lucide-react";

interface PerspectiveSelectorProps {
  activePerspective: PerspectiveId | "all";
  onSelectPerspective: (perspective: PerspectiveId | "all") => void;
  counts: Record<PerspectiveId, number>;
  totalCount: number;
}

export function PerspectiveSelector({
  activePerspective,
  onSelectPerspective,
  counts,
  totalCount,
}: PerspectiveSelectorProps) {
  const getIcon = (id: PerspectiveId | "all") => {
    switch (id) {
      case "all":
        return <LayoutGrid className="w-4 h-4" />;
      case "wheelchair_access":
        return <Accessibility className="w-4 h-4" />;
      case "low_vision":
        return <Eye className="w-4 h-4" />;
      case "mobility":
        return <Footprints className="w-4 h-4" />;
      case "sensory_access":
        return <BrainCircuit className="w-4 h-4" />;
    }
  };

  const perspectives: Array<{ id: PerspectiveId | "all"; label: string; count: number }> = [
    { id: "all", label: "All Findings", count: totalCount },
    {
      id: "wheelchair_access",
      label: PERSPECTIVES_CONFIG.wheelchair_access.shortLabel,
      count: counts.wheelchair_access,
    },
    {
      id: "low_vision",
      label: PERSPECTIVES_CONFIG.low_vision.shortLabel,
      count: counts.low_vision,
    },
    {
      id: "mobility",
      label: PERSPECTIVES_CONFIG.mobility.shortLabel,
      count: counts.mobility,
    },
    {
      id: "sensory_access",
      label: PERSPECTIVES_CONFIG.sensory_access.shortLabel,
      count: counts.sensory_access,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Filter by Accessibility Perspective
        </label>
        <span className="text-xs text-stone-700">
          {totalCount} total {totalCount === 1 ? "finding" : "findings"} identified
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Accessibility perspectives"
        className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl overflow-x-auto border border-stone-200/80 no-scrollbar"
      >
        {perspectives.map((tab) => {
          const isActive = activePerspective === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectPerspective(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isActive
                  ? "bg-white text-stone-900 shadow-2xs font-semibold ring-1 ring-stone-900/5"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
              }`}
            >
              <span className={isActive ? "text-indigo-600" : "text-stone-400"}>
                {getIcon(tab.id)}
              </span>
              <span>{tab.label}</span>
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-stone-200/80 text-stone-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activePerspective !== "all" && (
        <p className="text-xs text-stone-500 pt-1 px-1">
          {PERSPECTIVES_CONFIG[activePerspective].description}
        </p>
      )}
    </div>
  );
}

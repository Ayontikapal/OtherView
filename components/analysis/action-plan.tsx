"use client";

import React, { useState } from "react";
import {
  ActionPlanItem,
  ActionStatus,
  PriorityLevel,
  PERSPECTIVES_CONFIG,
} from "@/types/analysis";
import {
  Ruler,
  Info,
  ChevronDown,
} from "lucide-react";

interface ActionPlanProps {
  items: ActionPlanItem[];
  onUpdateStatus: (id: string, status: ActionStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function ActionPlan({
  items,
  onUpdateStatus,
  onUpdateNotes,
}: ActionPlanProps) {
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | "all">("all");
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Calculate statistics
  const total = items.length;
  const completed = items.filter((i) => i.status === "completed").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Filter items
  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (priorityFilter !== "all" && item.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "high":
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
            Medium Priority
          </span>
        );
      case "low":
        return (
          <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards & Progress */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">
              Interactive Accessibility Action Plan
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Track practical review items and verify on-site remediation steps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-900">{percentComplete}%</span>
            <span className="text-xs text-stone-700">Completed ({completed}/{total})</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-300"
            style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
          />
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
            <div className="text-base sm:text-lg font-bold text-stone-800">{pending}</div>
            <div className="text-[11px] text-stone-500 font-medium">Pending Review</div>
          </div>
          <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-100">
            <div className="text-base sm:text-lg font-bold text-amber-700">{inProgress}</div>
            <div className="text-[11px] text-amber-600 font-medium">In Progress</div>
          </div>
          <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-100">
            <div className="text-base sm:text-lg font-bold text-emerald-700">{completed}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Completed</div>
          </div>
        </div>

        {/* User disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-stone-50/90 rounded-xl border border-stone-200/70 text-[11px] text-stone-600">
          <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Action statuses are saved locally for this session. Marking an item as completed is a user-recorded tracking status and does not certify independent physical compliance.
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
          {(["all", "pending", "in_progress", "completed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === s
                  ? "bg-white text-stone-900 shadow-2xs font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {s === "all" ? "All Statuses" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 font-medium text-[11px]">Priority:</span>
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                priorityFilter === p
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 text-center text-xs sm:text-sm text-stone-500">
            No action items match the selected filters.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const meta = PERSPECTIVES_CONFIG[item.perspective];
            const isNotesOpen = expandedNotesId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 space-y-3 ${
                  item.status === "completed"
                    ? "border-emerald-200/90 bg-emerald-50/15"
                    : item.status === "in_progress"
                    ? "border-amber-200/90 bg-amber-50/15"
                    : "border-stone-200/90"
                }`}
              >
                {/* Header line */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      {meta?.label || "General"}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200/70 text-[11px]">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.id, "pending")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        item.status === "pending"
                          ? "bg-white text-stone-900 font-semibold shadow-2xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.id, "in_progress")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        item.status === "in_progress"
                          ? "bg-amber-500 text-white font-semibold shadow-2xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.id, "completed")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        item.status === "completed"
                          ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-stone-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed">
                    <strong>Recommended Action: </strong>
                    {item.recommendation}
                  </p>
                </div>

                {/* Physical Verification requirement if present */}
                {item.verificationRequirement && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
                    <Ruler className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Inspection Step: </span>
                      <span className="text-amber-800">{item.verificationRequirement}</span>
                    </div>
                  </div>
                )}

                {/* Notes Toggle & Input */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedNotesId(isNotesOpen ? null : item.id)}
                    className="text-[11px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1"
                  >
                    <span>{item.notes ? "Edit internal notes" : "+ Add inspection notes"}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isNotesOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isNotesOpen && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in">
                      <textarea
                        value={item.notes || ""}
                        onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                        placeholder="e.g. Facilities manager notified; contractor estimate scheduled for next Tuesday..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-stone-50/50"
                      />
                    </div>
                  )}

                  {item.notes && !isNotesOpen && (
                    <p className="mt-1 text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

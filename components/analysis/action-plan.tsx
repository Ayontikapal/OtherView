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
  CheckCircle2,
  Clock,
  CircleDashed,
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
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#e85d63] bg-[#e85d63]/10 border border-[#e85d63]/30 px-2.5 py-0.5 rounded-full">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#eca541] bg-[#eca541]/10 border border-[#eca541]/30 px-2.5 py-0.5 rounded-full">
            Medium Priority
          </span>
        );
      case "low":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#c3b8e3] bg-[#c3b8e3]/10 border border-[#c3b8e3]/30 px-2.5 py-0.5 rounded-full">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards & Progress */}
      <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#eca541] bg-[#eca541]/10 px-2 py-0.5 rounded border border-[#eca541]/25">
                Execution Workflow
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#fdf9f4] tracking-tight">
              Interactive Accessibility Action Plan
            </h3>
            <p className="text-xs sm:text-sm text-[#a9a1c6] mt-0.5">
              Track physical review items, assign statuses, and verify on-site remediation steps.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-[#141221] px-3.5 py-2 rounded-xl border border-[#c3b8e3]/15">
            <span className="text-base font-bold text-[#6ee7b7] font-mono">{percentComplete}%</span>
            <span className="text-xs text-[#a9a1c6]">Done ({completed}/{total})</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#141221] rounded-full overflow-hidden flex border border-[#c3b8e3]/15">
          <div
            className="bg-[#6ee7b7] transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
          <div
            className="bg-[#eca541] transition-all duration-300"
            style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
          />
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="bg-[#141221] rounded-xl p-3 border border-[#c3b8e3]/10">
            <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold text-[#fdf9f4] font-mono">
              <CircleDashed className="w-4 h-4 text-[#a9a1c6]" />
              {pending}
            </div>
            <div className="text-[11px] text-[#a9a1c6] font-medium mt-0.5">Pending Review</div>
          </div>
          <div className="bg-[#eca541]/10 rounded-xl p-3 border border-[#eca541]/20">
            <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold text-[#eca541] font-mono">
              <Clock className="w-4 h-4 text-[#eca541]" />
              {inProgress}
            </div>
            <div className="text-[11px] text-[#eca541] font-medium mt-0.5">In Progress</div>
          </div>
          <div className="bg-[#6ee7b7]/10 rounded-xl p-3 border border-[#6ee7b7]/20">
            <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold text-[#6ee7b7] font-mono">
              <CheckCircle2 className="w-4 h-4 text-[#6ee7b7]" />
              {completed}
            </div>
            <div className="text-[11px] text-[#6ee7b7] font-medium mt-0.5">Completed</div>
          </div>
        </div>

        {/* User disclaimer */}
        <div className="flex items-start gap-2.5 p-3.5 bg-[#141221] rounded-xl border border-[#c3b8e3]/15 text-xs text-[#a9a1c6]">
          <Info className="w-4 h-4 text-[#c3b8e3] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-[#fdf9f4]">Advisory Notice:</strong> Action plan statuses are saved locally and per-user for your session. Marking an item as completed is an internal workflow milestone and does not replace official on-site regulatory compliance certification.
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#1e1a33] rounded-xl border border-[#c3b8e3]/15">
          {(["all", "pending", "in_progress", "completed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                statusFilter === s
                  ? "bg-[#e85d63] text-[#141221] font-bold shadow-md"
                  : "text-[#a9a1c6] hover:text-[#fdf9f4] hover:bg-[#141221]/50"
              }`}
            >
              {s === "all" ? "All Statuses" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#a9a1c6] font-medium text-[11px] uppercase tracking-wider font-mono">Priority:</span>
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                priorityFilter === p
                  ? "bg-[#1e1a33] text-[#fdf9f4] border-[#c3b8e3]/50 font-bold"
                  : "bg-[#141221] text-[#a9a1c6] border-[#c3b8e3]/15 hover:bg-[#1e1a33] hover:text-[#fdf9f4]"
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
          <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-10 text-center text-xs sm:text-sm text-[#a9a1c6]">
            No action items match the selected filters.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const meta = PERSPECTIVES_CONFIG[item.perspective];
            const isNotesOpen = expandedNotesId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-[#1e1a33] rounded-2xl border transition-all p-4 sm:p-5 space-y-3 ${
                  item.status === "completed"
                    ? "border-[#6ee7b7]/40 bg-[#1e1a33]"
                    : item.status === "in_progress"
                    ? "border-[#eca541]/40 bg-[#1e1a33]"
                    : "border-[#c3b8e3]/15 hover:border-[#c3b8e3]/30"
                }`}
              >
                {/* Header line */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#141221] text-[#fdf9f4] text-[11px] font-mono font-bold flex items-center justify-center border border-[#c3b8e3]/20">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-medium px-2 py-0.5 rounded-md bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20">
                      {meta?.label || "General"}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-[#141221] p-0.5 rounded-lg border border-[#c3b8e3]/15 text-[11px]">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.id, "pending")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        item.status === "pending"
                          ? "bg-[#1e1a33] text-[#fdf9f4] font-semibold shadow-xs"
                          : "text-[#a9a1c6] hover:text-[#fdf9f4]"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.id, "in_progress")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        item.status === "in_progress"
                          ? "bg-[#eca541] text-[#141221] font-bold shadow-xs"
                          : "text-[#a9a1c6] hover:text-[#fdf9f4]"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.id, "completed")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        item.status === "completed"
                          ? "bg-[#6ee7b7] text-[#141221] font-bold shadow-xs"
                          : "text-[#a9a1c6] hover:text-[#fdf9f4]"
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#fdf9f4] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#a9a1c6] mt-1 leading-relaxed">
                    <strong className="text-[#fdf9f4]">Recommended Action: </strong>
                    {item.recommendation}
                  </p>
                </div>

                {/* Physical Verification requirement if present */}
                {item.verificationRequirement && (
                  <div className="bg-[#eca541]/10 border border-[#eca541]/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#eca541]">
                    <Ruler className="w-4 h-4 text-[#eca541] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider font-mono text-[10px] block mb-0.5">Physical Verification Step</span>
                      <span className="text-[#fdf9f4]/90">{item.verificationRequirement}</span>
                    </div>
                  </div>
                )}

                {/* Notes Toggle & Input */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedNotesId(isNotesOpen ? null : item.id)}
                    className="text-[11px] font-mono text-[#c3b8e3] hover:text-[#fdf9f4] flex items-center gap-1.5 transition-colors"
                  >
                    <span>{item.notes ? "Edit inspection notes" : "+ Add inspection notes"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isNotesOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isNotesOpen && (
                    <div className="mt-2.5 space-y-1.5 animate-in fade-in">
                      <textarea
                        value={item.notes || ""}
                        onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                        placeholder="e.g. Facilities manager notified; contractor estimate scheduled for next Tuesday..."
                        rows={2}
                        className="w-full text-xs p-3 rounded-xl border border-[#c3b8e3]/20 focus:outline-none focus:border-[#e85d63] bg-[#141221] text-[#fdf9f4] placeholder-[#a9a1c6]/50 transition-colors"
                      />
                    </div>
                  )}

                  {item.notes && !isNotesOpen && (
                    <p className="mt-2 text-xs text-[#a9a1c6] italic bg-[#141221] p-3 rounded-xl border border-[#c3b8e3]/15">
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

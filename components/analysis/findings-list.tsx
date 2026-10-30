"use client";

import React from "react";
import { AccessibilityFinding, PerspectiveId, PERSPECTIVES_CONFIG } from "@/types/analysis";
import { FindingCard } from "./finding-card";
import { CheckCircle2 } from "lucide-react";

interface FindingsListProps {
  findings: AccessibilityFinding[];
  activePerspective: PerspectiveId | "all";
  selectedFindingId?: string | null;
  onSelectFinding?: (id: string | null) => void;
}

export function FindingsList({
  findings,
  activePerspective,
  selectedFindingId,
  onSelectFinding,
}: FindingsListProps) {
  const filteredFindings =
    activePerspective === "all"
      ? findings
      : findings.filter((f) => f.perspective === activePerspective);

  if (filteredFindings.length === 0) {
    const isSpecific = activePerspective !== "all";
    const perspectiveName = isSpecific
      ? PERSPECTIVES_CONFIG[activePerspective].label
      : "Selected Criteria";

    return (
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-stone-900">
          No Significant Barriers Identified for {perspectiveName}
        </h4>
        <p className="text-xs sm:text-sm text-stone-700 max-w-md mx-auto leading-relaxed">
          No specific visual evidence was observed in this photograph to support a barrier under this perspective. Note that areas outside the camera frame still warrant in-person review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredFindings.map((finding) => (
        <FindingCard
          key={finding.id}
          finding={finding}
          isSelected={selectedFindingId === finding.id}
          onSelect={(id) => onSelectFinding?.(selectedFindingId === id ? null : id)}
        />
      ))}
    </div>
  );
}

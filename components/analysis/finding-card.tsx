"use client";

import React from "react";
import {
  AccessibilityFinding,
  PERSPECTIVES_CONFIG,
  PriorityLevel,
  ConfidenceLevel,
} from "@/types/analysis";
import {
  Accessibility,
  Eye,
  Footprints,
  BrainCircuit,
  AlertCircle,
  Ruler,
  Lightbulb,
  Search,
  Crosshair,
} from "lucide-react";

interface FindingCardProps {
  finding: AccessibilityFinding;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function FindingCard({ finding, isSelected, onSelect }: FindingCardProps) {
  const meta = PERSPECTIVES_CONFIG[finding.perspective];

  const getPerspectiveIcon = () => {
    switch (finding.perspective) {
      case "wheelchair_access":
        return <Accessibility className="w-3.5 h-3.5" />;
      case "low_vision":
        return <Eye className="w-3.5 h-3.5" />;
      case "mobility":
        return <Footprints className="w-3.5 h-3.5" />;
      case "sensory_access":
        return <BrainCircuit className="w-3.5 h-3.5" />;
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium Priority
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Low Priority
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "high":
        return (
          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            High Confidence
          </span>
        );
      case "medium":
        return (
          <span className="text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
            Moderate Confidence
          </span>
        );
      case "low":
        return (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Tentative / Uncertain
          </span>
        );
    }
  };

  return (
    <article
      id={`finding-${finding.id}`}
      onClick={() => onSelect?.(finding.id)}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
        isSelected
          ? "border-indigo-600 ring-4 ring-indigo-500/15 shadow-md scale-[1.005]"
          : "border-stone-200 shadow-2xs hover:shadow-xs hover:border-stone-300"
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {getPerspectiveIcon()}
              <span>{meta.label}</span>
            </span>
            {getPriorityBadge(finding.priority)}
            {finding.boundingBox && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50/70 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                <Crosshair className="w-3 h-3 text-indigo-600" />
                <span>Zone #{finding.id.replace(/[^0-9]/g, "") || "1"}</span>
              </span>
            )}
          </div>
          <div>{getConfidenceBadge(finding.confidence)}</div>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-stone-900 leading-snug">
            {finding.title}
          </h4>
          <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
            {finding.description}
          </p>
        </div>

        {/* Evidence & Impact Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Observed Evidence */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <Search className="w-3.5 h-3.5 text-stone-500" />
              <span>Observed Visual Evidence</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {finding.observedEvidence}
            </p>
          </div>

          {/* Potential Impact */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Potential Impact</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {finding.potentialImpact}
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-900">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
            <span>Recommended Consideration</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
            {finding.recommendation}
          </p>
        </div>
      </div>

      {/* Verification Footer Banner if needed */}
      {finding.requiresVerification && (
        <div className="bg-amber-50/80 border-t border-amber-200/70 px-5 py-3 flex items-start gap-2.5 text-xs text-amber-900">
          <Ruler className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Requires Physical On-Site Verification: </span>
            <span className="text-amber-800">{finding.verificationReason}</span>
          </div>
        </div>
      )}
    </article>
  );
}

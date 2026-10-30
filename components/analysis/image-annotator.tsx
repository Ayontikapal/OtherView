"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AccessibilityFinding, PerspectiveId } from "@/types/analysis";
import { Eye, EyeOff, Layers } from "lucide-react";

interface ImageAnnotatorProps {
  imageUrl: string;
  findings: AccessibilityFinding[];
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string | null) => void;
  activePerspective: PerspectiveId | "all";
}

export function ImageAnnotator({
  imageUrl,
  findings,
  selectedFindingId,
  onSelectFinding,
  activePerspective,
}: ImageAnnotatorProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);

  // Filter findings matching active perspective and having bounding boxes
  const annotatableFindings = findings.filter((f) => {
    if (!f.boundingBox) return false;
    if (activePerspective === "all") return true;
    return f.perspective === activePerspective;
  });

  const getPerspectiveColor = (perspective: PerspectiveId, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) {
      return {
        border: "border-indigo-600 ring-4 ring-indigo-400/40 bg-indigo-500/20",
        badge: "bg-indigo-600 text-white shadow-md",
      };
    }
    if (isHovered) {
      return {
        border: "border-amber-500 ring-2 ring-amber-300/60 bg-amber-500/15",
        badge: "bg-amber-600 text-white shadow-sm",
      };
    }

    switch (perspective) {
      case "wheelchair_access":
        return {
          border: "border-indigo-500/90 bg-indigo-500/10 hover:bg-indigo-500/20",
          badge: "bg-indigo-700 text-white",
        };
      case "low_vision":
        return {
          border: "border-amber-500/90 bg-amber-500/10 hover:bg-amber-500/20",
          badge: "bg-amber-700 text-white",
        };
      case "mobility":
        return {
          border: "border-emerald-500/90 bg-emerald-500/10 hover:bg-emerald-500/20",
          badge: "bg-emerald-700 text-white",
        };
      case "sensory_access":
        return {
          border: "border-purple-500/90 bg-purple-500/10 hover:bg-purple-500/20",
          badge: "bg-purple-700 text-white",
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Header controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-stone-700">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Visual Evidence Grounding</span>
          {annotatableFindings.length > 0 && (
            <span className="px-2 py-0.2 bg-indigo-50 text-indigo-700 rounded-full font-semibold border border-indigo-200/70 text-[10px]">
              {annotatableFindings.length} {annotatableFindings.length === 1 ? "zone" : "zones"} identified
            </span>
          )}
        </div>

        {annotatableFindings.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-md transition-colors"
            aria-pressed={showAnnotations}
          >
            {showAnnotations ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                <span>Hide Overlays</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                <span>Show Overlays</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-200/90 shadow-2xs group select-none">
        <Image
          src={imageUrl}
          alt="Photograph of physical environment reviewed for accessibility"
          fill
          className="object-cover transition-transform duration-200"
          sizes="(max-width: 1024px) 100vw, 540px"
          priority
        />

        {/* Visual Annotations Layer */}
        {showAnnotations && (
          <div className="absolute inset-0 pointer-events-none">
            {annotatableFindings.map((finding, idx) => {
              if (!finding.boundingBox) return null;
              const { ymin, xmin, ymax, xmax } = finding.boundingBox;
              const isSelected = selectedFindingId === finding.id;
              const isHovered = hoveredFindingId === finding.id;
              const colors = getPerspectiveColor(finding.perspective, isSelected, isHovered);

              const top = `${ymin / 10}%`;
              const left = `${xmin / 10}%`;
              const width = `${(xmax - xmin) / 10}%`;
              const height = `${(ymax - ymin) / 10}%`;

              return (
                <div
                  key={finding.id}
                  style={{ top, left, width, height }}
                  onMouseEnter={() => setHoveredFindingId(finding.id)}
                  onMouseLeave={() => setHoveredFindingId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFinding(isSelected ? null : finding.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Visual zone ${idx + 1}: ${finding.title}`}
                  className={`absolute pointer-events-auto cursor-pointer rounded-lg border-2 transition-all duration-150 ${colors.border}`}
                >
                  {/* Floating Tag */}
                  <div
                    className={`absolute -top-3 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight whitespace-nowrap transition-transform ${
                      colors.badge
                    } ${isSelected || isHovered ? "scale-105 z-20" : "z-10"}`}
                  >
                    #{idx + 1} {finding.title.length > 24 ? `${finding.title.slice(0, 24)}...` : finding.title}
                  </div>

                  {/* Tooltip on hover/select */}
                  {(isHovered || isSelected) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 rounded-lg bg-stone-900/95 text-white text-[11px] shadow-xl backdrop-blur-xs pointer-events-none z-30 animate-in fade-in zoom-in-95">
                      <p className="font-semibold text-stone-100">{finding.title}</p>
                      <p className="text-stone-300 text-[10px] mt-0.5 line-clamp-2">
                        {finding.observedEvidence}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[9px] text-stone-400">
                        <span className="capitalize">{finding.priority} Priority</span>
                        <span>Click card to inspect</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explanatory footer */}
      {annotatableFindings.length > 0 ? (
        <p className="text-[11px] text-stone-700 italic">
          Click any highlighted zone on the photograph or click a card below to focus on its specific evidence.
        </p>
      ) : (
        <p className="text-[11px] text-stone-700 italic">
          No localized bounding regions returned for this photograph. Review observations in the findings list.
        </p>
      )}
    </div>
  );
}

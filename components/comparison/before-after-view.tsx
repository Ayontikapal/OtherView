"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  ReassessmentAnalysis,
  ComparisonStatus,
  PERSPECTIVES_CONFIG,
} from "@/types/analysis";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Ruler,
  TrendingUp,
  Upload,
  Loader2,
  Info,
  RotateCcw,
  Trash2,
  FileCheck,
  AlertCircle,
} from "lucide-react";

interface BeforeAfterViewProps {
  beforeImageUrl: string;
  afterImageUrl: string | null;
  reassessment: ReassessmentAnalysis | null;
  isAnalyzing: boolean;
  onUploadAfterImage: (file: File, url: string) => void;
  onRemoveAfterImage?: () => void;
  onLoadDemoAfter: () => void;
  onRunReassessment: () => void;
  onBackToSingle: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function BeforeAfterView({
  beforeImageUrl,
  afterImageUrl,
  reassessment,
  isAnalyzing,
  onUploadAfterImage,
  onRemoveAfterImage,
  onLoadDemoAfter,
  onRunReassessment,
  onBackToSingle,
}: BeforeAfterViewProps) {
  const [activeFilter, setActiveFilter] = useState<ComparisonStatus | "all">("all");
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and process selected file
  const processFile = (file: File) => {
    setValidationError(null);

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError("Unsupported file format. Please upload a JPEG, PNG, or WebP photograph.");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`);
      return;
    }

    // Read and emit data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUploadAfterImage(file, event.target.result as string);
      }
    };
    reader.onerror = () => {
      setValidationError("Failed to read the selected image file. Please try another file.");
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving target element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isAnalyzing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleTriggerFileInput = () => {
    if (isAnalyzing) return;
    fileInputRef.current?.click();
  };

  const getStatusBadge = (status: ComparisonStatus) => {
    switch (status) {
      case "appears_improved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Appears Improved
          </span>
        );
      case "still_visible":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Still Observed
          </span>
        );
      case "newly_observed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Newly Observed
          </span>
        );
      case "requires_verification":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
            <Ruler className="w-3.5 h-3.5 text-stone-500" />
            Requires Verification
          </span>
        );
    }
  };

  const filteredComparisons = reassessment
    ? reassessment.comparisons.filter((c) =>
        activeFilter === "all" ? true : c.status === activeFilter
      )
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToSingle}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-indigo-600 mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Baseline Review</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Before vs. After Accessibility Reassessment
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Closed-Loop Review
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Compare post-remediation photographs against baseline findings to verify whether physical barriers were addressed.
          </p>
        </div>

        {afterImageUrl && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={onRunReassessment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Comparing Changes...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{reassessment ? "Re-run Comparison" : "Run Reassessment Comparison"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Validation error banner if any */}
      {validationError && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-xs font-semibold underline text-rose-700 hover:text-rose-900 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Side-by-Side Photo Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* BEFORE Photo */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold flex items-center justify-center">1</span>
              <span>Before Interventions (Baseline)</span>
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
              Original Photo
            </span>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
            <Image
              src={beforeImageUrl}
              alt="Baseline environment photograph before modifications"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
              priority
            />
          </div>
          <p className="text-[11px] text-stone-500 text-center">
            Original physical environment state prior to remediation.
          </p>
        </div>

        {/* AFTER Photo / Upload Area */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">2</span>
              <span>After Interventions (Follow-Up Photo)</span>
            </span>
            {afterImageUrl ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-600" />
                Loaded
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Action Required
              </span>
            )}
          </div>

          {afterImageUrl ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                <Image
                  src={afterImageUrl}
                  alt="Follow-up photograph after physical modifications"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>

              {/* Action buttons under loaded after-image */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-stone-500">
                  Follow-up photo loaded. Ready for comparative analysis.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleTriggerFileInput}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3 text-stone-500" />
                    <span>Replace</span>
                  </button>
                  {onRemoveAfterImage && (
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={onRemoveAfterImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone for After Image */
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center space-y-3 ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/70 scale-[0.99] ring-4 ring-indigo-500/10"
                  : "border-stone-300 bg-stone-50 hover:bg-stone-100/60"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isDragging ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
              }`}>
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="font-semibold text-xs sm:text-sm text-stone-900">
                  {isDragging ? "Drop Follow-Up Photo Here" : "Drag & Drop Follow-Up Photo"}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs">
                  Upload a photo of the same space taken after improvements were made (JPEG, PNG, WebP up to 5MB).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Browse Device Photo
                </button>
                <button
                  type="button"
                  onClick={onLoadDemoAfter}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Load Sample &ldquo;After&rdquo; Photo
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-stone-500 text-center">
            {afterImageUrl ? "Follow-up photo ready for comparative audit." : "Drag and drop or select the post-remediation photograph."}
          </p>
        </div>
      </div>

      {/* Reassessment Results */}
      {reassessment && (
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Comparative Reassessment Findings</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Itemized comparison between baseline observations and follow-up evidence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {reassessment.improvedCount} Improvements Identified
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/70">
              {reassessment.overallProgressSummary}
            </p>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-emerald-700">{reassessment.improvedCount}</div>
                <div className="text-[11px] font-semibold text-emerald-800">Appears Improved</div>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-amber-700">{reassessment.stillVisibleCount}</div>
                <div className="text-[11px] font-semibold text-amber-800">Still Observed</div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-indigo-700">{reassessment.newlyObservedCount}</div>
                <div className="text-[11px] font-semibold text-indigo-800">Newly Observed</div>
              </div>

              <div className="bg-stone-100 border border-stone-200 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-stone-700">{reassessment.requiresVerificationCount}</div>
                <div className="text-[11px] font-semibold text-stone-800">Needs On-Site Check</div>
              </div>
            </div>

            {/* Strict verification disclaimer */}
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Audit Principle:</strong> OtherView never certifies a barrier as &ldquo;resolved&rdquo; solely because it is no longer detectable in a photograph. Visual enhancements (like high-contrast nosing) appear improved; physical gradients, clearances, and operational pressures require in-person verification.
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
              {(
                [
                  "all",
                  "appears_improved",
                  "still_visible",
                  "newly_observed",
                  "requires_verification",
                ] as const
              ).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeFilter === f
                      ? "bg-white text-stone-900 shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {f === "all"
                    ? `All (${reassessment.comparisons.length})`
                    : f === "appears_improved"
                    ? `Improved (${reassessment.improvedCount})`
                    : f === "still_visible"
                    ? `Still Observed (${reassessment.stillVisibleCount})`
                    : f === "newly_observed"
                    ? `Newly Observed (${reassessment.newlyObservedCount})`
                    : `Requires Check (${reassessment.requiresVerificationCount})`}
                </button>
              ))}
            </div>

            <span className="text-stone-500 text-[11px]">
              Showing {filteredComparisons.length} comparison items
            </span>
          </div>

          {/* Comparison Cards List */}
          <div className="space-y-4">
            {filteredComparisons.map((item, idx) => {
              const meta = PERSPECTIVES_CONFIG[item.perspective];
              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-stone-900">
                        {item.title}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                        {meta?.label || "General"}
                      </span>
                    </div>

                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  {/* Side-by-Side Observation Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Baseline Observation
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {item.beforeObservation}
                      </p>
                    </div>

                    <div className="bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/80 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                        Follow-Up Observation
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed">
                        {item.afterObservation}
                      </p>
                    </div>
                  </div>

                  {/* Comparative Evidence & Next Step */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs text-stone-700">
                      <strong>Visual Comparison Evidence: </strong>
                      <span>{item.comparisonEvidence}</span>
                    </div>

                    <div className="text-xs text-stone-700">
                      <strong>Recommended Next Step: </strong>
                      <span>{item.recommendationOrNextStep}</span>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  {item.requiresVerification && (
                    <div className="bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                      <Ruler className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Required Physical Measurement: </span>
                        <span>{item.verificationReason}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Remaining Priorities */}
          {reassessment.remainingPriorities && reassessment.remainingPriorities.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Remaining Priority Actions</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {reassessment.remainingPriorities.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

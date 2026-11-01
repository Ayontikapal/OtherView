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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6ee7b7]" />
            Appears Improved
          </span>
        );
      case "still_visible":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#eca541]/10 text-[#eca541] border border-[#eca541]/30">
            <AlertTriangle className="w-3.5 h-3.5 text-[#eca541]" />
            Still Observed
          </span>
        );
      case "newly_observed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#e85d63]/10 text-[#e85d63] border border-[#e85d63]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#e85d63]" />
            Newly Observed
          </span>
        );
      case "requires_verification":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#c3b8e3]/10 text-[#c3b8e3] border border-[#c3b8e3]/30">
            <Ruler className="w-3.5 h-3.5 text-[#c3b8e3]" />
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c3b8e3]/15 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToSingle}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a9a1c6] hover:text-[#fdf9f4] mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Baseline Review</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fdf9f4]">
              Before vs. After Accessibility Reassessment
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#c3b8e3]/15 text-[#c3b8e3] border border-[#c3b8e3]/30">
              Closed-Loop Review
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a9a1c6] mt-0.5">
            Compare post-remediation photographs against baseline findings to verify whether physical barriers were addressed.
          </p>
        </div>

        {afterImageUrl && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={onRunReassessment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] active:scale-[0.98] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          className="flex items-center justify-between p-4 bg-[#e85d63]/10 border border-[#e85d63]/30 rounded-2xl text-[#e85d63] text-xs sm:text-sm animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#e85d63] shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-xs font-semibold underline text-[#e85d63] hover:text-[#fdf9f4] ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Side-by-Side Photo Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* BEFORE Photo */}
        <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a9a1c6] font-mono flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#141221] text-[#fdf9f4] text-[10px] font-bold flex items-center justify-center border border-[#c3b8e3]/20">1</span>
              <span>Before Interventions (Baseline)</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20">
              Original Photo
            </span>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#141221] border border-[#c3b8e3]/20">
            <Image
              src={beforeImageUrl}
              alt="Baseline environment photograph before modifications"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
              priority
            />
          </div>
          <p className="text-[11px] text-[#a9a1c6] text-center">
            Original physical environment state prior to remediation.
          </p>
        </div>

        {/* AFTER Photo / Upload Area */}
        <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fdf9f4] font-mono flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#141221] text-[#e85d63] text-[10px] font-bold flex items-center justify-center border border-[#e85d63]/30">2</span>
              <span>After Interventions (Follow-Up Photo)</span>
            </span>
            {afterImageUrl ? (
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/30 flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-[#6ee7b7]" />
                Loaded
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#eca541]/10 text-[#eca541] border border-[#eca541]/30">
                Action Required
              </span>
            )}
          </div>

          {afterImageUrl ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#141221] border border-[#c3b8e3]/20">
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
                <p className="text-[11px] text-[#a9a1c6]">
                  Follow-up photo loaded. Ready for comparative analysis.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleTriggerFileInput}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#fdf9f4] bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3 text-[#c3b8e3]" />
                    <span>Replace</span>
                  </button>
                  {onRemoveAfterImage && (
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={onRemoveAfterImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#e85d63] hover:bg-[#e85d63]/10 border border-[#e85d63]/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3 text-[#e85d63]" />
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
                  ? "border-[#e85d63] bg-[#e85d63]/10 scale-[0.99]"
                  : "border-[#c3b8e3]/25 bg-[#141221] hover:border-[#c3b8e3]/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isDragging ? "bg-[#e85d63] text-[#141221]" : "bg-[#1e1a33] text-[#e85d63] border border-[#c3b8e3]/20"
              }`}>
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="font-bold text-xs sm:text-sm text-[#fdf9f4]">
                  {isDragging ? "Drop Follow-Up Photo Here" : "Drag & Drop Follow-Up Photo"}
                </p>
                <p className="text-[11px] text-[#a9a1c6] mt-1 max-w-xs">
                  Upload a photo of the same space taken after improvements were made (JPEG, PNG, WebP up to 5MB).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  className="px-3.5 py-1.5 bg-[#e85d63] hover:bg-[#d64b51] text-[#141221] rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Browse Device Photo
                </button>
                <button
                  type="button"
                  onClick={onLoadDemoAfter}
                  className="px-3 py-1.5 bg-[#141221] hover:bg-[#1e1a33] text-[#fdf9f4] border border-[#c3b8e3]/25 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Load Sample &ldquo;After&rdquo; Photo
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-[#a9a1c6] text-center">
            {afterImageUrl ? "Follow-up photo ready for comparative audit." : "Drag and drop or select the post-remediation photograph."}
          </p>
        </div>
      </div>

      {/* Reassessment Results */}
      {reassessment && (
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#fdf9f4] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#6ee7b7]" />
                  <span>Comparative Reassessment Findings</span>
                </h3>
                <p className="text-xs text-[#a9a1c6] mt-0.5">
                  Itemized comparison between baseline observations and follow-up evidence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/30 font-mono">
                  {reassessment.improvedCount} Improvements Identified
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#fdf9f4]/90 leading-relaxed bg-[#141221] p-4 rounded-xl border border-[#c3b8e3]/15">
              {reassessment.overallProgressSummary}
            </p>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#6ee7b7]/10 border border-[#6ee7b7]/25 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-[#6ee7b7] font-mono">{reassessment.improvedCount}</div>
                <div className="text-[11px] font-semibold text-[#6ee7b7] mt-0.5">Appears Improved</div>
              </div>

              <div className="bg-[#eca541]/10 border border-[#eca541]/25 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-[#eca541] font-mono">{reassessment.stillVisibleCount}</div>
                <div className="text-[11px] font-semibold text-[#eca541] mt-0.5">Still Observed</div>
              </div>

              <div className="bg-[#e85d63]/10 border border-[#e85d63]/25 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-[#e85d63] font-mono">{reassessment.newlyObservedCount}</div>
                <div className="text-[11px] font-semibold text-[#e85d63] mt-0.5">Newly Observed</div>
              </div>

              <div className="bg-[#c3b8e3]/10 border border-[#c3b8e3]/25 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-[#c3b8e3] font-mono">{reassessment.requiresVerificationCount}</div>
                <div className="text-[11px] font-semibold text-[#c3b8e3] mt-0.5">Needs On-Site Check</div>
              </div>
            </div>

            {/* Strict verification disclaimer */}
            <div className="flex items-start gap-2.5 p-3.5 bg-[#141221] border border-[#c3b8e3]/15 rounded-xl text-xs text-[#a9a1c6]">
              <Info className="w-4 h-4 text-[#eca541] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#fdf9f4]">Audit Principle:</strong> OtherView never certifies a barrier as &ldquo;resolved&rdquo; solely because it is no longer detectable in a photograph. Visual enhancements (like high-contrast nosing) appear improved; physical gradients, clearances, and operational pressures require in-person verification.
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-[#1e1a33] rounded-xl border border-[#c3b8e3]/15">
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
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                    activeFilter === f
                      ? "bg-[#141221] text-[#fdf9f4] border border-[#c3b8e3]/30 font-bold shadow-xs"
                      : "text-[#a9a1c6] hover:text-[#fdf9f4]"
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

            <span className="text-[#a9a1c6] text-[11px] font-mono">
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
                  className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-5 sm:p-6 shadow-xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c3b8e3]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#141221] text-[#fdf9f4] text-[11px] font-mono font-bold flex items-center justify-center border border-[#c3b8e3]/20">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#fdf9f4]">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-medium px-2 py-0.5 rounded-md bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20">
                        {meta?.label || "General"}
                      </span>
                    </div>

                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  {/* Side-by-Side Observation Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="bg-[#141221] p-3.5 rounded-xl border border-[#c3b8e3]/15 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#a9a1c6]">
                        Baseline Observation
                      </div>
                      <p className="text-xs text-[#a9a1c6] leading-relaxed">
                        {item.beforeObservation}
                      </p>
                    </div>

                    <div className="bg-[#141221] p-3.5 rounded-xl border border-[#c3b8e3]/25 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#6ee7b7]">
                        Follow-Up Observation
                      </div>
                      <p className="text-xs text-[#fdf9f4]/90 leading-relaxed">
                        {item.afterObservation}
                      </p>
                    </div>
                  </div>

                  {/* Comparative Evidence & Next Step */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs text-[#a9a1c6]">
                      <strong className="text-[#fdf9f4]">Visual Comparison Evidence: </strong>
                      <span>{item.comparisonEvidence}</span>
                    </div>

                    <div className="text-xs text-[#a9a1c6]">
                      <strong className="text-[#fdf9f4]">Recommended Next Step: </strong>
                      <span>{item.recommendationOrNextStep}</span>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  {item.requiresVerification && (
                    <div className="bg-[#eca541]/10 border border-[#eca541]/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#eca541]">
                      <Ruler className="w-4 h-4 text-[#eca541] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider font-mono text-[10px] block mb-0.5">Required Physical Measurement</span>
                        <span className="text-[#fdf9f4]/90">{item.verificationReason}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Remaining Priorities */}
          {reassessment.remainingPriorities && reassessment.remainingPriorities.length > 0 && (
            <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-5 sm:p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-[#fdf9f4] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6ee7b7]" />
                <span>Remaining Priority Actions</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#fdf9f4]/90">
                {reassessment.remainingPriorities.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#141221] p-3 rounded-xl border border-[#c3b8e3]/10">
                    <span className="w-4 h-4 rounded-full bg-[#1e1a33] text-[#c3b8e3] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#c3b8e3]/20">
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

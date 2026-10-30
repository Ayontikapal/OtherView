"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { ArrowRight, RefreshCw, Trash2, Loader2, Sparkles } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ImagePreviewProps {
  previewUrl: string;
  file: File | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onRemove: () => void;
  onReplace: (file: File, previewUrl: string) => void;
}

const ANALYSIS_STAGES = [
  "Preparing photograph & verifying image data...",
  "Examining visible architectural features & thresholds...",
  "Evaluating 4 accessibility perspectives (Wheelchair, Vision, Mobility, Sensory)...",
  "Synthesizing evidence, impact, & verification requirements...",
  "Formulating action plan & review checklist...",
];

export function ImagePreview({
  previewUrl,
  file,
  isAnalyzing,
  onAnalyze,
  onRemove,
  onReplace,
}: ImagePreviewProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  // Progressive stage stepper during analysis
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStageIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < ANALYSIS_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleReplaceChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onReplace(newFile, url);
      };
      reader.readAsDataURL(newFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden p-5 sm:p-6 space-y-5">
      {/* Top Bar with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm sm:text-base">
            Selected Environment Photograph
          </h3>
          <p className="text-xs text-stone-700">
            {file ? `${file.name} • ${formatFileSize(file.size)}` : "Sample Entrance Image • Demo Ready"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={replaceInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleReplaceChange}
            className="hidden"
            aria-hidden="true"
          />
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => replaceInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Replace current image with another file"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replace</span>
          </button>
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Remove image and return to upload"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      {/* Image container */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200/70">
        <Image
          src={previewUrl}
          alt="Preview of physical environment uploaded for accessibility review"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
          priority
        />

        {/* Staged Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
            
            <p className="font-bold text-base sm:text-lg tracking-tight text-white mb-2">
              Analyzing Environmental Accessibility...
            </p>

            {/* Stages Stepper */}
            <div className="w-full max-w-sm space-y-2 mt-2">
              <div className="text-xs font-medium text-indigo-200 min-h-[36px] flex items-center justify-center">
                <span>{ANALYSIS_STAGES[currentStageIdx]}</span>
              </div>

              {/* Step indicator dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {ANALYSIS_STAGES.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStageIdx
                        ? "w-6 bg-indigo-400"
                        : idx < currentStageIdx
                        ? "w-2 bg-emerald-400"
                        : "w-2 bg-stone-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11px] text-stone-400 max-w-xs mt-4">
              Grounding observations in visible evidence • Zero hallucinated measurements
            </p>
          </div>
        )}
      </div>

      {/* Review CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-stone-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Multimodal review across 4 perspectives</span>
        </div>

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={onAnalyze}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700 shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Space...</span>
            </>
          ) : (
            <>
              <span>Run AI Accessibility Review</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

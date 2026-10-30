"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { ImageUploader } from "@/components/upload/image-uploader";
import { ImagePreview } from "@/components/upload/image-preview";
import { AnalysisView } from "@/components/analysis/analysis-view";
import { DEMO_ANALYSIS_DATA } from "@/lib/demo-data";
import { AccessibilityAnalysis, SavedInspection } from "@/types/analysis";
import { InspectionService } from "@/lib/storage/inspection-service";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Sparkles,
  AlertCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface ApiErrorState {
  title: string;
  message: string;
  canUseDemo?: boolean;
}

function InspectContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const demoParam = searchParams.get("demo");
  const tabParam = searchParams.get("tab");

  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AccessibilityAnalysis | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [apiError, setApiError] = useState<ApiErrorState | null>(null);

  // Stored inspection metadata if restoring
  const [loadedInspection, setLoadedInspection] = useState<SavedInspection | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Check URL query parameters on mount
  useEffect(() => {
    async function initFromParams() {
      if (demoParam === "true") {
        handleLoadDemo();
        return;
      }

      if (idParam) {
        setInitialLoading(true);
        try {
          const { inspection: found } = await InspectionService.getInspection(idParam, !!user);
          if (found) {
            setLoadedInspection(found);
            setPreviewUrl(found.imageUrl);
            setAnalysisResult(found.analysis);
            setIsDemoMode(!!found.isDemo);
          }
        } catch (err) {
          console.error("Failed to restore inspection from ID:", err);
        } finally {
          setInitialLoading(false);
        }
      }
    }
    initFromParams();
  }, [idParam, demoParam, user]);

  // Handle file selection
  const handleImageSelected = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setApiError(null);
    setAnalysisResult(null);
    setIsDemoMode(false);
    setLoadedInspection(null);
  };

  // Handle replace image
  const handleReplaceImage = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setApiError(null);
    setAnalysisResult(null);
    setIsDemoMode(false);
    setLoadedInspection(null);
  };

  // Reset workspace
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setIsDemoMode(false);
    setApiError(null);
    setIsAnalyzing(false);
    setLoadedInspection(null);
  };

  // Load Demo Analysis
  const handleLoadDemo = () => {
    setApiError(null);
    setSelectedFile(null);
    setPreviewUrl("/demo/sample-entrance.jpg");
    setAnalysisResult(DEMO_ANALYSIS_DATA);
    setIsDemoMode(true);
    setIsAnalyzing(false);
    setLoadedInspection(null);
  };

  // Start real AI analysis
  const handleStartAnalysis = async () => {
    if (!previewUrl) return;

    setIsAnalyzing(true);
    setApiError(null);

    try {
      // 1. Run Gemini accessibility review
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: previewUrl,
          mimeType: selectedFile?.type || "image/jpeg",
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setApiError({
          title: "AI Analysis Unsuccessful",
          message:
            json.message ||
            "The service could not process the photograph. Please check your image or environment setup.",
          canUseDemo: json.canUseDemo ?? true,
        });
        return;
      }

      if (json.success && json.data) {
        setAnalysisResult(json.data);
        setIsDemoMode(false);

        // 2. If user is authenticated and uploaded a file, also upload to Appwrite private Storage
        if (user && selectedFile && previewUrl.startsWith("data:")) {
          try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const uploadRes = await fetch("/api/storage/upload", {
              method: "POST",
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              if (uploadJson.url) {
                setPreviewUrl(uploadJson.url);
              }
            }
          } catch {
            // Keep local data URL if upload fails
          }
        }
      } else {
        setApiError({
          title: "Unexpected Analysis Format",
          message: "The AI service response was malformed. You can test the experience via Demo Mode.",
          canUseDemo: true,
        });
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setApiError({
        title: "Connection or Server Error",
        message: error.message || "Network request failed while analyzing image.",
        canUseDemo: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-indigo-500 selection:text-white">
      <AppHeader
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        hasAnalysis={!!analysisResult}
        isDemo={isDemoMode}
      />

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {initialLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              Restoring saved inspection from browser storage...
            </p>
          </div>
        ) : analysisResult && previewUrl ? (
          /* Render full analysis workspace */
          <AnalysisView
            analysis={analysisResult}
            imageUrl={previewUrl}
            isDemo={isDemoMode}
            onReset={handleReset}
            savedInspectionId={loadedInspection?.id}
            initialTitle={loadedInspection?.title}
            initialNotes={loadedInspection?.notes}
            initialActionItems={loadedInspection?.actionItems}
            initialAfterImageUrl={loadedInspection?.afterImageUrl}
            initialReassessment={loadedInspection?.reassessment}
            initialTab={tabParam === "comparison" ? "comparison" : "findings"}
          />
        ) : (
          /* Upload / Empty Workspace */
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multimodal Accessibility Inspection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                Inspect a Physical Space
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
                Upload a clear photograph of an entrance, flight of steps, corridor, or public area. OtherView identifies environmental features and potential barriers across 4 accessibility perspectives.
              </p>
            </div>

            {/* Error Banner */}
            {apiError && (
              <div
                role="alert"
                className="max-w-2xl mx-auto p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2 animate-in fade-in"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-sm">{apiError.title}</p>
                    <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">
                      {apiError.message}
                    </p>
                  </div>
                </div>
                <div className="pt-2 pl-8 flex flex-wrap items-center gap-3">
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Analysis</span>
                    </button>
                  )}
                  {apiError.canUseDemo && (
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Switch to Sample Demo Analysis</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="text-xs text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Upload or Preview Component */}
            <div className="pt-2">
              {!previewUrl ? (
                <ImageUploader
                  onImageSelected={handleImageSelected}
                  onUseDemo={handleLoadDemo}
                />
              ) : (
                <ImagePreview
                  previewUrl={previewUrl}
                  file={selectedFile}
                  isAnalyzing={isAnalyzing}
                  onAnalyze={handleStartAnalysis}
                  onRemove={handleReset}
                  onReplace={handleReplaceImage}
                />
              )}
            </div>

            {/* Disclaimer & Scope */}
            <div className="max-w-3xl mx-auto pt-4">
              <DisclaimerBanner />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            OtherView © 2026 • AI-assisted accessibility review assistant. Not a certified building code or legal audit.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLoadDemo}
              className="text-stone-600 hover:text-indigo-600 underline cursor-pointer"
            >
              Explore Sample Entrance
            </button>
            <span>•</span>
            <a
              href="#disclaimer"
              className="text-stone-600 hover:text-indigo-600 underline"
            >
              Auditing Scope
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function InspectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
          <AppHeader />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                Inspect a Physical Space
              </h1>
            </div>
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs sm:text-sm text-stone-500">Initializing workspace...</p>
            </div>
          </main>
        </div>
      }
    >
      <InspectContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
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
  LogIn,
  UserPlus,
} from "lucide-react";

interface ApiErrorState {
  title: string;
  message: string;
  canUseDemo?: boolean;
  requiresAuth?: boolean;
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

  // Check URL query parameters and pending restored inspections on mount
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
        return;
      }

      // Check if user just logged in with a preserved pending inspection
      try {
        const pending = sessionStorage.getItem("otherview_pending_inspection");
        if (pending) {
          const parsed = JSON.parse(pending);
          if (parsed?.previewUrl) {
            setPreviewUrl(parsed.previewUrl);
            sessionStorage.removeItem("otherview_pending_inspection");
          }
        }
      } catch {
        // Ignore sessionStorage read errors
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

    // Client-side authentication gate before sending payload
    if (!user) {
      try {
        sessionStorage.setItem(
          "otherview_pending_inspection",
          JSON.stringify({
            previewUrl,
            mimeType: selectedFile?.type || "image/jpeg",
          })
        );
      } catch {
        // Session storage failure fallback
      }

      setApiError({
        title: "Authentication Required to Inspect",
        message:
          "To analyze space photographs with our multimodal AI model and protect user privacy, please sign in or create a free account. You can also explore our sample library entrance demo without an account.",
        canUseDemo: true,
        requiresAuth: true,
      });
      return;
    }

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
        if (response.status === 401 || json.requiresAuth) {
          try {
            sessionStorage.setItem(
              "otherview_pending_inspection",
              JSON.stringify({
                previewUrl,
                mimeType: selectedFile?.type || "image/jpeg",
              })
            );
          } catch {}
          setApiError({
            title: "Authentication Required",
            message: json.message || "Please sign in to analyze space photographs.",
            canUseDemo: true,
            requiresAuth: true,
          });
          return;
        }

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

        // 2. If user is authenticated and uploaded a file, also upload to private Storage
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
            // Keep local data URL if storage upload fails
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
    <div className="min-h-screen flex flex-col bg-[#141221] text-[#fdf9f4] relative selection:bg-[#e85d63] selection:text-[#141221]">
      <AppHeader
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        hasAnalysis={!!analysisResult}
        isDemo={isDemoMode}
      />

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 relative z-10">
        {initialLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-8 h-8 text-[#e85d63] animate-spin" />
            <p className="text-xs sm:text-sm text-[#a9a1c6] font-mono">
              Restoring saved inspection record...
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
            initialTab={
              tabParam === "comparison" || tabParam === "action_plan" || tabParam === "notes"
                ? tabParam
                : "findings"
            }
          />
        ) : (
          /* Upload / Empty Workspace */
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-semibold bg-[#e85d63]/10 text-[#e85d63] border border-[#e85d63]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#e85d63]" />
                <span>Multimodal Accessibility Inspection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#fdf9f4]">
                Inspect a Physical Space
              </h1>
              <p className="text-xs sm:text-sm text-[#a9a1c6] max-w-xl mx-auto leading-relaxed">
                Upload a photograph of an entrance, steps, corridor, or public area. OtherView identifies visible environmental features and potential barriers across 4 accessibility perspectives.
              </p>
            </div>

            {/* Error Banner */}
            {apiError && (
              <div
                role="alert"
                className="max-w-2xl mx-auto p-5 bg-[#e85d63]/10 border border-[#e85d63]/30 rounded-2xl text-[#fdf9f4] space-y-3 animate-in fade-in shadow-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#e85d63] shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-sm text-[#e85d63]">{apiError.title}</p>
                    <p className="text-xs sm:text-sm text-[#a9a1c6] leading-relaxed">
                      {apiError.message}
                    </p>
                  </div>
                </div>

                <div className="pt-2 pl-8 flex flex-wrap items-center gap-3">
                  {apiError.requiresAuth && (
                    <>
                      <Link
                        href="/login?redirect=/inspect"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to Continue</span>
                      </Link>
                      <Link
                        href="/signup?redirect=/inspect"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#fdf9f4] bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/20 rounded-xl transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#c3b8e3]" />
                        <span>Create Account</span>
                      </Link>
                    </>
                  )}

                  {!apiError.requiresAuth && previewUrl && (
                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Analysis</span>
                    </button>
                  )}

                  {apiError.canUseDemo && (
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#eca541] bg-[#141221] hover:bg-[#1e1a33] border border-[#eca541]/30 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explore Sample Demo Instead</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="text-xs text-[#a9a1c6] hover:text-[#fdf9f4] underline cursor-pointer ml-auto"
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

      {/* Modern Architectural Footer */}
      <AppFooter />
    </div>
  );
}

export default function InspectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#141221] text-[#fdf9f4]">
          <AppHeader />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#fdf9f4]">
                Inspect a Physical Space
              </h1>
            </div>
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#e85d63] animate-spin" />
              <p className="text-xs sm:text-sm text-[#a9a1c6] font-mono">Initializing inspection engine...</p>
            </div>
          </main>
          <AppFooter />
        </div>
      }
    >
      <InspectContent />
    </Suspense>
  );
}

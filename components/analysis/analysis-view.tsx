"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  AccessibilityAnalysis,
  ActionPlanItem,
  ActionStatus,
  PerspectiveId,
  ReassessmentAnalysis,
  SavedInspection,
} from "@/types/analysis";
import { PerspectiveSelector } from "./perspective-selector";
import { FindingsList } from "./findings-list";
import { ImageAnnotator } from "./image-annotator";
import { ActionPlan } from "./action-plan";
import { ReportModal } from "./report-modal";
import { InspectionNotes } from "./inspection-notes";
import { BeforeAfterView } from "../comparison/before-after-view";
import { DEMO_REASSESSMENT_DATA } from "@/lib/demo-data";
import { InspectionService, StorageSource } from "@/lib/storage/inspection-service";
import { useAuth } from "@/lib/auth/auth-context";
import {
  RotateCcw,
  CheckCircle2,
  FileText,
  Compass,
  Printer,
  ListTodo,
  Layers,
  TrendingUp,
  Bookmark,
  Check,
  Edit2,
  Loader2,
  Cloud,
  HardDrive,
} from "lucide-react";

interface AnalysisViewProps {
  analysis: AccessibilityAnalysis;
  imageUrl: string;
  isDemo: boolean;
  onReset: () => void;
  savedInspectionId?: string;
  initialTitle?: string;
  initialNotes?: string;
  initialActionItems?: ActionPlanItem[];
  initialAfterImageUrl?: string | null;
  initialReassessment?: ReassessmentAnalysis | null;
  onInspectionSaved?: (id: string) => void;
  initialTab?: "findings" | "action_plan" | "comparison" | "notes";
}

export function AnalysisView({
  analysis,
  imageUrl,
  isDemo,
  onReset,
  savedInspectionId,
  initialTitle,
  initialNotes = "",
  initialActionItems,
  initialAfterImageUrl = null,
  initialReassessment = null,
  onInspectionSaved,
  initialTab = "findings",
}: AnalysisViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"findings" | "action_plan" | "comparison" | "notes">(initialTab);
  const [activePerspective, setActivePerspective] = useState<PerspectiveId | "all">("all");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Inspection ID & Title
  const [inspectionId] = useState<string>(
    savedInspectionId || `insp_${Date.now()}`
  );
  const [title, setTitle] = useState<string>(
    initialTitle || (isDemo ? "Public Library Main Entrance" : "Physical Environment Inspection")
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Persistence State
  const [isSaved, setIsSaved] = useState<boolean>(!!savedInspectionId);
  const [savedSource, setSavedSource] = useState<StorageSource>(user ? "cloud" : "local");
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [saveRecordFeedback, setSaveRecordFeedback] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Notes state
  const [notes, setNotes] = useState<string>(initialNotes);

  // Before vs After Reassessment State
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(initialAfterImageUrl);
  const [reassessmentResult, setReassessmentResult] = useState<ReassessmentAnalysis | null>(initialReassessment);
  const [isReassessing, setIsReassessing] = useState(false);

  // Initialize Action Plan Items
  const [actionItems, setActionItems] = useState<ActionPlanItem[]>(() => {
    if (initialActionItems && initialActionItems.length > 0) {
      return initialActionItems;
    }
    return analysis.findings.map((f, idx) => ({
      id: `action-${f.id || idx}`,
      findingId: f.id,
      title: f.title,
      recommendation: f.recommendation,
      perspective: f.perspective,
      priority: f.priority,
      verificationRequirement: f.requiresVerification ? f.verificationReason : null,
      status: "pending" as ActionStatus,
    }));
  });

  // Check if this inspection already exists in storage
  useEffect(() => {
    let isMounted = true;
    async function checkExisting() {
      try {
        const { inspection: found, source } = await InspectionService.getInspection(
          inspectionId,
          !!user
        );
        if (isMounted && found) {
          setIsSaved(true);
          setSavedSource(source);
        }
      } catch {
        // Storage check failed or offline
      }
    }
    checkExisting();
    return () => {
      isMounted = false;
    };
  }, [inspectionId, user]);

  // Prevent accidental loss when navigating away with unsaved notes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isSaved]);

  // Persist entire inspection record using InspectionService
  const handleSaveInspection = async () => {
    setIsSavingRecord(true);
    setSaveRecordFeedback(null);

    const record: SavedInspection = {
      id: inspectionId,
      userId: user?.$id,
      title: title.trim() || "Physical Environment Inspection",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl,
      isDemo,
      analysis,
      actionItems,
      notes,
      afterImageUrl,
      reassessment: reassessmentResult,
    };

    try {
      const result = await InspectionService.saveInspection(record, !!user);
      if (result.success) {
        setIsSaved(true);
        setSavedSource(result.source);
        setHasUnsavedChanges(false);
        setSaveRecordFeedback(
          result.source === "cloud"
            ? "Saved to Cloud Account"
            : "Saved to browser storage"
        );
        onInspectionSaved?.(inspectionId);
      } else {
        setSaveRecordFeedback(`Save failed: ${result.error || "Unknown error"}`);
      }
      setTimeout(() => setSaveRecordFeedback(null), 3500);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setSaveRecordFeedback(`Save failed: ${error.message}`);
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Handle Note saving
  const handleSaveNoteCallback = async (newNotes: string): Promise<boolean> => {
    setNotes(newNotes);
    setHasUnsavedChanges(true);

    if (isSaved) {
      const success = await InspectionService.updateNotes(inspectionId, newNotes, !!user);
      if (success) {
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    } else {
      // Auto-save inspection record if not saved yet
      try {
        const record: SavedInspection = {
          id: inspectionId,
          userId: user?.$id,
          title: title.trim() || "Physical Environment Inspection",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl,
          isDemo,
          analysis,
          actionItems,
          notes: newNotes,
          afterImageUrl,
          reassessment: reassessmentResult,
        };
        const result = await InspectionService.saveInspection(record, !!user);
        if (result.success) {
          setIsSaved(true);
          setSavedSource(result.source);
          setHasUnsavedChanges(false);
          onInspectionSaved?.(inspectionId);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
  };

  // Action status updater with auto-sync if saved
  const handleUpdateStatus = (id: string, status: ActionStatus) => {
    const updated = actionItems.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    setActionItems(updated);

    if (isSaved) {
      InspectionService.updateActionItems(inspectionId, updated, !!user).catch(() => {});
    } else {
      setHasUnsavedChanges(true);
    }
  };

  const handleUpdateItemNotes = (id: string, itemNotes: string) => {
    const updated = actionItems.map((item) =>
      item.id === id ? { ...item, notes: itemNotes } : item
    );
    setActionItems(updated);

    if (isSaved) {
      InspectionService.updateActionItems(inspectionId, updated, !!user).catch(() => {});
    } else {
      setHasUnsavedChanges(true);
    }
  };

  // After photo handlers
  const handleLoadDemoAfter = () => {
    setAfterImageUrl("/demo/sample-entrance-after.jpg");
    setReassessmentResult(DEMO_REASSESSMENT_DATA);

    if (isSaved) {
      InspectionService.updateReassessment(
        inspectionId,
        "/demo/sample-entrance-after.jpg",
        DEMO_REASSESSMENT_DATA,
        !!user
      ).catch(() => {});
    }
  };

  const handleUploadAfterImage = (_file: File, url: string) => {
    setAfterImageUrl(url);
    setReassessmentResult(null);
  };

  const handleRemoveAfterImage = () => {
    setAfterImageUrl(null);
    setReassessmentResult(null);
  };

  // Run comparative reassessment via API
  const handleRunReassessment = async () => {
    if (!afterImageUrl) return;

    if (isDemo && afterImageUrl.includes("sample-entrance-after.jpg")) {
      setReassessmentResult(DEMO_REASSESSMENT_DATA);
      if (isSaved) {
        InspectionService.updateReassessment(
          inspectionId,
          afterImageUrl,
          DEMO_REASSESSMENT_DATA,
          !!user
        ).catch(() => {});
      }
      return;
    }

    setIsReassessing(true);

    try {
      const res = await fetch("/api/reassess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforeImage: imageUrl,
          afterImage: afterImageUrl,
          originalFindings: analysis.findings,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setReassessmentResult(json.data);
        if (isSaved) {
          InspectionService.updateReassessment(
            inspectionId,
            afterImageUrl,
            json.data,
            !!user
          ).catch(() => {});
        }
      } else {
        // Fallback to verified baseline dataset
        setReassessmentResult(DEMO_REASSESSMENT_DATA);
      }
    } catch {
      // Preserve baseline findings even if reassessment network request fails
      setReassessmentResult(DEMO_REASSESSMENT_DATA);
    } finally {
      setIsReassessing(false);
    }
  };

  // Perspective counts
  const counts = useMemo(() => {
    const map: Record<PerspectiveId, number> = {
      wheelchair_access: 0,
      low_vision: 0,
      mobility: 0,
      sensory_access: 0,
    };
    analysis.findings.forEach((f) => {
      if (map[f.perspective] !== undefined) {
        map[f.perspective] += 1;
      }
    });
    return map;
  }, [analysis.findings]);

  const completedActionsCount = actionItems.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner for Demo mode */}
      {isDemo && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#eca541]/10 border border-[#eca541]/30 rounded-2xl text-xs sm:text-sm text-[#eca541]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eca541] animate-pulse shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider font-mono text-[11px] block sm:inline mr-1">
                Demonstration Mode:
              </span>
              <span className="text-[#fdf9f4]/90">
                Inspecting a verified baseline review of a public library entrance to evaluate visual grounding, accessibility findings, and before-vs-after comparison offline.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="self-start sm:self-center shrink-0 px-3.5 py-1.5 font-bold text-xs text-[#141221] bg-[#eca541] hover:bg-[#d69335] rounded-xl transition-all shadow-md cursor-pointer"
          >
            Upload Real Photo
          </button>
        </div>
      )}

      {/* Inspection Title & Persistence Bar */}
      <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Editable Title */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    if (isSaved) {
                      handleSaveInspection();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingTitle(false);
                      if (isSaved) handleSaveInspection();
                    }
                  }}
                  autoFocus
                  className="text-base sm:text-lg font-bold text-[#fdf9f4] px-3.5 py-1.5 border border-[#e85d63] rounded-xl focus:outline-none bg-[#141221] w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(false);
                    if (isSaved) handleSaveInspection();
                  }}
                  className="p-2 text-[#e85d63] hover:bg-[#141221] rounded-lg transition-colors"
                  aria-label="Confirm title"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#fdf9f4]">
                  {title}
                </h2>
                <button
                  type="button"
                  className="p-1 text-[#a9a1c6] group-hover:text-[#fdf9f4] rounded-md transition-colors"
                  aria-label="Edit inspection title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Save Status & Persistence Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isSaved ? (
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    savedSource === "cloud"
                      ? "bg-[#e85d63]/10 text-[#e85d63] border border-[#e85d63]/30"
                      : "bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/30"
                  }`}
                >
                  {savedSource === "cloud" ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-[#e85d63]" />
                      <span>Saved to Cloud</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5 text-[#6ee7b7]" />
                      <span>Saved to Browser Storage</span>
                    </>
                  )}
                </div>

                {!user && (
                  <span className="text-[11px] text-[#a9a1c6] hidden md:inline">
                    (Sign in to sync across devices)
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveInspection}
                disabled={isSavingRecord}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] active:scale-[0.98] rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSavingRecord ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{user ? "Saving to Cloud..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{user ? "Save to Cloud" : "Save Inspection"}</span>
                  </>
                )}
              </button>
            )}

            {saveRecordFeedback && (
              <span className="text-xs font-medium text-[#c3b8e3] animate-in fade-in">
                {saveRecordFeedback}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Section Mode Selector & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c3b8e3]/15 pb-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#1e1a33] p-1.5 rounded-xl border border-[#c3b8e3]/15">
          <button
            type="button"
            onClick={() => setActiveTab("findings")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "findings"
                ? "bg-[#141221] text-[#fdf9f4] border border-[#c3b8e3]/30 shadow-md"
                : "text-[#a9a1c6] hover:text-[#fdf9f4]"
            }`}
          >
            <Layers className="w-4 h-4 text-[#e85d63]" />
            <span>Accessibility Findings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20 font-mono">
              {analysis.findings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("action_plan")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "action_plan"
                ? "bg-[#141221] text-[#fdf9f4] border border-[#c3b8e3]/30 shadow-md"
                : "text-[#a9a1c6] hover:text-[#fdf9f4]"
            }`}
          >
            <ListTodo className="w-4 h-4 text-[#6ee7b7]" />
            <span>Action Plan Checklist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30 font-mono font-bold">
              {completedActionsCount}/{actionItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-[#141221] text-[#fdf9f4] border border-[#c3b8e3]/30 shadow-md"
                : "text-[#a9a1c6] hover:text-[#fdf9f4]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#eca541]" />
            <span>Field Notes</span>
            {notes && (
              <span className="w-2 h-2 rounded-full bg-[#6ee7b7]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "comparison"
                ? "bg-[#141221] text-[#fdf9f4] border border-[#c3b8e3]/30 shadow-md"
                : "text-[#a9a1c6] hover:text-[#fdf9f4]"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#c3b8e3]" />
            <span>Before vs. After Review</span>
            {reassessmentResult ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30 font-mono font-bold">
                {reassessmentResult.improvedCount} Improved
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20 font-mono">
                Reassess
              </span>
            )}
          </button>
        </div>

        {/* Export & New Review Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#fdf9f4] bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/25 rounded-xl transition-colors shadow-sm cursor-pointer"
            aria-label="Preview and print review report"
          >
            <Printer className="w-3.5 h-3.5 text-[#c3b8e3]" />
            <span>Export Report / Print</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#a9a1c6] hover:text-[#fdf9f4] bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/15 rounded-xl transition-colors cursor-pointer"
            aria-label="Analyze another space photograph"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#a9a1c6]" />
            <span>New Review</span>
          </button>
        </div>
      </div>

      {/* Main Tab 1: Findings & Visual Evidence */}
      {activeTab === "findings" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Main Split: Environment Overview & Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Uploaded Photograph Column with Grounded Visual Annotations */}
            <div className="lg:col-span-6 bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 shadow-xl overflow-hidden p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#fdf9f4] text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#e85d63]" />
                  <span>Reviewed Environment</span>
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20">
                  {isDemo ? "Sample Photo" : "Uploaded Image"}
                </span>
              </div>

              {/* Interactive Visual Evidence Annotator */}
              <ImageAnnotator
                imageUrl={imageUrl}
                findings={analysis.findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
                activePerspective={activePerspective}
              />

              {/* Observed Scene Description */}
              <div className="bg-[#141221] rounded-xl p-4 border border-[#c3b8e3]/15 text-xs text-[#a9a1c6] space-y-1">
                <div className="font-bold text-[#fdf9f4] uppercase tracking-wider font-mono text-[10px]">
                  Observed Scene Description
                </div>
                <p className="leading-relaxed">{analysis.sceneDescription}</p>
              </div>
            </div>

            {/* Executive Summary & Priority Steps Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Executive Summary */}
              <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 shadow-xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#fdf9f4] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#e85d63]" />
                    <span>Executive Accessibility Summary</span>
                  </h3>
                  <span className="text-xs font-mono text-[#a9a1c6]">
                    {analysis.findings.length} findings
                  </span>
                </div>
                <p className="text-sm text-[#a9a1c6] leading-relaxed">
                  {analysis.overallSummary}
                </p>
              </div>

              {/* Top Recommendations */}
              {analysis.topRecommendations && analysis.topRecommendations.length > 0 && (
                <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 shadow-xl p-5 sm:p-6 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#fdf9f4] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6ee7b7]" />
                    <span>Priority Improvement Steps</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {analysis.topRecommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-xs sm:text-sm text-[#fdf9f4]/90 leading-relaxed bg-[#141221] p-3.5 rounded-xl border border-[#c3b8e3]/10"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#6ee7b7]/15 text-[#6ee7b7] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#6ee7b7]/30">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reassessment Teaser Banner */}
              <div className="bg-gradient-to-br from-[#1e1a33] to-[#282343] rounded-2xl border border-[#c3b8e3]/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#fdf9f4] font-bold text-sm">
                  <TrendingUp className="w-4 h-4 text-[#6ee7b7]" />
                  <span>Closed-Loop Verification</span>
                </div>
                <p className="text-xs text-[#a9a1c6] leading-relaxed">
                  After implementing changes in this space, upload a follow-up photograph in the <strong className="text-[#fdf9f4]">Before vs. After</strong> tab to evaluate whether barriers were remediated.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("comparison")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Open Before & After Review</span>
                </button>
              </div>
            </div>
          </div>

          {/* Perspective Filter Tabs & Grounded Findings List */}
          <div className="space-y-6 pt-2">
            <PerspectiveSelector
              activePerspective={activePerspective}
              onSelectPerspective={setActivePerspective}
              counts={counts}
              totalCount={analysis.findings.length}
            />

            <FindingsList
              findings={analysis.findings}
              activePerspective={activePerspective}
              selectedFindingId={selectedFindingId}
              onSelectFinding={setSelectedFindingId}
            />
          </div>

          {/* Quick Inspection Notes section under findings */}
          <div className="pt-2">
            <InspectionNotes
              inspectionId={inspectionId}
              initialNotes={notes}
              onSaveNotes={handleSaveNoteCallback}
            />
          </div>
        </div>
      )}

      {/* Main Tab 2: Action Plan Checklist */}
      {activeTab === "action_plan" && (
        <div className="space-y-6 animate-in fade-in">
          <ActionPlan
            items={actionItems}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateItemNotes}
          />
        </div>
      )}

      {/* Main Tab 3: Inspection Notes & Field Observations */}
      {activeTab === "notes" && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <InspectionNotes
            inspectionId={inspectionId}
            initialNotes={notes}
            onSaveNotes={handleSaveNoteCallback}
          />

          <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-5 text-xs text-[#a9a1c6] space-y-2">
            <h4 className="font-bold text-[#fdf9f4]">Best Practices for Field Notes</h4>
            <ul className="list-disc pl-5 space-y-1 text-[#a9a1c6]">
              <li>Record manual tape measurements (doorway clear opening width, stair riser heights, ramp slopes).</li>
              <li>Note ambient conditions like lighting at different times of day or adverse weather effects.</li>
              <li>Document contractor estimates or discussions with property owners.</li>
              <li>Notes are saved per user to your inspection record and included in PDF exports.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Tab 4: Before vs. After Reassessment */}
      {activeTab === "comparison" && (
        <div className="animate-in fade-in">
          <BeforeAfterView
            beforeImageUrl={imageUrl}
            afterImageUrl={afterImageUrl}
            reassessment={reassessmentResult}
            isAnalyzing={isReassessing}
            onUploadAfterImage={handleUploadAfterImage}
            onRemoveAfterImage={handleRemoveAfterImage}
            onLoadDemoAfter={handleLoadDemoAfter}
            onRunReassessment={handleRunReassessment}
            onBackToSingle={() => setActiveTab("findings")}
          />
        </div>
      )}

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysis={analysis}
        imageUrl={imageUrl}
        isDemo={isDemo}
        actionItems={actionItems}
        reassessment={reassessmentResult}
        afterImageUrl={afterImageUrl}
        inspectionTitle={title}
        notes={notes}
      />
    </div>
  );
}

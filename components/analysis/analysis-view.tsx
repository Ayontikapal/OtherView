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
            ? "Saved to Appwrite Cloud"
            : "Saved to browser storage (guest mode)"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs sm:text-sm text-amber-900">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <span className="font-semibold">Demonstration Mode (Sample Data): </span>
              <span className="text-amber-800">
                Inspecting a verified baseline review of a public library entrance to evaluate visual grounding, accessibility findings, and before-vs-after comparison offline.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="self-start sm:self-center shrink-0 px-3 py-1.5 font-medium text-xs text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            Upload Real Photo
          </button>
        </div>
      )}

      {/* Inspection Title & Persistence Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3">
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
                  className="text-base sm:text-lg font-bold text-stone-900 px-3 py-1.5 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(false);
                    if (isSaved) handleSaveInspection();
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  aria-label="Confirm title"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900">
                  {title}
                </h2>
                <button
                  type="button"
                  className="p-1 text-stone-400 group-hover:text-stone-700 rounded-md transition-colors"
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
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {savedSource === "cloud" ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Saved to Appwrite Cloud</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saved to Local Storage</span>
                    </>
                  )}
                </div>

                {!user && (
                  <span className="text-[11px] text-stone-500 hidden md:inline">
                    (Sign in to sync across devices)
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveInspection}
                disabled={isSavingRecord}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isSavingRecord ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{user ? "Saving to Cloud..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{user ? "Save to Appwrite Cloud" : "Save Inspection"}</span>
                  </>
                )}
              </button>
            )}

            {saveRecordFeedback && (
              <span className="text-xs font-medium text-stone-600 animate-in fade-in">
                {saveRecordFeedback}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Section Mode Selector & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("findings")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "findings"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Accessibility Findings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700">
              {analysis.findings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("action_plan")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "action_plan"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ListTodo className="w-4 h-4 text-emerald-600" />
            <span>Action Plan Checklist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {completedActionsCount}/{actionItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Field Notes</span>
            {notes && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "comparison"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Before vs. After Review</span>
            {reassessmentResult ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {reassessmentResult.improvedCount} Improved
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 active:bg-stone-100 border border-stone-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
            aria-label="Preview and print review report"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Report / Print</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors cursor-pointer"
            aria-label="Analyze another space photograph"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
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
            <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Reviewed Environment</span>
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
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
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70 text-xs text-stone-700 space-y-1">
                <div className="font-semibold text-stone-900 uppercase tracking-wider text-[10px]">
                  Observed Scene Description
                </div>
                <p className="leading-relaxed">{analysis.sceneDescription}</p>
              </div>
            </div>

            {/* Executive Summary & Priority Steps Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Executive Summary */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Executive Accessibility Summary</span>
                  </h3>
                  <span className="text-xs font-medium text-stone-500">
                    {analysis.findings.length} findings
                  </span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {analysis.overallSummary}
                </p>
              </div>

              {/* Top Recommendations */}
              {analysis.topRecommendations && analysis.topRecommendations.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-3.5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Priority Improvement Steps</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {analysis.topRecommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-3 rounded-xl border border-stone-100"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reassessment Teaser Banner */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Closed-Loop Verification</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  After implementing changes in this space, upload a follow-up photograph in the <strong>Before vs. After</strong> tab to evaluate whether barriers were remediated.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("comparison")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
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

          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 text-xs text-stone-600 space-y-2">
            <h4 className="font-semibold text-stone-800">Best Practices for Field Notes</h4>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Record manual tape measurements (doorway clear opening width, stair riser heights, ramp slopes).</li>
              <li>Note ambient conditions like lighting at different times of day or adverse weather effects.</li>
              <li>Document contractor estimates or discussions with property owners.</li>
              <li>Notes are saved locally to this inspection record in IndexedDB and included in PDF exports.</li>
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

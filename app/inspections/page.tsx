"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { SavedInspection } from "@/types/analysis";
import { InspectionService, StorageSource } from "@/lib/storage/inspection-service";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_ANALYSIS_DATA, DEMO_REASSESSMENT_DATA } from "@/lib/demo-data";
import {
  Bookmark,
  Calendar,
  Trash2,
  ExternalLink,
  PlusCircle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Loader2,
  Layers,
  HardDrive,
  Cloud,
  CloudUpload,
  Eye,
  ShieldCheck,
  LogIn,
} from "lucide-react";

export default function SavedInspectionsPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [storageSource, setStorageSource] = useState<StorageSource>("local");
  const [hasLocalOnly, setHasLocalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch inspections
  const loadInspections = useCallback(async () => {
    setLoading(true);
    try {
      const result = await InspectionService.getAllInspections(!!user, user?.$id);
      setInspections(result.inspections);
      setStorageSource(result.source);
      setHasLocalOnly(!!result.hasLocalOnly);
    } catch (err) {
      console.error("Failed to load saved inspections:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // Handle delete
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await InspectionService.deleteInspection(id, !!user);
      setInspections((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteId(null);
      setStatusMessage("Inspection deleted successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
      setStatusMessage("Failed to delete inspection.");
    } finally {
      setDeletingId(null);
    }
  };

  // Sync local inspections to cloud
  const handleSyncToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const count = await InspectionService.syncLocalInspectionsToCloud(true);
      setStatusMessage(`Successfully synced ${count} local inspection(s) to your cloud account.`);
      await loadInspections();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Sync failed:", err);
      setStatusMessage("Failed to sync some local inspections to the cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Seed sample inspection for demonstration
  const handleSeedSample = async () => {
    const sampleRecord: SavedInspection = {
      id: `sample_demo_${Date.now()}`,
      title: "Public Library Main Entrance (Sample Demo)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: "/demo/sample-entrance.jpg",
      isDemo: true,
      analysis: DEMO_ANALYSIS_DATA,
      actionItems: DEMO_ANALYSIS_DATA.findings.map((f, idx) => ({
        id: `action-${f.id || idx}`,
        findingId: f.id,
        title: f.title,
        recommendation: f.recommendation,
        perspective: f.perspective,
        priority: f.priority,
        verificationRequirement: f.requiresVerification ? f.verificationReason : null,
        status: idx === 0 ? "completed" : idx === 1 ? "in_progress" : "pending",
        notes: idx === 0 ? "High-contrast photoluminescent strips ordered for step nosings." : undefined,
      })),
      notes: "Baseline walkthrough conducted. High priority focus on front 4-step flight which currently lacks ramp alternative or contrast nosing.",
      afterImageUrl: "/demo/sample-entrance-after.jpg",
      reassessment: DEMO_REASSESSMENT_DATA,
    };

    try {
      await InspectionService.saveInspection(sampleRecord, !!user);
      await loadInspections();
      setStatusMessage("Sample demonstration inspection saved.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Failed to seed sample:", err);
    }
  };

  const totalActionsCount = inspections.reduce((acc, i) => acc + (i.actionItems?.length || 0), 0);
  const completedActionsCount = inspections.reduce(
    (acc, i) => acc + (i.actionItems?.filter((a) => a.status === "completed").length || 0),
    0
  );
  const reassessmentsCount = inspections.filter((i) => !!i.reassessment).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#141221] text-[#fdf9f4] relative selection:bg-[#e85d63] selection:text-[#141221]">
      <AppHeader />

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 relative z-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c3b8e3]/15 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1e1a33] text-[#e85d63] border border-[#e85d63]/30 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#fdf9f4]">
                Saved Inspections
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#a9a1c6] mt-1.5 flex items-center gap-2">
              {storageSource === "cloud" && user ? (
                <>
                  <Cloud className="w-4 h-4 text-[#e85d63]" />
                  <span>
                    Synced with <strong className="text-[#fdf9f4]">Cloud Account</strong> ({user.email}). Available across your devices.
                  </span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-[#6ee7b7]" />
                  <span>
                    Stored locally in this browser (IndexedDB). Available offline on this device.
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSeedSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#fdf9f4] bg-[#1e1a33] hover:bg-[#282343] border border-[#c3b8e3]/20 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#eca541]" />
              <span>Save Sample Review</span>
            </button>

            <Link
              href="/inspect"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-xl transition-all shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Inspect New Space</span>
            </Link>
          </div>
        </div>

        {/* Sync Local Data Banner */}
        {user && hasLocalOnly && (
          <div className="p-4 bg-[#1e1a33] border border-[#e85d63]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#fdf9f4] animate-in fade-in shadow-xl">
            <div className="flex items-center gap-3">
              <CloudUpload className="w-5 h-5 text-[#e85d63] shrink-0" />
              <div>
                <p className="font-bold text-[#fdf9f4]">
                  Unsynced local inspections detected
                </p>
                <p className="text-[#a9a1c6] leading-relaxed mt-0.5">
                  You have reviews created in guest mode on this browser. Sync them to your account to access them anywhere.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#e85d63] hover:bg-[#d64b51] text-[#141221] rounded-xl font-bold shadow-md transition-colors cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Sync to Cloud Account</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Guest Mode Callout */}
        {!user && (
          <div className="p-4 bg-[#1e1a33] border border-[#c3b8e3]/15 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#a9a1c6] shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#eca541] shrink-0" />
              <div>
                <span className="font-bold text-[#fdf9f4]">Guest Mode Active: </span>
                <span>
                  Inspections are saved locally in your browser. Create a free account or sign in to sync inspections and access them across all devices.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login?redirect=/inspections"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/20 rounded-lg text-xs font-semibold text-[#fdf9f4] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup?redirect=/inspections"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e85d63] hover:bg-[#d64b51] text-[#141221] rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats Summary */}
        {inspections.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1e1a33] p-4 sm:p-5 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#a9a1c6]">
                Total Reviews
              </p>
              <p className="text-2xl font-bold font-mono text-[#fdf9f4]">{inspections.length}</p>
            </div>
            <div className="bg-[#1e1a33] p-4 sm:p-5 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#a9a1c6]">
                Action Items
              </p>
              <p className="text-2xl font-bold font-mono text-[#eca541]">{totalActionsCount}</p>
            </div>
            <div className="bg-[#1e1a33] p-4 sm:p-5 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#a9a1c6]">
                Completed Actions
              </p>
              <p className="text-2xl font-bold font-mono text-[#6ee7b7]">{completedActionsCount}</p>
            </div>
            <div className="bg-[#1e1a33] p-4 sm:p-5 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#a9a1c6]">
                Before & After Audits
              </p>
              <p className="text-2xl font-bold font-mono text-[#c3b8e3]">{reassessmentsCount}</p>
            </div>
          </div>
        )}

        {/* Feedback message */}
        {statusMessage && (
          <div className="p-3.5 bg-[#6ee7b7]/10 border border-[#6ee7b7]/30 text-[#6ee7b7] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#6ee7b7] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#e85d63] animate-spin" />
            <p className="text-xs sm:text-sm text-[#a9a1c6] font-mono">
              Loading saved inspections...
            </p>
          </div>
        ) : inspections.length === 0 ? (
          /* Empty State */
          <div className="bg-[#1e1a33] rounded-3xl border border-[#c3b8e3]/15 p-8 sm:p-14 text-center space-y-5 shadow-2xl max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#141221] text-[#e85d63] border border-[#e85d63]/30 flex items-center justify-center mx-auto">
              <Bookmark className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#fdf9f4]">
                No Saved Inspections Found
              </h3>
              <p className="text-xs sm:text-sm text-[#a9a1c6] max-w-md mx-auto leading-relaxed">
                When you analyze physical spaces or save a review, your structured findings, grounded visual annotations, action plans, and notes will appear here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/inspect"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inspect a Space Now</span>
              </Link>
              <button
                type="button"
                onClick={handleSeedSample}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#fdf9f4] bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/20 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#eca541]" />
                <span>Load Sample Demonstration Review</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inspections.map((insp) => {
              const formattedDate = new Date(insp.updatedAt || insp.createdAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              );

              const completedCount = (insp.actionItems || []).filter(
                (i) => i.status === "completed"
              ).length;
              const isConfirming = confirmDeleteId === insp.id;

              return (
                <div
                  key={insp.id}
                  className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 overflow-hidden shadow-xl hover:border-[#c3b8e3]/30 transition-all flex flex-col justify-between"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Thumbnail + Title & Date */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#141221] border border-[#c3b8e3]/20 shrink-0">
                        {insp.imageUrl ? (
                          <Image
                            src={insp.imageUrl}
                            alt={insp.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#a9a1c6]">
                            <Eye className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#fdf9f4] truncate">
                            {insp.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#a9a1c6] font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#a9a1c6]" />
                          <span>Last updated {formattedDate}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#141221] text-[#e85d63] border border-[#e85d63]/30">
                            <Layers className="w-3 h-3" />
                            <span>{insp.analysis.findings?.length || 0} findings</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#141221] text-[#6ee7b7] border border-[#6ee7b7]/30">
                            <CheckCircle2 className="w-3 h-3 text-[#6ee7b7]" />
                            <span>{completedCount}/{(insp.actionItems || []).length} actions</span>
                          </span>

                          {insp.reassessment && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/30">
                              <TrendingUp className="w-3 h-3 text-[#c3b8e3]" />
                              <span>Before & After</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summary Excerpt */}
                    <p className="text-xs text-[#a9a1c6] line-clamp-2 leading-relaxed bg-[#141221] p-3 rounded-xl border border-[#c3b8e3]/15">
                      {insp.analysis.overallSummary || "Inspection completed."}
                    </p>

                    {/* Notes preview if present */}
                    {insp.notes && (
                      <p className="text-[11px] text-[#a9a1c6] italic line-clamp-1">
                        <strong className="text-[#eca541]">Note:</strong> &ldquo;{insp.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="bg-[#141221] px-5 py-3 border-t border-[#c3b8e3]/15 flex items-center justify-between gap-3">
                    {isConfirming ? (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-xs text-[#e85d63] font-semibold">
                          Delete this inspection?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(insp.id)}
                            disabled={deletingId === insp.id}
                            className="px-2.5 py-1 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-lg transition-colors cursor-pointer"
                          >
                            {deletingId === insp.id ? "Deleting..." : "Confirm Delete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 text-xs font-medium text-[#a9a1c6] hover:text-[#fdf9f4] rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(insp.id)}
                          className="p-1.5 text-[#a9a1c6] hover:text-[#e85d63] hover:bg-[#1e1a33] rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete saved inspection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2">
                          {insp.reassessment && (
                            <Link
                              href={`/inspect?id=${insp.id}&tab=comparison`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#c3b8e3] bg-[#1e1a33] hover:bg-[#282343] border border-[#c3b8e3]/20 rounded-lg transition-colors"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>View Comparison</span>
                            </Link>
                          )}

                          <Link
                            href={`/inspect?id=${insp.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-lg transition-colors shadow-sm"
                          >
                            <span>Open & Review</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="pt-6">
          <DisclaimerBanner />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

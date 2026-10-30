"use client";

import React from "react";
import Image from "next/image";
import {
  AccessibilityAnalysis,
  ActionPlanItem,
  PerspectiveId,
  PERSPECTIVES_CONFIG,
  ReassessmentAnalysis,
} from "@/types/analysis";
import { Printer, X, CheckCircle2, Ruler, Calendar, TrendingUp } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AccessibilityAnalysis;
  imageUrl: string;
  isDemo: boolean;
  actionItems: ActionPlanItem[];
  reassessment?: ReassessmentAnalysis | null;
  afterImageUrl?: string | null;
  inspectionTitle?: string;
  notes?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  analysis,
  imageUrl,
  isDemo,
  actionItems,
  reassessment,
  afterImageUrl,
  inspectionTitle,
  notes,
}: ReportModalProps) {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  const perspectives: PerspectiveId[] = [
    "wheelchair_access",
    "low_vision",
    "mobility",
    "sensory_access",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto print:m-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Toolbar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 text-sm">
              Review Report Preview
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Print / Save to PDF
            </span>
            {reassessment && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Includes Before vs After Audit
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-stone-200/60 transition-colors"
              aria-label="Close report preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-8 print:p-6 text-stone-900">
          {/* Document Header */}
          <div className="border-b-2 border-stone-900 pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 id="report-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                  {inspectionTitle || "OtherView Accessibility Review"}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Preliminary Multimodal Environmental Accessibility Assessment
                </p>
              </div>
              <div className="text-right text-xs text-stone-600 space-y-0.5">
                <div className="flex items-center gap-1 justify-end font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentDate}</span>
                </div>
                <div>
                  Status:{" "}
                  <span className="font-semibold text-stone-800">
                    {isDemo ? "Sample Demonstration Review" : "Live Session Review"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photograph & Scene Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <Image
                src={imageUrl}
                alt="Photographed physical environment"
                fill
                className="object-cover"
                sizes="380px"
              />
            </div>

            <div className="md:col-span-7 space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Observed Physical Scene
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-1">
                  {analysis.sceneDescription}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Executive Accessibility Summary
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-1">
                  {analysis.overallSummary}
                </p>
              </div>

              {notes && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Inspector & Team Notes
                  </h4>
                  <p className="text-xs text-stone-800 leading-relaxed mt-0.5 whitespace-pre-wrap italic">
                    &ldquo;{notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Before vs After Reassessment Section if present */}
          {reassessment && afterImageUrl && (
            <div className="space-y-4 pt-4 border-t border-stone-200 print:break-inside-avoid">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-stone-900">
                  Closed-Loop Reassessment (Before vs. After Modifications)
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <Image src={imageUrl} alt="Before remediation" fill className="object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900/80 text-white">
                    BEFORE
                  </span>
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <Image src={afterImageUrl} alt="After remediation" fill className="object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-white">
                    AFTER
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs text-stone-800 leading-relaxed">
                <span className="font-bold text-emerald-900 block mb-1">Reassessment Summary:</span>
                {reassessment.overallProgressSummary}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Comparative Findings Breakdown
                </h4>
                <div className="space-y-2">
                  {reassessment.comparisons.map((comp) => (
                    <div key={comp.id} className="p-3 rounded-lg border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">{comp.title}</span>
                        <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100">
                          {comp.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-stone-600">
                        <strong>Evidence: </strong> {comp.comparisonEvidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Priority Recommendations */}
          {analysis.topRecommendations && analysis.topRecommendations.length > 0 && (
            <div className="space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200 print:bg-white print:border-stone-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Priority Action Recommendations</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {analysis.topRecommendations.map((rec, idx) => (
                  <li key={idx}>
                    <span className="font-medium text-stone-900">{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Detailed Findings by Perspective */}
          <div className="space-y-6 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
              Structured Accessibility Findings ({analysis.findings.length})
            </h2>

            {perspectives.map((persp) => {
              const meta = PERSPECTIVES_CONFIG[persp];
              const pFindings = analysis.findings.filter((f) => f.perspective === persp);
              if (pFindings.length === 0) return null;

              return (
                <div key={persp} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <span>{meta.label}</span>
                    <span className="text-[11px] font-semibold">{pFindings.length} findings</span>
                  </h3>

                  <div className="space-y-3 pl-1">
                    {pFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5 print:break-inside-avoid"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm text-stone-900">
                            {finding.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-semibold">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 uppercase tracking-wider">
                              Priority: {finding.priority}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 uppercase tracking-wider">
                              Confidence: {finding.confidence}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">
                          {finding.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                            <span className="font-semibold text-stone-600 block text-[10px] uppercase">
                              Observed Evidence:
                            </span>
                            <span className="text-stone-700">{finding.observedEvidence}</span>
                          </div>
                          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                            <span className="font-semibold text-stone-600 block text-[10px] uppercase">
                              Potential Impact:
                            </span>
                            <span className="text-stone-700">{finding.potentialImpact}</span>
                          </div>
                        </div>

                        <div className="text-xs text-stone-800 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/60">
                          <span className="font-semibold text-indigo-900">Recommended Consideration: </span>
                          <span>{finding.recommendation}</span>
                        </div>

                        {finding.requiresVerification && (
                          <div className="text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                            <Ruler className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">Requires Physical On-Site Verification: </span>
                              <span>{finding.verificationReason}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Plan Status Table */}
          {actionItems.length > 0 && (
            <div className="space-y-3 pt-4 print:break-inside-avoid">
              <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-2">
                Action Plan & Remediation Checklist
              </h3>
              <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-stone-100 text-stone-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Action Item</th>
                    <th className="p-2.5">Perspective</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">User Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {actionItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-bold text-stone-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-stone-900">{item.title}</div>
                        <div className="text-stone-600 text-[11px] mt-0.5">{item.recommendation}</div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap capitalize text-stone-700">
                        {item.perspective.replace("_", " ")}
                      </td>
                      <td className="p-2.5 whitespace-nowrap font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            item.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "in_progress"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2.5 text-stone-600 italic">
                        {item.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Assessment Boundaries & Limitations */}
          {analysis.limitations && analysis.limitations.length > 0 && (
            <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 print:break-inside-avoid">
              <h4 className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Assessment Boundaries & Missing Context
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal and Scope Disclaimer */}
          <div className="border-t border-stone-300 pt-4 text-[11px] text-stone-500 space-y-1 leading-relaxed print:break-inside-avoid">
            <p className="font-semibold text-stone-700">
              OtherView Regulatory & Professional Notice
            </p>
            <p>
              This report is generated by OtherView, an AI-powered educational and design review tool. It is not an official accessibility compliance certification, building code inspection, or legal audit under the Americans with Disabilities Act (ADA), European Standard EN 301 549, or other national accessibility regulations. Complete accessibility assurance requires direct consultation and physical audit by certified specialists and co-design with people with disabilities.
            </p>
            <p className="text-[10px] text-stone-400 pt-1">
              Generated via OtherView V2 • Session data preserved in local client memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

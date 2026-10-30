"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/layout/app-header";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { SavedInspection } from "@/types/analysis";
import { InspectionService } from "@/lib/storage/inspection-service";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Sparkles,
  ArrowRight,
  Accessibility,
  Eye,
  Footprints,
  BrainCircuit,
  Bookmark,
  Calendar,
  User,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [recentInspections, setRecentInspections] = useState<SavedInspection[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Load recent inspections
  useEffect(() => {
    let isMounted = true;
    async function fetchRecent() {
      try {
        const { inspections: list } = await InspectionService.getAllInspections(!!user);
        if (isMounted) {
          setRecentInspections(list.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load recent inspections:", err);
      } finally {
        if (isMounted) setLoadingRecent(false);
      }
    }
    fetchRecent();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-indigo-500 selection:text-white">
      <AppHeader />

      <main id="main-content" className="flex-1 space-y-16 sm:space-y-24 pb-16">
        {/* 1. Hero Section */}
        <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Physical Accessibility Review & Improvement Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12] max-w-4xl mx-auto">
            See the space differently. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700">
              Design for more people.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            OtherView helps facilities teams, architects, and advocates identify potential accessibility barriers in physical environments, ground visible evidence, and track remediation across a complete improvement cycle.
          </p>

          {/* V3 Complete Improvement Cycle Ribbon */}
          <div className="max-w-3xl mx-auto pt-2">
            <div className="bg-white/80 backdrop-blur-xs border border-stone-200/90 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-700">
              <span className="text-indigo-600">Inspect</span>
              <span className="text-stone-300">→</span>
              <span className="text-indigo-600">Identify Barriers</span>
              <span className="text-stone-300">→</span>
              <span className="text-indigo-600">Prioritize Actions</span>
              <span className="text-stone-300">→</span>
              <span className="text-indigo-600">Make Improvements</span>
              <span className="text-stone-300">→</span>
              <span className="text-violet-600">Reassess (Before vs After)</span>
              <span className="text-stone-300">→</span>
              <span className="text-emerald-600">Track Progress</span>
            </div>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/inspect"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all group"
            >
              <span>Inspect a Space</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/inspections"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-stone-700 bg-white hover:bg-stone-50 active:bg-stone-100 border border-stone-300 shadow-2xs transition-colors"
            >
              <Bookmark className="w-4 h-4 text-stone-500" />
              <span>{user ? "My Cloud Dashboard" : "View Saved Inspections"}</span>
            </Link>

            {!user && (
              <Link
                href="/signup?redirect=/inspections"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>Create Cloud Account</span>
              </Link>
            )}
          </div>

          {/* Featured Sample Card Preview */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 text-left">
              <div className="relative w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                <Image
                  src="/demo/sample-entrance.jpg"
                  alt="Sample public library entrance photograph"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 256px"
                  priority
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                  Sample Entrance
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Demonstration Walkthrough
                  </span>
                  <span className="text-xs text-stone-500">Public Library Entrance</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 leading-snug">
                  Explore a complete baseline analysis with grounded evidence & remediation checklist
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  See how OtherView identifies stairs without step-free alternative, missing handrails, low visual contrast on step nosings, and creates an actionable improvement plan.
                </p>
                <div className="pt-1">
                  <Link
                    href="/inspect?demo=true"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>Launch Sample Inspection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. How It Works Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Workflow Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              How OtherView Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              A structured, evidence-based approach to preliminary accessibility review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-stone-900">Upload a Photo</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Take a photograph of a building entrance, doorway, flight of stairs, or public corridor and drop it into the workspace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-stone-900">Explore Evidence</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Review structured accessibility observations with visual grounding zones and separated factual evidence from interpretations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-stone-900">Prioritize Actions</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Track remediation items in an interactive checklist, record field notes, and export professional review summaries.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-stone-900">Before vs. After</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Upload a follow-up photo after modifications to verify whether barriers were addressed in a closed-loop audit.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Accessibility Perspectives Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Multi-Angle Evaluation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Four Core Accessibility Perspectives
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Examining spaces through the diverse needs of people navigating the built environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Perspective A: Wheelchair */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Accessibility className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Wheelchair Accessibility</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Visible steps, level changes, ramp alternatives, door clearances, and path-of-travel continuity.
                </p>
              </div>
              <ul className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                <li>• Level transitions</li>
                <li>• Step-free alternate routes</li>
                <li>• Doorway width & obstacles</li>
              </ul>
            </div>

            {/* Perspective B: Low Vision */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Low Vision</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Luminance contrast on steps and doors, difficult-to-see obstacles, lighting conditions, and wayfinding signage legibility.
                </p>
              </div>
              <ul className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                <li>• Step nosing contrast</li>
                <li>• Glare & shadow patterns</li>
                <li>• Signage readability</li>
              </ul>
            </div>

            {/* Perspective C: Mobility */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Footprints className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Mobility & Walking Support</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Trip hazards, surface irregularities, handrail availability on flights of steps, and resting transition points.
                </p>
              </div>
              <ul className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                <li>• Continuous handrail support</li>
                <li>• Surface evenness & grip</li>
                <li>• Walking clearance</li>
              </ul>
            </div>

            {/* Perspective D: Sensory */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Sensory Accessibility</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Visual clutter, conflicting directional signage, reflective glare, and apparent quiet or navigable zones.
                </p>
              </div>
              <ul className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                <li>• Visual complexity</li>
                <li>• Signage saturation</li>
                <li>• Navigational calm zones</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Recent Inspections Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  Recent Inspections
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Saved locally on this device in IndexedDB.
              </p>
            </div>

            {recentInspections.length > 0 && (
              <Link
                href="/inspections"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Saved Inspections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loadingRecent ? (
            <div className="p-8 text-center text-xs text-stone-400">
              Checking local storage...
            </div>
          ) : recentInspections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentInspections.map((insp) => {
                const date = new Date(insp.updatedAt || insp.createdAt).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                );
                return (
                  <div
                    key={insp.id}
                    className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        {insp.imageUrl && (
                          <Image
                            src={insp.imageUrl}
                            alt={insp.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 320px"
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {date}
                          </span>
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-md">
                            {insp.analysis.findings.length} barriers
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900 mt-1 truncate">
                          {insp.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                          {insp.analysis.overallSummary}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <Link
                        href={`/inspect?id=${insp.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Open Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {insp.reassessment && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Before & After
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state for new users */
            <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-stone-900">
                  No Saved Inspections Yet
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Start an accessibility review of an entrance or pathway, or explore our pre-computed demonstration dataset.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <Link
                  href="/inspect"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  Inspect a Space
                </Link>
                <Link
                  href="/inspect?demo=true"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 transition-colors shadow-2xs"
                >
                  Try Sample Demo
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 5. Trust and Limitations Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <DisclaimerBanner />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-stone-800">OtherView • Multimodal Accessibility Review</p>
            <p>
              Early-stage physical accessibility review assistant. Not a certified building code or legal compliance audit.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/inspect" className="text-stone-600 hover:text-indigo-600">
              Inspect
            </Link>
            <Link href="/inspections" className="text-stone-600 hover:text-indigo-600">
              Saved Reviews
            </Link>
            <Link href="/inspect?demo=true" className="text-stone-600 hover:text-indigo-600">
              Sample Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
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
        const { inspections: list } = await InspectionService.getAllInspections(!!user, user?.$id);
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
    <div className="min-h-screen flex flex-col bg-[#141221] text-[#fdf9f4] relative selection:bg-[#e85d63] selection:text-[#141221]">
      <AppHeader />

      <main id="main-content" className="flex-1 space-y-16 sm:space-y-24 pb-16 relative z-10">
        {/* 1. Hero Section */}
        <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-semibold bg-[#e85d63]/10 text-[#e85d63] border border-[#e85d63]/30 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#e85d63]" />
            <span>AI Physical Accessibility Review & Improvement Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#fdf9f4] leading-[1.12] max-w-4xl mx-auto">
            See the space differently. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e85d63] via-[#eca541] to-[#c3b8e3]">
              Design for more people.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#a9a1c6] max-w-2xl mx-auto leading-relaxed">
            OtherView helps facilities teams, architects, and advocates identify potential accessibility barriers in physical environments, ground visible evidence, and track remediation across a complete improvement cycle.
          </p>

          {/* Complete Improvement Cycle Ribbon */}
          <div className="max-w-3xl mx-auto pt-2">
            <div className="bg-[#1e1a33] border border-[#c3b8e3]/15 rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
              <span className="text-[#e85d63]">Inspect</span>
              <span className="text-[#a9a1c6]/40">→</span>
              <span className="text-[#e85d63]">Identify Barriers</span>
              <span className="text-[#a9a1c6]/40">→</span>
              <span className="text-[#eca541]">Prioritize Actions</span>
              <span className="text-[#a9a1c6]/40">→</span>
              <span className="text-[#eca541]">Make Improvements</span>
              <span className="text-[#a9a1c6]/40">→</span>
              <span className="text-[#c3b8e3]">Reassess (Before vs After)</span>
              <span className="text-[#a9a1c6]/40">→</span>
              <span className="text-[#6ee7b7]">Track Progress</span>
            </div>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/inspect"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] active:scale-[0.98] shadow-lg transition-all group"
            >
              <span>Inspect a Space</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/inspections"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#fdf9f4] bg-[#1e1a33] hover:bg-[#282343] border border-[#c3b8e3]/20 shadow-md transition-colors"
            >
              <Bookmark className="w-4 h-4 text-[#c3b8e3]" />
              <span>{user ? "My Saved Reviews" : "View Saved Inspections"}</span>
            </Link>

            {!user && (
              <Link
                href="/signup?redirect=/inspections"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#c3b8e3] bg-[#1e1a33] hover:bg-[#282343] border border-[#c3b8e3]/30 transition-colors shadow-md"
              >
                <User className="w-4 h-4 text-[#c3b8e3]" />
                <span>Create Free Account</span>
              </Link>
            )}
          </div>

          {/* Featured Sample Card Preview */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="bg-[#1e1a33] rounded-3xl border border-[#c3b8e3]/15 p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6 text-left">
              <div className="relative w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden bg-[#141221] border border-[#c3b8e3]/20 shrink-0">
                <Image
                  src="/demo/sample-entrance.jpg"
                  alt="Sample public library entrance photograph"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 256px"
                  priority
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#141221]/90 text-white text-[10px] font-mono uppercase font-semibold border border-[#c3b8e3]/20">
                  Sample Entrance
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#eca541] bg-[#eca541]/10 px-2.5 py-0.5 rounded-full border border-[#eca541]/30">
                    Demonstration Walkthrough
                  </span>
                  <span className="text-xs text-[#a9a1c6] font-mono">Public Library Entrance</span>
                </div>
                <h3 className="text-lg font-bold text-[#fdf9f4] leading-snug">
                  Explore a complete baseline analysis with grounded evidence & remediation checklist
                </h3>
                <p className="text-xs sm:text-sm text-[#a9a1c6] leading-relaxed">
                  See how OtherView identifies stairs without step-free alternative, missing handrails, low visual contrast on step nosings, and creates an actionable improvement plan.
                </p>
                <div className="pt-1">
                  <Link
                    href="/inspect?demo=true"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e85d63] hover:text-[#d64b51] transition-colors"
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
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-[#e85d63] bg-[#e85d63]/10 px-2.5 py-1 rounded-full border border-[#e85d63]/30">
              Workflow Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#fdf9f4]">
              How OtherView Works
            </h2>
            <p className="text-xs sm:text-sm text-[#a9a1c6]">
              A structured, evidence-based approach to preliminary accessibility review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-3 relative hover:border-[#c3b8e3]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#141221] text-[#e85d63] border border-[#e85d63]/30 flex items-center justify-center font-mono font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-[#fdf9f4]">Upload a Photo</h3>
              <p className="text-xs text-[#a9a1c6] leading-relaxed">
                Take a photograph of a building entrance, doorway, flight of stairs, or public corridor and drop it into the workspace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-3 relative hover:border-[#c3b8e3]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#141221] text-[#eca541] border border-[#eca541]/30 flex items-center justify-center font-mono font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-[#fdf9f4]">Explore Evidence</h3>
              <p className="text-xs text-[#a9a1c6] leading-relaxed">
                Review structured accessibility observations with visual grounding zones and separated factual evidence from interpretations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-3 relative hover:border-[#c3b8e3]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#141221] text-[#6ee7b7] border border-[#6ee7b7]/30 flex items-center justify-center font-mono font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-[#fdf9f4]">Prioritize Actions</h3>
              <p className="text-xs text-[#a9a1c6] leading-relaxed">
                Track remediation items in an interactive checklist, record field notes, and export professional review summaries.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#c3b8e3]/15 shadow-xl space-y-3 relative hover:border-[#c3b8e3]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/30 flex items-center justify-center font-mono font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-[#fdf9f4]">Before vs. After</h3>
              <p className="text-xs text-[#a9a1c6] leading-relaxed">
                Upload a follow-up photo after modifications to verify whether barriers were addressed in a closed-loop audit.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Accessibility Perspectives Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-[#c3b8e3] bg-[#c3b8e3]/10 px-2.5 py-1 rounded-full border border-[#c3b8e3]/30">
              Multi-Angle Evaluation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#fdf9f4]">
              Four Core Accessibility Perspectives
            </h2>
            <p className="text-xs sm:text-sm text-[#a9a1c6]">
              Examining spaces through the diverse needs of people navigating the built environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Perspective A: Wheelchair */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#e85d63]/25 shadow-xl space-y-3.5 flex flex-col justify-between hover:border-[#e85d63]/50 transition-colors">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#141221] text-[#e85d63] border border-[#e85d63]/30 flex items-center justify-center">
                  <Accessibility className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#fdf9f4]">Wheelchair Accessibility</h3>
                <p className="text-xs text-[#a9a1c6] leading-relaxed">
                  Visible steps, level changes, ramp alternatives, door clearances, and path-of-travel continuity.
                </p>
              </div>
              <ul className="text-[11px] text-[#a9a1c6] space-y-1 pt-2 border-t border-[#c3b8e3]/10 font-mono">
                <li>• Level transitions</li>
                <li>• Step-free alternate routes</li>
                <li>• Doorway width & obstacles</li>
              </ul>
            </div>

            {/* Perspective B: Low Vision */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#eca541]/25 shadow-xl space-y-3.5 flex flex-col justify-between hover:border-[#eca541]/50 transition-colors">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#141221] text-[#eca541] border border-[#eca541]/30 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#fdf9f4]">Low Vision</h3>
                <p className="text-xs text-[#a9a1c6] leading-relaxed">
                  Luminance contrast on steps and doors, difficult-to-see obstacles, lighting conditions, and wayfinding signage legibility.
                </p>
              </div>
              <ul className="text-[11px] text-[#a9a1c6] space-y-1 pt-2 border-t border-[#c3b8e3]/10 font-mono">
                <li>• Step nosing contrast</li>
                <li>• Glare & shadow patterns</li>
                <li>• Signage readability</li>
              </ul>
            </div>

            {/* Perspective C: Mobility */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#c3b8e3]/25 shadow-xl space-y-3.5 flex flex-col justify-between hover:border-[#c3b8e3]/50 transition-colors">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/30 flex items-center justify-center">
                  <Footprints className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#fdf9f4]">Mobility & Walking Support</h3>
                <p className="text-xs text-[#a9a1c6] leading-relaxed">
                  Trip hazards, surface irregularities, handrail availability on flights of steps, and resting transition points.
                </p>
              </div>
              <ul className="text-[11px] text-[#a9a1c6] space-y-1 pt-2 border-t border-[#c3b8e3]/10 font-mono">
                <li>• Continuous handrail support</li>
                <li>• Surface evenness & grip</li>
                <li>• Walking clearance</li>
              </ul>
            </div>

            {/* Perspective D: Sensory */}
            <div className="bg-[#1e1a33] p-6 rounded-2xl border border-[#6ee7b7]/25 shadow-xl space-y-3.5 flex flex-col justify-between hover:border-[#6ee7b7]/50 transition-colors">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#141221] text-[#6ee7b7] border border-[#6ee7b7]/30 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#fdf9f4]">Sensory Accessibility</h3>
                <p className="text-xs text-[#a9a1c6] leading-relaxed">
                  Visual clutter, conflicting directional signage, reflective glare, and apparent quiet or navigable zones.
                </p>
              </div>
              <ul className="text-[11px] text-[#a9a1c6] space-y-1 pt-2 border-t border-[#c3b8e3]/10 font-mono">
                <li>• Visual complexity</li>
                <li>• Signage saturation</li>
                <li>• Navigational calm zones</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Recent Inspections Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c3b8e3]/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#e85d63]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fdf9f4]">
                  Recent Inspections
                </h2>
              </div>
              <p className="text-xs text-[#a9a1c6] mt-0.5 font-mono">
                Saved to your personal workspace records.
              </p>
            </div>

            {recentInspections.length > 0 && (
              <Link
                href="/inspections"
                className="text-xs font-semibold text-[#e85d63] hover:text-[#d64b51] flex items-center gap-1 font-mono"
              >
                <span>View All Saved Inspections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loadingRecent ? (
            <div className="p-8 text-center text-xs text-[#a9a1c6] font-mono">
              Checking saved records...
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
                    className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-4 sm:p-5 shadow-xl hover:border-[#c3b8e3]/30 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#141221] border border-[#c3b8e3]/20">
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
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#a9a1c6] font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {date}
                          </span>
                          <span className="font-semibold text-[#e85d63] bg-[#e85d63]/10 px-2 py-0.5 rounded-md border border-[#e85d63]/30">
                            {insp.analysis.findings.length} barriers
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#fdf9f4] mt-1.5 truncate">
                          {insp.title}
                        </h4>
                        <p className="text-xs text-[#a9a1c6] line-clamp-2 mt-1 leading-relaxed">
                          {insp.analysis.overallSummary}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#c3b8e3]/10 flex items-center justify-between">
                      <Link
                        href={`/inspect?id=${insp.id}`}
                        className="text-xs font-bold text-[#e85d63] hover:text-[#d64b51] flex items-center gap-1"
                      >
                        <span>Open Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {insp.reassessment && (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#6ee7b7] bg-[#6ee7b7]/10 px-2 py-0.5 rounded-full border border-[#6ee7b7]/30">
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
            <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 p-8 text-center space-y-4 max-w-xl mx-auto shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[#141221] text-[#a9a1c6] border border-[#c3b8e3]/20 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-[#fdf9f4]">
                  No Saved Inspections Yet
                </h3>
                <p className="text-xs text-[#a9a1c6] max-w-sm mx-auto leading-relaxed">
                  Start an accessibility review of an entrance or pathway, or explore our pre-computed demonstration dataset.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <Link
                  href="/inspect"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] transition-colors shadow-md"
                >
                  Inspect a Space
                </Link>
                <Link
                  href="/inspect?demo=true"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#fdf9f4] bg-[#141221] hover:bg-[#1e1a33] border border-[#c3b8e3]/20 transition-colors shadow-sm"
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

      <AppFooter />
    </div>
  );
}

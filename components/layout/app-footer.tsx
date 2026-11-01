"use client";

import React from "react";
import Link from "next/link";
import { Eye, Shield, Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-[#c3b8e3]/15 bg-[#0e0c18] py-10 mt-auto text-xs text-[#a9a1c6] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1e1a33] border border-[#e85d63]/30 flex items-center justify-center text-[#e85d63]">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#fdf9f4] tracking-tight">OtherView</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#e85d63] bg-[#e85d63]/10 px-2 py-0.5 rounded border border-[#e85d63]/25">
                Architecture v3
              </span>
            </div>
            <p className="text-xs text-[#a9a1c6] leading-relaxed">
              AI-assisted physical environment accessibility review assistant. See the space differently. Design for more people.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <Link href="/inspect" className="text-[#a9a1c6] hover:text-[#fdf9f4] transition-colors">
              Inspect Space
            </Link>
            <Link href="/inspections" className="text-[#a9a1c6] hover:text-[#fdf9f4] transition-colors">
              Saved Reviews
            </Link>
            <Link href="/inspect?demo=true" className="text-[#eca541] hover:text-[#fdf9f4] transition-colors">
              Sample Entrance Demo
            </Link>
            <a href="#disclaimer" className="text-[#a9a1c6] hover:text-[#fdf9f4] transition-colors flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#c3b8e3]" />
              <span>Auditing Scope</span>
            </a>
          </div>
        </div>

        <div className="border-t border-[#c3b8e3]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#a9a1c6]/70">
          <p>
            OtherView © 2026 • AI educational & preliminary design assistant. Not a certified building code or ADA legal compliance audit.
          </p>
          <p className="flex items-center gap-1 font-mono text-[10px]">
            <span>Designed for inclusive spaces</span>
            <Heart className="w-3 h-3 text-[#e85d63] fill-[#e85d63]" />
          </p>
        </div>
      </div>
    </footer>
  );
}

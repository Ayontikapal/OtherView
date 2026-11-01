import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Eye, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#141221] flex flex-col text-[#fdf9f4] selection:bg-[#e85d63] selection:text-[#141221]">
      <AppHeader />
      <main id="main-content" className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full bg-[#1e1a33] rounded-3xl border border-[#c3b8e3]/15 p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#141221] border border-[#eca541]/30 flex items-center justify-center text-[#eca541] mb-2 shadow-md">
            <Eye className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#fdf9f4]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#a9a1c6] leading-relaxed">
            The page or inspection resource you are looking for does not exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#e85d63] text-[#141221] font-bold text-xs hover:bg-[#d64b51] transition shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/inspections"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#c3b8e3]/20 bg-[#141221] text-[#fdf9f4] font-semibold text-xs hover:bg-[#1e1a33] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Saved Inspections</span>
            </Link>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

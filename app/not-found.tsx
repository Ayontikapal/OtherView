import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Eye, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <AppHeader />
      <main id="main-content" className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
            <Eye className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            The page or inspection resource you are looking for does not exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/inspections"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-medium text-sm hover:bg-stone-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Saved Inspections
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

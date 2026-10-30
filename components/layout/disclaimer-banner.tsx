import { Info, AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside
      id="disclaimer"
      aria-labelledby="disclaimer-title"
      className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 text-stone-700 text-xs sm:text-sm leading-relaxed"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1 rounded-md bg-stone-200 text-stone-700 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="disclaimer-title" className="font-semibold text-stone-900 text-sm">
              Important Scope & Accessibility Review Disclaimer
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Preliminary AI Assistant
            </span>
          </div>
          <p className="text-stone-600">
            <strong>OtherView</strong> is an early-stage educational and preliminary design assistant. It identifies visible environmental features to help teams think more inclusively about spaces.
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-600 pt-1">
            <li>
              <strong>Not a compliance audit:</strong> This tool does not replace certified accessibility audits, ADA/building code inspections, or legal assessments.
            </li>
            <li>
              <strong>Physical verification required:</strong> Slopes, door opening weights, latch mechanisms, tactile indicators, and acoustic levels require in-person measurement.
            </li>
            <li>
              <strong>Direct consultation:</strong> True accessibility always requires direct engagement and co-design with people with diverse disabilities.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

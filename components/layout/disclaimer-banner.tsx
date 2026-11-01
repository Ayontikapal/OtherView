import { Info, AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside
      id="disclaimer"
      aria-labelledby="disclaimer-title"
      className="rounded-2xl border border-[#c3b8e3]/15 bg-[#1e1a33] p-5 sm:p-6 text-[#a9a1c6] text-xs sm:text-sm leading-relaxed shadow-xl"
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 p-1.5 rounded-lg bg-[#141221] text-[#eca541] border border-[#eca541]/30 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="disclaimer-title" className="font-bold text-[#fdf9f4] text-sm">
              Scope & Accessibility Review Notice
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-[#eca541] bg-[#eca541]/10 px-2 py-0.5 rounded-full border border-[#eca541]/30">
              <AlertTriangle className="w-3 h-3 text-[#eca541]" />
              Preliminary AI Assistant
            </span>
          </div>
          <p className="text-[#a9a1c6] text-xs sm:text-sm">
            <strong className="text-[#fdf9f4]">OtherView</strong> is an educational and preliminary architectural design assistant. It identifies visible physical features to help teams spot barriers and think inclusively about physical spaces.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#a9a1c6]/90 pt-1">
            <li>
              <strong className="text-[#fdf9f4]">Not a legal compliance certification:</strong> Does not replace certified accessibility audits, ADA inspections, or building code sign-offs.
            </li>
            <li>
              <strong className="text-[#fdf9f4]">Physical verification required:</strong> Ramp slopes, door opening resistances, latch clearances, tactile ground surface indicators, and acoustic reverberation require on-site instrumentation.
            </li>
            <li>
              <strong className="text-[#fdf9f4]">Direct consultation essential:</strong> True accessibility always requires direct engagement and participatory co-design with people with disabilities.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

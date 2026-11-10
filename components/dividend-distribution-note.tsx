// Client-requested note shown under Transaction History on the investor dashboard.
// Admins see it too through "View as investor", which renders the same page.
// Update the year in this text once the Q4 close it refers to has passed.
export function DividendDistributionNote() {
  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-left">
      <p className="text-sm leading-relaxed text-slate-300">
        <span className="font-semibold text-amber-400">Note:</span> Please note that Nidhiksh Investments Inc.
        distributes dividends on an annual basis until the Company becomes publicly traded. As a result, the
        monthly/quarterly realized summary does not represent the full-year outcome. The final figures may change
        based on the Company&apos;s performance for the remainder of the year and will be fully reflected at the close
        of Q4 2026.
      </p>
    </div>
  )
}

const CORPS = [
  { id:"C1", name:"CoreCivic", ticker:"CXW", hq:"Nashville, TN", fac:16, beds:16000, rev:"$2.2B", profit:"$116.5M", chg:"+70%", color:"text-red-600 dark:text-red-400", border: "border-t-red-600 dark:border-t-red-400", founded:"1983", desc:"Largest private detention operator. ICE detainee count up 60% to 16,000 in 2025. CEO Patrick Swindle: 'ICE was our first customer 43 years ago.' Revenue from ICE doubled to $245M in Q4 2025." },
  { id:"C2", name:"GEO Group", ticker:"GEO", hq:"Boca Raton, FL", fac:19, beds:26000, rev:"$2.6B", profit:"$254M", chg:"+700%", color:"text-amber-600 dark:text-amber-400", border: "border-t-amber-600 dark:border-t-amber-400", founded:"1984", desc:"Record $254M profit in 2025 — 700% increase. Added 6,000 ICE beds in 2025 reaching 26,000 total. Won $520M in new contracts — 'most successful year in company history' per exec chairman George Zoley." },
  { id:"C3", name:"LaSalle Corrections", ticker:"Private", hq:"Ruston, LA", fac:14, beds:8000, rev:"$480M", profit:"N/A", chg:"N/A", color:"text-purple-600 dark:text-purple-400", border: "border-t-purple-600 dark:border-t-purple-400", founded:"2003", desc:"Regional Gulf South operator. Expanded capacity 2024–2025 with new DHS contracts. Reports of inadequate medical care at multiple facilities." },
  { id:"C4", name:"Management & Training Corp", ticker:"Private", hq:"Centerville, UT", fac:6, beds:4500, rev:"$310M", profit:"N/A", chg:"N/A", color:"text-blue-600 dark:text-blue-400", border: "border-t-blue-600 dark:border-t-blue-400", founded:"1981", desc:"MTC holds ICE contracts at 6 facilities including Otero County NM and facilities in AZ and TX. Focus on vocational programming." },
  { id:"C5", name:"Emerald Correctional Mgmt", ticker:"Private", hq:"Alvarado, TX", fac:4, beds:2800, rev:"$105M", profit:"N/A", chg:"N/A", color:"text-teal-600 dark:text-teal-400", border: "border-t-teal-600 dark:border-t-teal-400", founded:"2009", desc:"Regional operator primarily holding Prairieland Detention Center contract in TX. Serves ICE under intergovernmental service agreements." },
];

export default function DetentionCorporations() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Private Detention Corporations</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          For-profit companies operating ICE detention facilities · 2025-2026 financials · SEC filings
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {CORPS.map((corp) => (
          <div
            key={corp.id}
            className={`flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 border-t-4 ${corp.border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className={`text-base font-bold ${corp.color}`}>{corp.name}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {corp.hq} · Est. {corp.founded}
                  {corp.ticker !== 'Private' && ` · NYSE: ${corp.ticker}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">{corp.rev}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">2025 Rev</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
              {[
                { label: 'PROFIT', value: corp.profit },
                { label: 'YOY %', value: corp.chg },
                { label: 'FACILITIES', value: corp.fac },
                { label: 'ICE BEDS', value: corp.beds.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-sm font-bold ${corp.color}`}>{s.value}</div>
                  <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {corp.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

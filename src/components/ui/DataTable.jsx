export function DataTable({ columns, rows, renderCell }) {
  return (
    <div className="overflow-x-auto rounded-xl glass-panel">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="border-b border-zinc-800/50 bg-zinc-950/30 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-7 text-center text-zinc-500"
              >
                No records found
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-brand/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.1)] last:[&>td]:border-b-0"
              >
                {columns.map((c) => (
                  <td
                     key={c.key}
                    className="whitespace-nowrap border-b border-zinc-800/50 px-4 py-3.5 text-zinc-100 transition-colors group-hover:text-white"
                  >
                    {renderCell ? renderCell(row, c.key) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

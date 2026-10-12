import Icon from '../common/Icon.jsx'

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  if (totalPages <= 1 && totalItems === 0) return null

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-100 px-5 py-4 dark:border-zinc-800 gap-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{startItem}</span> to <span className="font-medium text-zinc-900 dark:text-zinc-100">{endItem}</span> of <span className="font-medium text-zinc-900 dark:text-zinc-100">{totalItems}</span> entries
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Icon name="chevronRight" size={16} className="rotate-180" />
        </button>
        
        {getPageNumbers().map((p, index) => {
          if (p === '...') {
            return (
              <span key={`dots-${index}`} className="grid h-8 w-8 place-items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                ...
              </span>
            )
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={
                'grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold transition ' +
                (p === currentPage
                  ? 'bg-brand text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800')
              }
            >
              {p}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </div>
  )
}

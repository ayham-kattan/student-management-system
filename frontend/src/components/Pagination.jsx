// Page numbers with ellipses, e.g. 1 … 4 5 6 … 12
function pageItems(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
}

export default function Pagination({ meta, onPage }) {
  if (!meta || meta.total === 0) return null;
  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const nav =
    'inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button className={nav} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Previous
          </button>
          {pageItems(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium ${
                  p === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button className={nav} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

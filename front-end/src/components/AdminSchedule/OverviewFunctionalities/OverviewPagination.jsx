import { ChevronLeft, ChevronRight } from "lucide-react";

const OverviewPagination = ({ pagination, loadPage }) => {
  const { current_page, last_page, from, to, total } = pagination;
  if (!last_page || last_page <= 1) return null;

  const pages = Array.from({ length: last_page }).map((_, i) => i + 1);

  return (
    <section className="flex items-center justify-between px-4 py-3 border-t border-box-outline mt-3">
      <div className="text-sm text-primary-text dark:text-white">
        Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of <span className="font-medium">{total}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => loadPage(Math.max(1, current_page - 1))}
          disabled={current_page === 1}
          className="p-2 border rounded"><ChevronLeft size={18} /></button>

        <div className="flex items-center gap-1">
          {pages.map(page => {
            if (page === 1 || page === last_page || Math.abs(page - current_page) <= 1) {
              return <button key={page} onClick={() => loadPage(page)} className={`px-3 py-1 rounded text-sm ${page === current_page ? 'bg-hover-blue text-white' : 'border'}`}>{page}</button>;
            }
            if (page === current_page - 2 || page === current_page + 2) return <span key={page} className="px-2">...</span>;
            return null;
          })}
        </div>

        <button
          onClick={() => loadPage(Math.min(last_page, current_page + 1))}
          disabled={current_page === last_page}
          className="p-2 border rounded">
          <ChevronRight size={18} />
        </button>
      </div>

    </section>
  )
}

export default OverviewPagination
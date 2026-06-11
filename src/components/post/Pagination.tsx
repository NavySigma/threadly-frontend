import type { PaginationMeta } from "../../types";

function buildRange(current: number, last: number): (number | "...")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const r: (number | "...")[] = [1];
  if (current > 3) r.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) r.push(p);
  if (current < last - 2) r.push("...");
  r.push(last);
  return r;
}

export function Pagination({ meta, page, onPageChange }: {
  meta: PaginationMeta;
  page: number;
  onPageChange: (p: number) => void;
}) {
  if (meta.last_page <= 1) return null;

  return (
    <div className="flex justify-between items-center py-4 flex-wrap gap-2">
      <span className="text-xs text-gray-400">{meta.total} pertanyaan</span>
      <div className="flex gap-1 items-center">
        <PageBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹ Prev</PageBtn>
        {buildRange(page, meta.last_page).map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-gray-400 text-xs">…</span>
          ) : (
            <PageBtn key={p} active={p === page} onClick={() => onPageChange(p as number)}>
              {p}
            </PageBtn>
          )
        )}
        <PageBtn disabled={page >= meta.last_page} onClick={() => onPageChange(page + 1)}>Next ›</PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick }: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition min-w-[34px]
        ${active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-white border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-500"}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TablePagination({
  currentPage,
  totalPages,
  total,
  first,
  last,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled,
}) {
  const pages = [
    ...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]),
  ]
    .filter((page) => page > 0 && page <= totalPages)
    .sort((a, b) => a - b);
  return (
    <div className="mt-5 grid grid-cols-2 items-center gap-3 border-t pt-4 text-sm lg:flex lg:flex-wrap lg:justify-between">
      <p role="status" className="text-xs text-muted-foreground sm:text-sm">
        {first}–{last} / {total} người dùng
      </p>
      <label className="flex items-center justify-end gap-2">
        Số dòng
        <select
          className="min-h-11 rounded-md border bg-white p-2 text-base sm:text-sm"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          disabled={disabled}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <nav
        aria-label="Phân trang người dùng"
        className="col-span-2 flex items-center justify-between gap-1 sm:justify-center lg:justify-start [&_button]:size-11"
      >
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang đầu"
          disabled={disabled || currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang trước"
          disabled={disabled || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>
        {pages.map((page, index) => (
          <span key={page} className="hidden items-center gap-1 sm:flex">
            {index > 0 && page - pages[index - 1] > 1 && (
              <span aria-hidden="true" className="px-1">
                …
              </span>
            )}
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="icon-sm"
              aria-label={`Trang ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              disabled={disabled}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </span>
        ))}
        <span className="px-2 text-center text-xs tabular-nums sm:hidden">{currentPage} / {totalPages}</span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang sau"
          disabled={disabled || currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang cuối"
          disabled={disabled || currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight />
        </Button>
      </nav>
    </div>
  );
}

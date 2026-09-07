import type { PaginationMeta } from "../../types/event";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

interface DataTablePaginationProps {
  meta: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  defaultLimit?: number;
}

export function DataTablePagination({
  meta,
  onPageChange,
  onLimitChange,
  defaultLimit = 10,
}: DataTablePaginationProps) {
  const [currentLimit, setCurrentLimit] = useState(defaultLimit);

  // Sync internal limit if meta updates
  useEffect(() => {
    if (meta?.per_page) {
      setCurrentLimit(meta.per_page);
    }
  }, [meta?.per_page]);

  if (!meta || meta.total_records === 0) {
    return null;
  }

  const { current_page, total_pages, has_next, has_prev, total_records } = meta;

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (total_pages <= maxVisiblePages) {
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      if (current_page <= 3) {
        pages.push(1, 2, 3, 4, -1, total_pages);
      } else if (current_page >= total_pages - 2) {
        pages.push(1, -1, total_pages - 3, total_pages - 2, total_pages - 1, total_pages);
      } else {
        pages.push(1, -1, current_page - 1, current_page, current_page + 1, -1, total_pages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    setCurrentLimit(newLimit);
    onLimitChange(newLimit);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium text-muted-foreground">Rows per page</p>
        <Select
          value={`${currentLimit}`}
          onValueChange={handleLimitChange}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={`${currentLimit}`} />
          </SelectTrigger>
          <SelectContent side="top">
            {[8, 10, 20, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {(current_page - 1) * currentLimit + 1} to{" "}
        {Math.min(current_page * currentLimit, total_records)} of {total_records} entries
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (has_prev) onPageChange(current_page - 1);
              }}
              className={!has_prev ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {pages.map((page, i) => (
            <PaginationItem key={i}>
              {page === -1 ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === current_page}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page !== current_page) onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (has_next) onPageChange(current_page + 1);
              }}
              className={!has_next ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

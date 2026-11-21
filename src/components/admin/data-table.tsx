"use client";

import { flexRender, type RowData } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = "Search…",
  statusFilterOptions,
  getStatusValue,
  toolbarAction,
  defaultPageSize = 10,
}: {
  columns: Array<LegacyColumnDef<TData, unknown>>;
  data: TData[];
  searchPlaceholder?: string;
  statusFilterOptions?: string[];
  getStatusValue?: (row: TData) => string;
  toolbarAction?: React.ReactNode;
  defaultPageSize?: number;
}) {
  const { t } = useAdminI18n();
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const statusLabels: Record<string, string> = {
    all: t.common.all,
    published: t.common.published,
    draft: t.common.draft,
    unread: t.common.unread,
    read: t.common.read,
    archived: t.common.archived,
  };

  const filteredData =
    statusFilter === "all" || !getStatusValue
      ? data
      : data.filter((row) => getStatusValue(row) === statusFilter);

  const table = useLegacyTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: defaultPageSize },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(1, table.getPageCount());
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min(totalRows, (pageIndex + 1) * pageSize);

  const pageNumbers: number[] = [];
  const windowStart = Math.max(0, pageIndex - 2);
  const windowEnd = Math.min(pageCount - 1, pageIndex + 2);
  for (let p = windowStart; p <= windowEnd; p++) {
    pageNumbers.push(p);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                table.setPageIndex(0);
              }}
              placeholder={searchPlaceholder}
              className="pl-8"
            />
          </div>

          {statusFilterOptions ? (
            <div className="relief-well flex items-center gap-1 rounded-[6px] border border-ink-950/12 bg-board-200/70 p-1">
              {["all", ...statusFilterOptions].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    table.setPageIndex(0);
                  }}
                  className={
                    statusFilter === status
                      ? "rounded-[4px] bg-ink-950 px-2.5 py-1 text-xs font-medium text-board-50"
                      : "rounded-[4px] px-2.5 py-1 text-xs text-ink-600 hover:text-ink-950"
                  }
                >
                  {statusLabels[status] ?? status}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {toolbarAction}
      </div>

      <div className="relief-slab overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="size-3.5 opacity-60" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t.common.noRecords}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Proper Admin Pagination Controls */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-950/12 pt-3 text-xs text-muted-foreground sm:flex-row">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-[11px]">
            {startRow}–{endRow} {t.common.of} {totalRows} {t.common.items}
          </span>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              {t.common.rowsPerPage}
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                if (val) table.setPageSize(Number(val));
              }}
            >
              <SelectTrigger size="sm" className="h-7 w-16 font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={t.common.previous}
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === pageIndex ? "default" : "outline"}
              size="sm"
              className="h-7 min-w-7 px-2 font-mono text-xs"
              onClick={() => table.setPageIndex(p)}
            >
              {p + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={t.common.next}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "./button";
import Select from "../fields/Select";

type FilterOption = { label: string; value: string };

/* ──────────────────────────────── FILTER UI ──────────────────────────────── */
function TextFilter({ column }: { column: any }) {
  const value = column.getFilterValue() as string | undefined;
  return (
    <div className="relative mt-1">
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder="Filter..."
        className="w-full pl-8 pr-7 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
      />
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      {value && (
        <button
          onClick={() => column.setFilterValue(undefined)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          type="button"
          title="Clear filter"
          aria-label="Clear filter"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function SelectFilter({
  column,
  options,
}: {
  column: any;
  options: FilterOption[];
}) {
  const value = column.getFilterValue() as string | undefined;
  return (
    <div className="mt-1">
      <Select
        name={column.id}
        options={options}
        value={value}
        onChange={(_, v) => column.setFilterValue(v || undefined)}
        placeholder="All"
        className="text-xs"
      />
    </div>
  );
}

function MultiSelectFilter({
  column,
  options,
}: {
  column: any;
  options: FilterOption[];
}) {
  const value = (column.getFilterValue() as string[]) ?? [];

  const toggle = (val: string) => {
    const newVal = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    column.setFilterValue(newVal.length ? newVal : undefined);
  };

  return (
    <div className="mt-1 max-h-40 overflow-auto border border-gray-300 rounded bg-white">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs"
        >
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="w-3 h-3 text-teal-600 rounded"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

/* ──────────────────────────────── EXTENDED DEF ──────────────────────────────── */
export type ExtendedColumnDef<T> = ColumnDef<T> & {
  filterType?: "text" | "select" | "multiselect";
  filterOptions?: FilterOption[];
  filterComponent?: React.ComponentType<{ column: any }>;
  enableColumnFilter?: boolean;
};

/* ──────────────────────────────── MAIN COMPONENT ──────────────────────────────── */
interface DataTableProps<T extends object> {
  columns: ExtendedColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  detailComponent?: React.ComponentType<{ row: T }>;
  onDelete?: (rows: T[]) => void;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  showColumnToggle?: boolean;
}

export default function DataTable<T extends object>({
  columns: userColumns,
  data,
  onRowClick,
  detailComponent: DetailComponent,
  onDelete,
  searchPlaceholder = "Search...",
  pageSizeOptions = [10, 25, 50, 100],
  showColumnToggle = true,
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  /* ────── 1. Build columns (selection column + user columns) ────── */
  const columns = useMemo<ExtendedColumnDef<T>[]>(() => {
    const selectionColumn: ExtendedColumnDef<T> = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
                title="Select row"
          checked={table.getIsAllPageRowsSelected()}
          ref={el => {
            if (el) {
              el.indeterminate =
                table.getIsSomePageRowsSelected() &&
                !table.getIsAllPageRowsSelected();
            }
          }}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          aria-label="Select row"
          title="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 50,
    };
    return [selectionColumn, ...userColumns];
  }, [userColumns]);

  /* ────── 2. Reset visibility when columns change ────── */
  useEffect(() => {
    const allIds = columns
      .filter((c) => c.id && c.id !== "select")
      .reduce((acc, c) => ({ ...acc, [c.id!]: true }), {});
    setColumnVisibility(allIds);
  }, [columns]);

  /* ────── 3. TanStack Table instance ────── */
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility, // ← important
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility, // ← THIS WAS MISSING
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ────── 4. Helpers ────── */
  const selectedCount = Object.keys(rowSelection).length;
  const selectedRows = table
    .getSelectedRowModel()
    .flatRows.map((r) => r.original);
  const handleDelete = () => {
    onDelete?.(selectedRows);
    setRowSelection({});
    setShowDeleteModal(false);
  };
  const toggleRowExpand = (rowId: string) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  /* ────── 5. Render filter only when requested ────── */
  const renderFilter = (column: any) => {
    const def = column.columnDef as ExtendedColumnDef<T>;

    if (def.enableColumnFilter === false) return null;
    if (!def.filterType && def.enableColumnFilter !== true) return null;

    if (def.filterComponent) {
      const Comp = def.filterComponent;
      return <Comp column={column} />;
    }

    switch (def.filterType) {
      case "select":
        return (
          <SelectFilter column={column} options={def.filterOptions ?? []} />
        );
      case "multiselect":
        return (
          <MultiSelectFilter
            column={column}
            options={def.filterOptions ?? []}
          />
        );
      default:
        return <TextFilter column={column} />;
    }
  };

  /* ────── 6. UI ────── */
  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* ── Column toggle (show/hide) ── */}
          {showColumnToggle && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Columns
              </button>
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                <div className="p-2 max-h-60 overflow-auto">
                  {table.getAllColumns().map((column) => {
                    if (!column.getCanHide()) return null;
                    return (
                      <label
                        key={column.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={() => column.toggleVisibility()}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span>{column.columnDef.header?.toString()}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk delete */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedCount} selected
            </span>
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {/* Header + sort */}
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none flex items-center gap-1"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : header.column.getIsSorted() === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : null}
                    </div>

                    {/* Filter (only when requested) */}
                    {renderFilter(header.column)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleFlatColumns().length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedRowId === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`hover:bg-gray-100 transition-colors ${
                        onRowClick ? "cursor-pointer" : ""
                      }`}
                      onClick={() => {
                        onRowClick?.(row.original);
                        if (DetailComponent) toggleRowExpand(row.id);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                      {DetailComponent && (
                        <td className="px-2 py-4">
                          <ChevronRight
                            className={`w-5 h-5 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </td>
                      )}
                    </tr>

                    {/* Inline detail row */}
                    {DetailComponent && isExpanded && (
                      <tr>
                        <td
                          colSpan={
                            table.getVisibleFlatColumns().length +
                            (DetailComponent ? 1 : 0)
                          }
                          className="bg-gray-50 p-4"
                        >
                          <DetailComponent row={row.original} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
            <strong>{table.getPageCount()}</strong>
          </span>
          <span>|</span>
          <select
          title="select page"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<<"}
          </Button>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<"}
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {">"}
          </Button>
          <Button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {">>"}
          </Button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">
              Delete {selectedCount} {selectedCount === 1 ? "Item" : "Items"}?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

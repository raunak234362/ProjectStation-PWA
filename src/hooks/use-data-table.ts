import {
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type PaginationState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type Table,
    type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";

interface UseDataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    initialState?: {
        sorting?: SortingState;
        columnFilters?: ColumnFiltersState;
        columnVisibility?: VisibilityState;
        pagination?: PaginationState;
        globalFilter?: string;
    };
}

interface UseDataTableReturn<TData> {
    table: Table<TData>;
    state: {
        sorting: SortingState;
        columnFilters: ColumnFiltersState;
        columnVisibility: VisibilityState;
        pagination: PaginationState;
        globalFilter: string;
    };
    onSortingChange: (updaterOrValue: any) => void;
    onColumnFiltersChange: (updaterOrValue: any) => void;
    onColumnVisibilityChange: (updaterOrValue: any) => void;
    onPaginationChange: (updaterOrValue: any) => void;
    onGlobalFilterChange: (value: string) => void;
}

export function useDataTable<TData>({
    data,
    columns,
    initialState,
}: UseDataTableProps<TData>): UseDataTableReturn<TData> {
    const [sorting, setSorting] = useState<SortingState>(
        initialState?.sorting || []
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        initialState?.columnFilters || []
    );
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        initialState?.columnVisibility || {}
    );
    const [pagination, setPagination] = useState<PaginationState>(
        initialState?.pagination || { pageIndex: 0, pageSize: 10 }
    );
    const [globalFilter, setGlobalFilter] = useState<string>(
        initialState?.globalFilter || ""
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return {
        table,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
    };
}

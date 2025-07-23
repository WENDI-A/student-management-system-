"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2, RotateCcw, Search, MoreHorizontal } from "lucide-react";
import { useSnackbar } from "notistack";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onDelete?: (selectedRows: TData[]) => void;
    onUndo?: () => void;
    searchKey?: string;
    searchPlaceholder?: string;
    enableColumnVisibility?: boolean;
    enableSelection?: boolean;
    enableSearch?: boolean;
    enablePagination?: boolean;
    pageSize?: number;
    className?: string;
    emptyMessage?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onDelete,
    onUndo,
    searchKey,
    searchPlaceholder = "Search...",
    enableColumnVisibility = true,
    enableSelection = true,
    enableSearch = true,
    enablePagination = true,
    pageSize = 10,
    className = "",
    emptyMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [deletedRows, setDeletedRows] = React.useState<TData[]>([]);
    const [showUndoMessage, setShowUndoMessage] = React.useState(false);

    // Conditionally add selection column to the beginning of columns
    const columnsWithSelection = React.useMemo(() => {
        if (!enableSelection) return columns;

        const selectionColumn: ColumnDef<TData, any> = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        };

        return [selectionColumn, ...columns];
    }, [columns, enableSelection]);

    const table = useReactTable({
        data,
        columns: columnsWithSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        enableRowSelection: enableSelection,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [undoTimer, setUndoTimer] = React.useState<NodeJS.Timeout | null>(null);
    const [currentSnackbarId, setCurrentSnackbarId] = React.useState<string | number | null>(null);

    const handleDelete = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
        if (selectedRows.length === 0) return;

        // Clear any existing timer and snackbar
        if (undoTimer) {
            clearTimeout(undoTimer);
        }
        if (currentSnackbarId) {
            closeSnackbar(currentSnackbarId);
        }

        setDeletedRows(selectedRows);
        setShowUndoMessage(true);

        // Reset selection
        table.resetRowSelection();

        // Show snackbar with undo option
        const snackbarId = enqueueSnackbar(
            `${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} will be deleted in 5 seconds`,
            {
                variant: 'warning',
                persist: true,
                action: (key) => (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white/80 gap-1"
                        onClick={() => {
                            handleUndo();
                            closeSnackbar(key);
                        }}
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Undo
                    </Button>
                ),
            }
        );
        setCurrentSnackbarId(snackbarId);

        // Wait 5 seconds before actually calling the delete function
        const timer = setTimeout(() => {
            setShowUndoMessage(false);
            setDeletedRows([]);
            setUndoTimer(null);
            setCurrentSnackbarId(null);
            
            // Call onDelete callback after 5 seconds if not undone
            if (onDelete) {
                onDelete(selectedRows);
            }
            
            closeSnackbar(snackbarId);
            enqueueSnackbar(
                `${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} deleted`,
                { variant: 'success' }
            );
        }, 5000);
        
        setUndoTimer(timer);
    };

    const handleUndo = () => {
        // Clear the auto-hide timer
        if (undoTimer) {
            clearTimeout(undoTimer);
            setUndoTimer(null);
        }

        // Close the current snackbar
        if (currentSnackbarId) {
            closeSnackbar(currentSnackbarId);
            setCurrentSnackbarId(null);
        }

        setShowUndoMessage(false);

        // Call onUndo callback if provided
        if (onUndo) {
            onUndo();
        }

        // Show success message for undo
        enqueueSnackbar(
            `${deletedRows.length} item${deletedRows.length > 1 ? 's' : ''} deletion cancelled`,
            { variant: 'success' }
        );

        setDeletedRows([]);
    };

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (undoTimer) {
                clearTimeout(undoTimer);
            }
        };
    }, [undoTimer]);

    return (
        <div className={`space-y-3 sm:space-y-4 ${className}`}>
            {/* Mobile-first toolbar */}
            <div className="w-full space-y-3">
                {/* Search section - full width on mobile */}
                {enableSearch && searchKey && (
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(searchKey)?.setFilterValue(event.target.value)
                            }
                            className="pl-9 h-10 text-sm w-full"
                        />
                    </div>
                )}

                {/* Actions section */}
                <div className="w-full space-y-2">


                    {/* Action buttons - responsive grid */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        {enableSelection && onDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                                className="h-9 px-3 gap-2 text-sm w-full sm:w-auto"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete ({table.getFilteredSelectedRowModel().rows.length})</span>
                            </Button>
                        )}

                        {enableColumnVisibility && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 px-3 gap-2 text-sm w-full sm:w-auto"
                                    >
                                        <MoreHorizontal className="h-4 w-4 sm:hidden" />
                                        <span className="hidden sm:inline">Columns</span>
                                        <span className="sm:hidden">Columns</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs font-semibold">
                                        Toggle columns
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="max-h-48 overflow-y-auto">
                                        {table
                                            .getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize text-sm"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.id.replace(/([A-Z])/g, ' $1').trim()}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {/* Table container with improved mobile handling */}
            <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead 
                                            key={header.id} 
                                            className="whitespace-nowrap px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm font-semibold"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-b hover:bg-muted/30 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell 
                                                key={cell.id} 
                                                className="px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm"
                                            >
                                                <div className="max-w-[200px] sm:max-w-none truncate">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columnsWithSelection.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <div className="text-2xl opacity-30">📄</div>
                                            <p className="text-sm">{emptyMessage}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Enhanced pagination */}
            {enablePagination && (
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    {/* Results info */}
                    <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                        {enableSelection ? (
                            <span>
                                <span className="font-medium">{table.getFilteredSelectedRowModel().rows.length}</span> of{" "}
                                <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> row(s) selected
                            </span>
                        ) : (
                            <span>
                                Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of{" "}
                                <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> result(s)
                            </span>
                        )}
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center justify-between sm:justify-end space-x-2 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-9 px-3 flex-1 sm:flex-none text-sm"
                        >
                            <span>Previous</span>
                        </Button>
                        
                        {/* Page indicator - always visible but compact on mobile */}
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground min-w-0">
                            <span className="hidden sm:inline">Page</span>
                            <span className="font-medium">
                                {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1}
                            </span>
                            <span>of</span>
                            <span className="font-medium">{Math.max(table.getPageCount(), 0)}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-9 px-3 flex-1 sm:flex-none text-sm"
                        >
                            <span>Next</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
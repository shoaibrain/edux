"use client"

import * as React from "react"
import { useRouter } from "next/navigation";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTenant } from "@/components/tenant-provider";
import { toast } from "sonner";
import { getColumns, School } from "./columns" // Keep using the DB type here
import { SchoolFormDialog } from "./school-form-dialog"

interface SchoolsDataTableProps {
    data: School[]
}

export function SchoolsDataTable({ data }: SchoolsDataTableProps) {
    const router = useRouter();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const { user } = useTenant();
 
    const canCreateSchool = user.permissions.includes('school:create');
    const canEditSchool = user.permissions.includes('school:update');
    const canDeleteSchool = user.permissions.includes('school:delete');

    const handleDashboardView = React.useCallback((school: School) => {
        if (!canEditSchool) {
            toast.error("You do not have permission to edit schools.");
            return;
        }
        // Navigate directly to the edit page
        router.push(`/dashboard/schools/${school.id}`);
    }, [canEditSchool, router]);


    const handleEdit = React.useCallback((school: School) => {
        if (!canEditSchool) {
            toast.error("You do not have permission to edit schools.");
            return;
        }
        // Navigate directly to the edit page
        router.push(`/dashboard/schools/${school.id}/settings`);
    }, [canEditSchool, router]);

    const handleCreate = React.useCallback(() => {
        if (!canCreateSchool) {
            toast.error("You do not have permission to create schools.");
            return;
        }
        // Open the new, simple creation dialog
        setIsCreateDialogOpen(true);
    }, [canCreateSchool]);

    const columns = React.useMemo(() => getColumns(handleEdit, canEditSchool, canDeleteSchool), [handleEdit, canEditSchool, canDeleteSchool]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                {canCreateSchool && <Button onClick={handleCreate}>Create School</Button>}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No schools found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
            {canCreateSchool && (
                <SchoolFormDialog
                    isOpen={isCreateDialogOpen}
                    setIsOpen={setIsCreateDialogOpen}
                />
            )}
        </div>
    );
}

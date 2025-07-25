"use client"

import * as React from "react"
import {
  ColumnDef,
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
import { UserFormDialog } from "./user-form-dialog"
import { getColumns, User } from "./columns"
import type { roles } from "@/lib/db/schema/tenant"
import { useTenant } from "@/components/tenant-provider"
import { toast } from "sonner"

interface DataTableProps {
  data: User[]
  allRoles: (typeof roles.$inferSelect)[]
}

export function DataTable({ data, allRoles }: DataTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const { user } = useTenant(); // Access user permissions from context

  // Check permissions for UI rendering
  const canCreateUser = user.permissions.includes('user:create');
  const canEditUser = user.permissions.includes('user:update');
  const canDeleteUser = user.permissions.includes('user:delete');

  const handleEdit = React.useCallback((user: User) => {
    // Client-side guard for UI, server-side action will enforce
    if (!canEditUser) {
      toast.error("You do not have permission to edit users.");
      return;
    }
    setEditingUser(user);
    setIsDialogOpen(true);
  }, [canEditUser]);

  const handleCreate = React.useCallback(() => {
    // Client-side guard for UI, server-side action will enforce
    if (!canCreateUser) {
      toast.error("You do not have permission to create users.");
      return;
    }
    setEditingUser(null);
    setIsDialogOpen(true);
  }, [canCreateUser]);
  
  // Pass permissions to columns for conditional rendering of actions
  const columns = React.useMemo(() => getColumns(handleEdit, canEditUser, canDeleteUser), [handleEdit, canEditUser, canDeleteUser]);

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
  })

  return (
    <div>
        <div className="flex items-center justify-between py-4">
            <Input
                placeholder="Filter by email..."
                value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("email")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
            />
            {/* Conditionally render Create User button */}
            {canCreateUser && <Button onClick={handleCreate}>Create User</Button>}
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
                    No results.
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
      {/* Only render dialog if user has permission to create or edit */}
      {(canCreateUser || canEditUser) && ( 
        <UserFormDialog
          key={editingUser?.id} // Add key to force re-mount and reset form state
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          user={editingUser}
          allRoles={allRoles}
        />
      )}
    </div>
  )
}

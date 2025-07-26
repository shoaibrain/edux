"use client"

import * as React from "react"
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
// import { PersonFormDialog } from "./person-form-dialog"; // Corrected import
import { getColumns, Person } from "./columns"; 
import { useTenant } from "@/components/tenant-provider";
import { toast } from "sonner";
import type { schools, roles } from "@/lib/db/schema/tenant"; 

interface PeopleDataTableProps {
  data: Person[];
  allSchools: (typeof schools.$inferSelect)[];
  allRoles: (typeof roles.$inferSelect)[];
}

export function PeopleDataTable({ data, allSchools, allRoles }: PeopleDataTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPerson, setEditingPerson] = React.useState<Person | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const { user } = useTenant();

  // Permissions for UI rendering
  const canCreatePerson = user.permissions.includes('person:create');
  const canEditPerson = user.permissions.includes('person:update');
  const canDeletePerson = user.permissions.includes('person:delete');
  const canGrantAccess = user.permissions.includes('user:grant_access'); 
  const canAssignRoles = user.permissions.includes('user:assign_roles'); 

  const handleEdit = React.useCallback((person: Person) => {
    if (!canEditPerson) {
      toast.error("You do not have permission to edit people records.");
      return;
    }
    setEditingPerson(person);
    setIsDialogOpen(true);
  }, [canEditPerson]);

  const handleCreate = React.useCallback(() => {
    if (!canCreatePerson) {
      toast.error("You do not have permission to create people records.");
      return;
    }
    setEditingPerson(null);
    setIsDialogOpen(true);
  }, [canCreatePerson]);
  
  const columns = React.useMemo(() => getColumns(handleEdit, canEditPerson, canDeletePerson, canGrantAccess), [handleEdit, canEditPerson, canDeletePerson, canGrantAccess]);

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
                placeholder="Filter by first name..."
                value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("firstName")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
            />
            {canCreatePerson && <Button onClick={handleCreate}>Add Person</Button>}
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
                        No people found.
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
        {/* {(canCreatePerson || canEditPerson) && ( 
            <PersonFormDialog
                key={editingPerson?.id}
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                person={editingPerson}
                allSchools={allSchools}
                allRoles={allRoles}
                canGrantAccess={canGrantAccess}
                canAssignRoles={canAssignRoles}
            />
        )} */}
    </div>
  );
}

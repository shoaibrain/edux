"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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

import { getColumns, Role } from "./columns"
import { RoleFormDialog } from "./role-form-dialog"

interface RolesDataTableProps {
  data: Role[]
}

export function RolesDataTable({ data }: RolesDataTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);

  const handleEdit = React.useCallback((role: Role) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  }, []);

  const handleCreate = React.useCallback(() => {
    setEditingRole(null);
    setIsDialogOpen(true);
  }, []);
  
  const columns: ColumnDef<Role>[] = React.useMemo(() => getColumns(handleEdit), [handleEdit]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
        <div className="flex items-center justify-end py-4">
            <Button onClick={handleCreate}>Create Role</Button>
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
                    No roles found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
      <RoleFormDialog
        key={editingRole?.id}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        role={editingRole}
      />
    </div>
  )
}

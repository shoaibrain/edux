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
import { useTenant } from "@/components/tenant-provider"
import { toast } from "sonner"

interface RolesDataTableProps {
  data: Role[]
}

export function RolesDataTable({ data }: RolesDataTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);

  const { user } = useTenant(); // Access user permissions from context

  // Check permissions for UI rendering
  const canCreateRole = user.permissions.includes('role:create');
  const canEditRole = user.permissions.includes('role:update');
  const canDeleteRole = user.permissions.includes('role:delete');
  const canAssignRolePermissions = user.permissions.includes('role:assign_permissions');

  const handleEdit = React.useCallback((role: Role) => {
    // Client-side guard for UI, server-side action will enforce
    if (!canEditRole) {
      toast.error("You do not have permission to edit roles.");
      return;
    }
    setEditingRole(role);
    setIsDialogOpen(true);
  }, [canEditRole]);

  const handleCreate = React.useCallback(() => {
    // Client-side guard for UI, server-side action will enforce
    if (!canCreateRole) {
      toast.error("You do not have permission to create roles.");
      return;
    }
    setEditingRole(null);
    setIsDialogOpen(true);
  }, [canCreateRole]);
  
  // Pass permissions to columns for conditional rendering of actions
  const columns: ColumnDef<Role>[] = React.useMemo(() => getColumns(handleEdit, canEditRole, canDeleteRole), [handleEdit, canEditRole, canDeleteRole]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
        <div className="flex items-center justify-end py-4">
            {/* Conditionally render Create Role button */}
            {canCreateRole && <Button onClick={handleCreate}>Create Role</Button>}
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
      {/* Only render dialog if user has permission to create or edit */}
      {(canCreateRole || canEditRole) && ( 
        <RoleFormDialog
          key={editingRole?.id} // Add key to force re-mount and reset form state
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          role={editingRole}
          canAssignRolePermissions={canAssignRolePermissions} // Pass this down to control permission assignment UI
        />
      )}
    </div>
  )
}

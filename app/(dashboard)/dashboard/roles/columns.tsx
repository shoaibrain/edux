"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { deleteRole } from "@/lib/actions/role"
import type { roles, permissions } from "@/lib/db/schema/tenant" 
import { Badge } from "@/components/ui/badge" 

// Update Role type to include permissions as an array of the full permission objects,
// as returned by getRoles.
export type Role = (typeof roles.$inferSelect) & {
    permissions?: (typeof permissions.$inferSelect)[]; 
};

export const getColumns = (
    onEdit: (role: Role) => void, 
    canEditRole: boolean, 
    canDeleteRole: boolean 
): ColumnDef<Role>[] => [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "permissions", 
        header: "Permissions",
        cell: ({ row }) => {
            const role = row.original;
            return (
                <div className="flex flex-wrap gap-1">
                    {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map(perm => (
                            <Badge key={perm.id} variant="secondary">
                                {perm.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-xs">No permissions assigned</span>
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const role = row.original;

            const handleDelete = async () => {
                if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
                  const result = await deleteRole(role.id);
                  if (result.success) {
                    toast.success(result.message);
                  } else {
                    toast.error(result.message);
                  }
                }
            };

            if (!canEditRole && !canDeleteRole) {
                return null;
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {canEditRole && (
                            <DropdownMenuItem onClick={() => onEdit(role)}>
                                Edit Role
                            </DropdownMenuItem>
                        )}
                        {canEditRole && canDeleteRole && <DropdownMenuSeparator />}
                        {canDeleteRole && (
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                Delete Role
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

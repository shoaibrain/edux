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
import { deleteUserAction } from "@/lib/actions/user"
import { toast } from "sonner"

export type User = {
  id: number
  name: string
  email: string
  roles: string // This will be a comma-separated string of role names
}

export const getColumns = (
    onEdit: (user: User) => void,
    canEditUser: boolean, // New prop: indicates if the current user can edit ANY user
    canDeleteUser: boolean // New prop: indicates if the current user can delete ANY user
): ColumnDef<User>[] => [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "roles",
        header: "Roles",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original; // The user object for the current row
            
            const handleDelete = async () => {
                // Using window.confirm is generally discouraged in favor of custom dialogs
                // for better UX and consistency, but keeping it as per existing pattern.
                if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
                  const result = await deleteUserAction(user.id);
                  if (result.success) {
                    toast.success(result.message);
                  } else {
                    toast.error(result.message);
                  }
                }
            };

            // Only show the dropdown menu if the current user has either edit or delete permission
            if (!canEditUser && !canDeleteUser) {
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
                        {/* Conditionally render Edit User menu item */}
                        {canEditUser && (
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                Edit User
                            </DropdownMenuItem>
                        )}
                        {/* Add separator only if both edit and delete actions are available */}
                        {canEditUser && canDeleteUser && <DropdownMenuSeparator />}
                        {/* Conditionally render Delete User menu item */}
                        {canDeleteUser && (
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                Delete User
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

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
import { deletePersonAction } from "@/lib/actions/person" 
import type { people, users, schools, usersToRoles } from "@/lib/db/schema/tenant"; 

// Definitive Person type: extending Drizzle's inferred type with eager-loaded relations
export type Person = (typeof people.$inferSelect) & {
    user?: (typeof users.$inferSelect & { usersToRoles?: (typeof usersToRoles.$inferSelect)[] }) | null; 
    school?: typeof schools.$inferSelect | null; 
};

export const getColumns = (
    onEdit: (person: Person) => void, // onEdit strictly expects a Person object (database type)
    canEditPerson: boolean,
    canDeletePerson: boolean,
    canGrantAccess: boolean 
): ColumnDef<Person>[] => [
    {
        accessorKey: "firstName",
        header: "First Name",
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
    },
    {
        accessorKey: "personType",
        header: "Type",
    },
    {
        accessorKey: "school.name", 
        header: "School",
        cell: ({ row }) => {
            const person = row.original;
            return person.school ? person.school.name : "N/A";
        }
    },
    {
        accessorKey: "contactEmail",
        header: "Contact Email",
        cell: ({ row }) => {
            const person = row.original;
            return person.contactEmail || "-";
        }
    },
    {
        accessorKey: "user.email", 
        header: "System User",
        cell: ({ row }) => {
            const person = row.original;
            return person.user ? (
                <span className="font-medium text-green-600">Yes ({person.user.email})</span>
            ) : (
                <span className="text-muted-foreground">No</span>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const person = row.original;
            
            const handleDelete = async () => {
                if (window.confirm(`Are you sure you want to delete ${person.firstName} ${person.lastName}? This will also delete their associated system user account (if any), student, employee, and guardian records.`)) {
                  const result = await deletePersonAction(person.id);
                  if (result.success) {
                    toast.success(result.message);
                  } else {
                    toast.error(result.message);
                  }
                }
            };

            if (!canEditPerson && !canDeletePerson && !canGrantAccess) {
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
                        {canEditPerson && (
                            <DropdownMenuItem onClick={() => onEdit(person)}> {/* Pass person directly */}
                                Edit Person
                            </DropdownMenuItem>
                        )}
                        {/* Option to grant system access only if person doesn't have one and user has permission */}
                        {canGrantAccess && !person.user && (
                            <DropdownMenuItem onClick={() => onEdit(person)}> {/* Pass person directly */}
                                Grant System Access
                            </DropdownMenuItem>
                        )}
                        {(canEditPerson || (canGrantAccess && !person.user)) && canDeletePerson && <DropdownMenuSeparator />}
                        {canDeletePerson && (
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                Delete Person
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

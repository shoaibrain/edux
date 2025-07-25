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

import type { schools } from "@/lib/db/schema/tenant"; // Import the schools schema for typing
import { deleteSchoolAction } from "@/lib/actions/schools"

export type School = typeof schools.$inferSelect; // Type for a school record

export const getColumns = (
    onEdit: (school: School) => void,
    canEditSchool: boolean,
    canDeleteSchool: boolean
): ColumnDef<School>[] => [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
            const school = row.original;
            return school.website ? (
                <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {school.website}
                </a>
            ) : "-";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const school = row.original;
            
            const handleDelete = async () => {
                if (window.confirm(`Are you sure you want to delete school "${school.name}"?`)) {
                  const result = await deleteSchoolAction(school.id);
                  if (result.success) {
                    toast.success(result.message);
                  } else {
                    toast.error(result.message);
                  }
                }
            };

            if (!canEditSchool && !canDeleteSchool) {
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
                        {canEditSchool && (
                            <DropdownMenuItem onClick={() => onEdit(school)}>
                                Edit School
                            </DropdownMenuItem>
                        )}
                        {canEditSchool && canDeleteSchool && <DropdownMenuSeparator />}
                        {canDeleteSchool && (
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                Delete School
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

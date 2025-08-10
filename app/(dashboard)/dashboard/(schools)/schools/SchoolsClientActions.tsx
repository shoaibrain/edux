// app/dashboard/schools/SchoolsClientActions.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SchoolFormDialog } from "./school-form-dialog";

interface SchoolsClientActionsProps {
  canCreateSchool: boolean;
  canEditSchool: boolean;
  canDeleteSchool: boolean;
  showCreateButton?: boolean;
}

export function SchoolsClientActions({ 
  canCreateSchool, 
  canEditSchool, 
  canDeleteSchool,
  showCreateButton = false 
}: SchoolsClientActionsProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreate = useCallback(() => {
    if (!canCreateSchool) {
      toast.error("You do not have permission to create schools.");
      return;
    }
    setIsCreateDialogOpen(true);
  }, [canCreateSchool]);

  if (showCreateButton) {
    return (
      <>
        <Button onClick={handleCreate} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create School
        </Button>
        {canCreateSchool && (
          <SchoolFormDialog
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button onClick={handleCreate}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create School
      </Button>
      {canCreateSchool && (
        <SchoolFormDialog
          isOpen={isCreateDialogOpen}
          setIsOpen={setIsCreateDialogOpen}
        />
      )}
    </>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ClassFormDialog } from './class-form-dialog';
import { Prerequisites } from '@/lib/dto/class';
import { getPrerequisitesForClassForm } from '@/lib/actions/class';

interface ClassClientActionsProps {
  schoolId: number;
  initialPrerequisites: Prerequisites;
}

export function ClassClientActions({ schoolId, initialPrerequisites }: ClassClientActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [prerequisites, setPrerequisites] = useState(initialPrerequisites);

  // This function will be called by the sub-dialogs to refresh the dropdown data
  const handleDataRefresh = useCallback(async () => {
    const refreshedData = await getPrerequisitesForClassForm(schoolId);
    setPrerequisites(refreshedData);
  }, [schoolId]);

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Class
      </Button>
      <ClassFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        schoolId={schoolId}
        prerequisites={prerequisites}
        onDataRefresh={handleDataRefresh}
      />
    </>
  );
}
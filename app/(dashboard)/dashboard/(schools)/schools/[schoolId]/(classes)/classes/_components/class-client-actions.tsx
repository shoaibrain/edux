'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, TestTube } from 'lucide-react';
import { ClassFormDialog } from './class-form-dialog';
import { SchedulerTestDialog } from './scheduler-test-dialog';
import { Prerequisites } from '@/lib/dto/class';
import { getPrerequisitesForClassForm } from '@/lib/actions/class';

interface ClassClientActionsProps {
  schoolId: number;
  initialPrerequisites: Prerequisites;
}

export function ClassClientActions({ schoolId, initialPrerequisites }: ClassClientActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSchedulerTestOpen, setIsSchedulerTestOpen] = React.useState(false);
  const [prerequisites, setPrerequisites] = useState(initialPrerequisites);

  // This function will be called by the sub-dialogs to refresh the dropdown data
  const handleDataRefresh = useCallback(async () => {
    const refreshedData = await getPrerequisitesForClassForm(schoolId);
    setPrerequisites(refreshedData);
  }, [schoolId]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsSchedulerTestOpen(true)}
          className="flex items-center gap-2"
        >
          <TestTube className="mr-2 h-4 w-4" />
          Test Scheduler
        </Button>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>
      
      <ClassFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        schoolId={schoolId}
        academicTerms={prerequisites.academicTerms.map(term => ({ 
          id: term.id, 
          name: `${term.termName} (${term.yearName})` 
        }))}
        subjects={prerequisites.subjects}
        teachers={prerequisites.teachers}
        gradeLevels={prerequisites.gradeLevels}
        locations={prerequisites.locations}
      />
      
      <SchedulerTestDialog
        isOpen={isSchedulerTestOpen}
        setIsOpen={setIsSchedulerTestOpen}
        schoolId={schoolId}
      />
    </>
  );
}
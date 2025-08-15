'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ClassFormDialog } from './class-form-dialog';
import type { Prerequisites } from '@/lib/dto/class-ui';

interface ClassClientActionsProps {
  schoolId: string;
  initialPrerequisites: Prerequisites;
}

export function ClassClientActions({ schoolId, initialPrerequisites }: ClassClientActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prerequisites] = useState(initialPrerequisites);

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Class Period
      </Button>
      <ClassFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        schoolId={schoolId}
        prerequisites={prerequisites}
      />
    </>
  );
}
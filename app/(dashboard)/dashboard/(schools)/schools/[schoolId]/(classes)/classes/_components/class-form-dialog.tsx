'use client';

import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RRule } from 'rrule';

import { ClassFormSchema, ClassFormInput } from '@/lib/dto/class';


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RecurrenceRuleBuilder } from './recurrence-rule-builder';
import { Separator } from '@/components/ui/separator';

// Define types for props passed from the server component
type SelectOption = {
  id: number;
  name: string;
};

type TeacherOption = {
    id: number;
    firstName: string;
    lastName: string;
}

interface ClassFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  schoolId: number;
  classData?: ClassFormInput | null;
  academicTerms: SelectOption;
  subjects: SelectOption;
  teachers: TeacherOption;
  gradeLevels: SelectOption;
  locations: SelectOption;
}

export function ClassFormDialog({
  isOpen,
  setIsOpen,
  schoolId,
  classData,
  academicTerms,
  subjects,
  teachers,
  gradeLevels,
  locations,
}: ClassFormDialogProps) {
  const isEditMode =!!classData;

  const defaultValues = useMemo(() => ({
    id: classData?.id,
    schoolId: schoolId,
    name: classData?.name || '',
    academicTermId: classData?.academicTermId,
    subjectId: classData?.subjectId,
    teacherId: classData?.teacherId,
    gradeLevelId: classData?.gradeLevelId,
    locationId: classData?.locationId,
    isRecurring: classData?.isRecurring || false,
    startTime: classData?.startTime || '09:00',
    endTime: classData?.endTime || '10:00',
    rrule: classData?.rrule || `DTSTART:${new Date().toISOString().split('T')}T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`,
  }), [classData, schoolId]);

  const form = useForm<ClassFormInput>({
    resolver: zodResolver(ClassFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: ClassFormInput) => {
    const result = await upsertClassAction(values);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      form.reset();
    } else {
      toast.error(result.message);
      if (result.errors) {
        Object.keys(result.errors).forEach((key) => {
          const field = key as keyof ClassFormInput;
          const message = result.errors?.[field]?.;
          if (message) {
            form.setError(field, { type: 'server', message });
          }
        });
      }
    }
  };

  const isRecurring = form.watch('isRecurring');

  // **THE FIX for the infinite loop**
  // Memoize the handler to ensure its reference is stable across re-renders.
  const handleRruleChange = useCallback((rruleString: string) => {
    form.setValue('rrule', rruleString, { shouldValidate: true });
  }, [form]); // The 'form' object from RHF is stable and won't cause re-creation.

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode? 'Edit Class' : 'Create New Class'}</DialogTitle>
          <DialogDescription>
            {isEditMode? "Update the class details below." : "Fill in the details for the new class schedule."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Algebra I - Period 1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="academicTermId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Term</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a term" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {academicTerms.map(term => <SelectItem key={term.id} value={String(term.id)}>{term.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="subjectId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {subjects.map(subject => <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="teacherId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {teachers.map(teacher => <SelectItem key={teacher.id} value={String(teacher.id)}>{`${teacher.firstName} ${teacher.lastName}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gradeLevelId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Level (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a grade level" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {gradeLevels.map(grade => <SelectItem key={grade.id} value={String(grade.id)}>{grade.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="locationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {locations.map(location => <SelectItem key={location.id} value={String(location.id)}>{location.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Separator />
            <div className="space-y-4">
               <FormField control={form.control} name="isRecurring" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                          <FormLabel className="text-base">Recurring Class</FormLabel>
                          <DialogDescription>Does this class repeat on a regular schedule?</DialogDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )} />
              {isRecurring? (
                <FormField control={form.control} name="rrule" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Rule</FormLabel>
                    <FormControl>
                      <RecurrenceRuleBuilder initialValue={field.value?? undefined} onChange={handleRruleChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ) : (
                <p className="text-sm text-muted-foreground p-4 border rounded-md">This will be a single, one-time class session.</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting? 'Saving...' : isEditMode? 'Save Changes' : 'Create Class'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
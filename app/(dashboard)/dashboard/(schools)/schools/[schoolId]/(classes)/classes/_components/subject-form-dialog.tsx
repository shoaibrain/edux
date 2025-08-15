'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubjectFormSchema, SubjectFormInput } from '@/lib/dto/subject';
import { upsertSubjectAction } from '@/lib/actions/subject';
import { departments } from '@/lib/db/schema/tenant';

interface SubjectFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  schoolId: number;
  departments: (typeof departments.$inferSelect)[];
  onSubjectCreated: () => Promise<void>; // Callback to refresh data
}

export function SubjectFormDialog({ isOpen, setIsOpen, schoolId, departments, onSubjectCreated }: SubjectFormDialogProps) {
  const form = useForm<SubjectFormInput>({
    resolver: zodResolver(SubjectFormSchema),
    defaultValues: {
      schoolId: schoolId,
      name: '',
      subjectCode: '',
      
    },
  });

  const onSubmit = async (values: SubjectFormInput) => {
    const result = await upsertSubjectAction(values);
    if (result.success) {
      toast.success(result.message);
      await onSubjectCreated(); // Await the refetch
      setIsOpen(false);
      form.reset();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>Create a new subject for your school.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., Biology 101" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="subjectCode" render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Code (Optional)</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., SCI-101" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="departmentId" render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                  <SelectContent>{departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Create Subject'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
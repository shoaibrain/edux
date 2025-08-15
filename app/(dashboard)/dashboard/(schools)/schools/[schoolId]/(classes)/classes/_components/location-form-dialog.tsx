'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { LocationFormSchema, LocationFormInput } from '@/lib/dto/location';
import { upsertLocationAction } from '@/lib/actions/location';

interface LocationFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  schoolId: number;
  onLocationCreated: () => Promise<void>; // Callback to refresh data
}

export function LocationFormDialog({ isOpen, setIsOpen, schoolId, onLocationCreated }: LocationFormDialogProps) {
  const form = useForm<LocationFormInput>({
    resolver: zodResolver(LocationFormSchema),
    defaultValues: {
      schoolId: schoolId,
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: LocationFormInput) => {
    const result = await upsertLocationAction(values);
    if (result.success) {
      toast.success(result.message);
      await onLocationCreated();
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
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>Add a classroom, lab, or other location.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., Room 201B" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl><Textarea {...field} placeholder="e.g., Science Lab with 30 stations" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Create Location'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
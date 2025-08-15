'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { ClassPeriodFormSchema, type ClassPeriodFormInput, type Prerequisites } from '@/lib/dto/class-ui';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecurrenceRuleBuilder } from './recurrence-rule-builder';

interface ClassFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  schoolId: string;
  prerequisites: Prerequisites;
}

export function ClassFormDialog({ isOpen, setIsOpen, schoolId, prerequisites }: ClassFormDialogProps) {
  const defaultValues = useMemo<ClassPeriodFormInput>(() => ({
    schoolId,
    name: '',
    academicTermId: prerequisites.academicTerms[0]?.id ?? '',
    subjectId: prerequisites.subjects[0]?.id ?? '',
    teacherId: prerequisites.teachers[0]?.id ?? '',
    gradeLevelId: prerequisites.gradeLevels[0]?.id ?? undefined,
    locationId: prerequisites.locations[0]?.id ?? undefined,
    departmentId: prerequisites.departments[0]?.id ?? '',
    isRecurring: false,
    startTime: '09:00',
    endTime: '10:00',
    rrule: undefined,
  }), [schoolId, prerequisites]);

  const form = useForm<ClassPeriodFormInput>({
    resolver: zodResolver(ClassPeriodFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // Filter subjects by selected department (if mapping exists)
  const selectedDepartmentId = form.watch('departmentId');
  const filteredSubjects = useMemo(() => {
    if (!selectedDepartmentId) return prerequisites.subjects;
    return prerequisites.subjects.filter((s) => !s.departmentId || s.departmentId === selectedDepartmentId);
  }, [selectedDepartmentId, prerequisites.subjects]);

  const selectedTermId = form.watch('academicTermId');
  const termStartDate = useMemo(() => {
    const term = prerequisites.academicTerms.find((t) => t.id === selectedTermId);
    return term?.startDate ? new Date(term.startDate) : undefined;
  }, [selectedTermId, prerequisites.academicTerms]);

  const isRecurring = form.watch('isRecurring');

  const onSubmit = (values: ClassPeriodFormInput) => {
    // UI-only: just log and toast
    // eslint-disable-next-line no-console
    console.log('Class Period Form Submitted:', values);
    toast.success('Form data logged to console');
    setIsOpen(false);
    form.reset(defaultValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Class Period</DialogTitle>
          <DialogDescription>Provide class details and scheduling.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Class Information</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Algebra I - Section A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="departmentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prerequisites.departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="subjectId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="teacherId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prerequisites.teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{`${t.firstName} ${t.lastName}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="academicTermId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Term</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prerequisites.academicTerms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.yearName ? `${term.name} (${term.yearName})` : term.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="gradeLevelId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prerequisites.gradeLevels.map((g) => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="locationId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prerequisites.locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="isRecurring" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring</FormLabel>
                      <DialogDescription>Create a repeating schedule for this class.</DialogDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />

                {isRecurring ? (
                  <FormField control={form.control} name="rrule" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence</FormLabel>
                      <FormControl>
                        <RecurrenceRuleBuilder
                          initialValue={field.value ?? undefined}
                          onChange={(rr) => form.setValue('rrule', rr, { shouldValidate: true })}
                          startDate={termStartDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <p className="text-sm text-muted-foreground p-4 border rounded-md">
                    This will be a single, one-time class session.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PersonFormSchema, PersonFormInput } from '@/lib/dto/person';
import { upsertPersonAction } from '@/lib/actions/person';
import type { schools, roles, people, usersToRoles, users } from "@/lib/db/schema/tenant";
import { useTenant } from '@/components/tenant-provider';

export type Person = (typeof people.$inferSelect) & {
    user?: (typeof users.$inferSelect & { usersToRoles?: (typeof usersToRoles.$inferSelect)[] }) | null;
    school?: typeof schools.$inferSelect | null;
};

interface PersonFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  person: Person | null;
  allSchools: (typeof schools.$inferSelect)[];
  allRoles: (typeof roles.$inferSelect)[];
  canGrantAccess: boolean;
  canAssignRoles: boolean;
}

export function PersonFormDialog({ isOpen, setIsOpen, person, allSchools, allRoles, canGrantAccess, canAssignRoles }: PersonFormDialogProps) {
  const isEditMode = !!person;
  const { user: currentUserSession } = useTenant();

  const roleOptions = allRoles.map(role => ({
    value: role.id.toString(),
    label: role.name,
  }));

  const defaultUserRoles = person?.user?.usersToRoles?.map(ur => ur.roleId.toString()) || [];

  const form = useForm<PersonFormInput>({
    resolver: zodResolver(PersonFormSchema),
    defaultValues: {
      id: person?.id,
      schoolId: person?.schoolId,
      firstName: person?.firstName || '',
      lastName: person?.lastName || '',
      middleName: person?.middleName,
      dateOfBirth: person?.dateOfBirth ? new Date(person.dateOfBirth).toISOString().split('T')[0] : '',
      gender: person?.gender,
      contactEmail: person?.contactEmail,
      contactPhone: person?.contactPhone,
      address: person?.address,
      personType: person?.personType || 'staff',
      profilePictureUrl: person?.profilePictureUrl,
      createUserAccount: !!person?.user,
      userEmail: person?.user?.email || '',
      userPassword: '',
      userRoles: defaultUserRoles,
    },
  });

  const onSubmit = async (values: PersonFormInput) => {
    const result = await upsertPersonAction(values);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    } else {
      toast.error(result.message);
      if (result.errors) {
        Object.keys(result.errors).forEach((key) => {
          const field = key as keyof PersonFormInput;
          const message = result.errors?.[field]?.[0];
          if (message) {
            form.setError(field, { type: 'server', message });
          }
        });
      }
    }
  };

  const createUserAccount = form.watch('createUserAccount');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Person' : 'Add New Person'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the person's details below." : "Fill in the details for the new person."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a person type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a school" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {allSchools.map(school => (
                                <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {canGrantAccess && (
                <div className="space-y-4 pt-4 border-t">
                    <FormField
                        control={form.control}
                        name="createUserAccount"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Grant System Access</FormLabel>
                                    <DialogDescription>
                                        Create a user account for this person to allow them to log in.
                                    </DialogDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {createUserAccount && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                             <FormField
                                control={form.control}
                                name="userEmail"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>User Email</FormLabel>
                                    <FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="userPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder={isEditMode ? "Leave blank to keep current" : ""} {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {canAssignRoles && (
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="userRoles"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Roles</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={roleOptions}
                                                    defaultValue={field.value || []}
                                                    onValueChange={field.onChange}
                                                    placeholder="Select roles..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}


            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Person'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

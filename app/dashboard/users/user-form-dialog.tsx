"use client";

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
import { UserFormSchema, UserFormInput } from '@/lib/dto/user';
import { upsertUserAction } from '@/lib/actions/user';
import type { roles } from '@/lib/db/schema/tenant';
import type { User } from './columns';

interface UserFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User | null;
  allRoles: (typeof roles.$inferSelect)[];
}

export function UserFormDialog({ isOpen, setIsOpen, user, allRoles }: UserFormDialogProps) {
  const isEditMode = !!user;

  const roleOptions = allRoles.map(role => ({
    value: role.id.toString(),
    label: role.name,
  }));

  const userRoleValues = user ? user.roles.split(', ').filter(Boolean).map(roleName => {
    const role = allRoles.find(r => r.name === roleName);
    return role ? role.id.toString() : '';
  }).filter(Boolean) : [];

  const form = useForm<UserFormInput>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      id: user?.id,
      name: user?.name || '',
      email: user?.email || '',
      password: '', // Always start with an empty password field
      roles: userRoleValues,
    },
  });

  const onSubmit = async (values: UserFormInput) => {
    const dataToSend = { ...values };
    if (isEditMode && !dataToSend.password) {
      delete dataToSend.password;
    }

    const result = await upsertUserAction(dataToSend);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    } else {
      toast.error(result.message);
      if (result.errors?.email) {
        form.setError('email', { type: 'server', message: result.errors.email[0] });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the user's details below." : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder={isEditMode ? "Leave blank to keep current" : ""} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                   <FormControl>
                      <MultiSelect
                        options={roleOptions}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select roles..."
                      />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

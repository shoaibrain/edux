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
import { RoleFormSchema, RoleFormInput } from '@/lib/dto/role';
import { upsertRole } from '@/lib/actions/role';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Role } from './columns';

interface RoleFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role: Role | null;
}

export function RoleFormDialog({ isOpen, setIsOpen, role }: RoleFormDialogProps) {
  const isEditMode = !!role;

  const form = useForm<RoleFormInput>({
    resolver: zodResolver(RoleFormSchema),
    // We explicitly handle the possibility of `null` from the database
    // and provide default values that match the schema (`string` or `undefined`).
    defaultValues: {
        id: role?.id,
        name: role?.name || '',
        description: role?.description || '',
    },
  });

  const onSubmit = async (values: RoleFormInput) => {
    const result = await upsertRole(values);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the role's details below." : "Fill in the details to create a new role."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Teacher" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Can manage courses and students" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Role'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
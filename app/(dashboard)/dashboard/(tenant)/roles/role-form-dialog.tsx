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
import { upsertRole, getRoles } from '@/lib/actions/role'; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Role } from './columns';
import { MultiSelect } from '@/components/ui/multi-select'; 
import type { permissions } from '@/lib/db/schema/tenant';

interface RoleFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role: Role | null;
  canAssignRolePermissions: boolean; 
}

export function RoleFormDialog({ isOpen, setIsOpen, role, canAssignRolePermissions }: RoleFormDialogProps) {
  const isEditMode = !!role;
  const [allPermissions, setAllPermissions] = React.useState<Array<typeof permissions.$inferSelect>>([]); // Explicitly type the state
  const [isLoadingPermissions, setIsLoadingPermissions] = React.useState(true);

  React.useEffect(() => {
    async function fetchPermissions() {
      setIsLoadingPermissions(true);
      try {
        const allRolesWithPermissions = await getRoles(); 
        const uniquePermissions = new Map<number, typeof permissions.$inferSelect>(); // Explicitly type the Map
        allRolesWithPermissions.forEach(r => {
            r.permissions?.forEach((p: typeof permissions.$inferSelect) => { // Explicitly type 'p' here
                if (!uniquePermissions.has(p.id)) {
                    uniquePermissions.set(p.id, p);
                }
            });
        });
        setAllPermissions(Array.from(uniquePermissions.values()));
      } catch (error) {
        toast.error("Failed to load permissions.");
        console.error("Failed to load permissions:", error);
      } finally {
        setIsLoadingPermissions(false);
      }
    }
    if (isOpen && canAssignRolePermissions) { 
      fetchPermissions();
    }
  }, [isOpen, canAssignRolePermissions]);

  const permissionOptions = allPermissions.map(perm => ({
    value: perm.name, 
    label: perm.name,
  }));

  // Use React.useMemo to memoize defaultSelectedPermissions
  const defaultSelectedPermissions = React.useMemo(() => {
    return role?.permissions?.map(p => p.name) || [];
  }, [role]); // Dependency array for useMemo

  const form = useForm<RoleFormInput>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
        id: role?.id,
        name: role?.name || '',
        description: role?.description || '',
        permissions: defaultSelectedPermissions, 
    },
  });

  React.useEffect(() => {
    form.reset({
      id: role?.id,
      name: role?.name || '',
      description: role?.description || '',
      permissions: defaultSelectedPermissions,
    });
  }, [role, defaultSelectedPermissions, form]);


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
                {canAssignRolePermissions && !isLoadingPermissions && (
                    <FormField
                        control={form.control}
                        name="permissions"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Permissions</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={permissionOptions}
                                        defaultValue={field.value as string[]} 
                                        onValueChange={field.onChange}
                                        placeholder="Select permissions..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
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

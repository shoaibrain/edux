"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SchoolFormSchema, SchoolFormInput } from '@/lib/dto/school'; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { School } from './columns'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { upsertSchoolAction } from '@/lib/actions/schools';

interface SchoolFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  school: School | null;
}

export function SchoolFormDialog({ isOpen, setIsOpen, school }: SchoolFormDialogProps) {
  const isEditMode = !!school;

  const form = useForm<SchoolFormInput>({
    resolver: zodResolver(SchoolFormSchema),
    defaultValues: {
        id: school?.id,
        name: school?.name || '',
        address: school?.address || '',
        phone: school?.phone || '',
        email: school?.email || '',
        website: school?.website || '',
        logoUrl: school?.logoUrl || '',
        // Initialize brandingJson as an empty object to strictly match its DTO type (Record<string, unknown>)
        brandingJson: school?.brandingJson && typeof school.brandingJson === 'object' && school.brandingJson !== null
                      ? school.brandingJson as Record<string, unknown>
                      : {}, 
    },
  });

  React.useEffect(() => {
    form.reset({
      id: school?.id,
      name: school?.name || '',
      address: school?.address || '',
      phone: school?.phone || '',
      email: school?.email || '',
      website: school?.website || '',
      logoUrl: school?.logoUrl || '',
      // Ensure brandingJson reset value is an object for the form state
      brandingJson: school?.brandingJson && typeof school.brandingJson === 'object' && school.brandingJson !== null
                    ? school.brandingJson as Record<string, unknown>
                    : {},
    });
  }, [school, form]);


  const onSubmit: SubmitHandler<SchoolFormInput> = async (values) => {
    const dataToSend = { ...values };

    // Handle brandingJson: it is stored as an object in the form state
    // but the Textarea displays its stringified version.
    // We need to parse the string from the Textarea back to an object for submission.
    if (typeof dataToSend.brandingJson === 'string') { // It will be a string from the textarea's onChange
        //@ts-expect-error('expected)
        if (dataToSend.brandingJson.trim() !== '') {
            try {
                dataToSend.brandingJson = JSON.parse(dataToSend.brandingJson);
            } catch (error) {
                form.setError('brandingJson', { type: 'manual', message: 'Invalid JSON format for Branding JSON.' });
                toast.error('Invalid JSON format for Branding JSON.');
                return; 
            }
        } else {
            dataToSend.brandingJson = {}; // If empty string, send as empty object
        }
    } else if (dataToSend.brandingJson === null || dataToSend.brandingJson === undefined) {
        dataToSend.brandingJson = {}; // Ensure it's an empty object if null/undefined
    }
    // If it's already an object (e.g., in edit mode, it came directly from school.brandingJson), do nothing.


    const result = await upsertSchoolAction(dataToSend);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    } else {
      toast.error(result.message);
      if (result.errors?.name) { 
        form.setError('name', { type: 'server', message: result.errors.name[0] });
      }
      if (result.errors) { 
        form.setError('email', { type: 'server', message: JSON.stringify(result.errors) });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit School' : 'Create New School'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the school's details below." : "Fill in the details to create a new school."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">

                {/* Basic Information */}
                <Card className="shadow-none border-none">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                        <FormDescription>General details about the school.</FormDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>School Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Northwood High School" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Contact Details */}
                <Card className="shadow-none border-none">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg">Contact Details</CardTitle>
                        <FormDescription>How to reach the school.</FormDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., +1 (555) 123-4567" {...field} value={field.value || ''} />
                                        </FormControl>
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
                                        <FormControl>
                                            <Input type="email" placeholder="e.g., info@school.com" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., https://www.school.com" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card className="shadow-none border-none">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg">Branding</CardTitle>
                        <FormDescription>Visual identity and custom settings.</FormDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <FormField
                            control={form.control}
                            name="logoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., https://www.school.com/logo.png" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="brandingJson"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branding JSON (Advanced)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder='e.g., {"primaryColor": "#007bff", "fontFamily": "Inter"}' 
                                            // Ensure value is a stringified JSON for the textarea
                                            value={typeof field.value === 'object' && field.value !== null 
                                                    ? JSON.stringify(field.value, null, 2) 
                                                    : '{}'} 
                                            onChange={(e) => {
                                                // When Textarea changes, update form state.
                                                // The value is stored as a string in the form state for this field.
                                                // It will be parsed back to an object in onSubmit.
                                                field.onChange(e.target.value); 
                                            }}
                                            rows={5} 
                                            className="font-mono" 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter custom branding settings in JSON format. This will be parsed on save.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <DialogFooter className="pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save School'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

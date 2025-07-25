'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TenantSignupInput, TenantSignupDto } from '@/lib/dto/tenant';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import Link from 'next/link'; // Import Link for navigation

export default function SignupPage() {
  const [message, setMessage] = useState('');
  const form = useForm<TenantSignupInput>({
    resolver: zodResolver(TenantSignupDto),
    defaultValues: {
      orgName: '',
      tenantId: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  const onSubmit = async (data: TenantSignupInput) => {
    setMessage(''); // Clear previous messages
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Tenant "${data.orgName}" created successfully! Redirecting...`);
        // Redirect to the new tenant's dashboard
        // Note: In a production environment, you might want a more robust redirect
        // that handles dynamic subdomains or custom domains.
        window.location.href = `http://${data.tenantId}.localhost:3000/dashboard`;
      } else {
        setMessage(result.error || 'Error creating tenant');
        toast.error(result.error || 'Error creating tenant');
        // If there are specific validation errors from the backend, set them on the form
        if (result.details) {
          result.details.issues.forEach((issue: { path: (string | number)[]; message: string; }) => {
            if (issue.path && issue.path.length > 0) {
              // Assuming path[0] is the field name (e.g., 'tenantId')
              form.setError(issue.path[0] as keyof TenantSignupInput, {
                type: 'server',
                message: issue.message,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Signup request failed:', error);
      setMessage('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Tenant Signup</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., EduX Academy" {...field} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Tenant ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., edux-academy (lowercase, no spaces)" {...field} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Admin Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Admin Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., admin@example.com" {...field} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Admin Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 8 characters" {...field} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Creating Tenant...' : 'Sign Up'}
            </Button>
            {message && <p className="mt-4 text-center text-red-400">{message}</p>}
          </form>
        </Form>
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

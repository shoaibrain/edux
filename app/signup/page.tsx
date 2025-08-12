// app/signup/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TenantSignupInput, TenantSignupDto } from '@/lib/dto/tenant';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { rootDomain } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // Initialize useRouter

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

  const { isSubmitting, errors } = form.formState;

  const onSubmit = async (data: TenantSignupInput) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Account for "${data.orgName}" created! Please verify your email.`);
        // Redirect to the verification page with email and tenantId
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}&tenantId=${encodeURIComponent(result.tenantId)}`);
      } else {
        toast.error(result.error || 'Error creating tenant');
        if (res.status === 409) {
          form.setError('tenantId', {
            type: 'server',
            message: result.error,
          });
        } else if (result.details) {
          result.details.issues.forEach((issue: { path: (string | number)[]; message: string; }) => {
            if (issue.path && issue.path.length > 0) {
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
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create your School</h1>
          <p className="text-gray-500 dark:text-gray-400">Start your 14-day free trial today.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orgName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., EduX Academy" {...field} />
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
                    <FormLabel>Subdomain</FormLabel>
                    <div className="flex items-center">
                      <FormControl>
                        <Input 
                          placeholder="your-school" 
                          {...field} 
                          className={cn("rounded-r-none", errors.tenantId && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </FormControl>
                      <span className={cn("inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm h-10", errors.tenantId && "border-red-500")}>
                        .{rootDomain}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., admin@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" {...field} />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

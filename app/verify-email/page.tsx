// app/verify-email/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';

const VerifyEmailSchema = z.object({
  token: z.string().length(6, 'Verification code must be 6 digits.'),
});

type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

function VerifyEmailComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const tenantId = searchParams.get('tenantId');

  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: { token: '' },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!email || !tenantId) {
      toast.error('Invalid verification link. Please sign up again.');
      router.push('/signup');
    }
  }, [email, tenantId, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenantId }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setTimer(60); // Reset timer
      } else {
        toast.error(result.error || 'Failed to resend code.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: VerifyEmailInput) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: data.token, tenantId }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Verification successful! Redirecting to login...');
        router.push('/login');
      } else {
        toast.error(result.error || 'Verification failed.');
        form.setError('token', { type: 'server', message: result.error || 'Invalid code' });
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  if (!email || !tenantId) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Check your email</h1>
          <p className="text-gray-500 dark:text-gray-400">We have sent a 6-digit code to {email}.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="_ _ _ _ _ _" {...field} className="text-center tracking-[1em]" maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Verifying...' : 'Verify Account'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {timer > 0 ? (
              <p>You can resend the code in {timer}s</p>
            ) : (
              <p>
                Did not receive a code?{' '}
                <Button variant="link" onClick={handleResendCode} disabled={isResending} className="p-0 h-auto">
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Use Suspense to handle client-side rendering of search params
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailComponent />
        </Suspense>
    );
}

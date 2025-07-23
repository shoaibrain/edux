'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TenantSignupInput, TenantSignupDto } from '@/lib/dto/tenant';
import { useState } from 'react';
// useRouter was removed as it was unused.

export default function SignupPage() {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<TenantSignupInput>({
    resolver: zodResolver(TenantSignupDto),
  });

  const onSubmit = async (data: TenantSignupInput) => {
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setMessage(`Tenant created! Redirecting to your dashboard...`);
      // Redirect to the new tenant's dashboard
      window.location.href = `http://${data.tenantId}.localhost:3000/dashboard`;
    } else {
      setMessage(result.error || 'Error creating tenant');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Tenant Signup</h1>
        {/* ... rest of the form ... */}
      </form>
    </div>
  );
}
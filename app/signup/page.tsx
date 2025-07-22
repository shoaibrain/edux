// app/signup/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TenantSignupInput, TenantSignupDto } from '@/lib/dto/tenant';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();
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
      setMessage(`Tenant created! Redirecting to dashboard...`);
      // Redirect to tenant dashboard (add to /etc/hosts first)
      window.location.href = `http://${data.tenantId}.localhost:3000/dashboard`;
    } else {
      setMessage(result.error || 'Error creating tenant');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Tenant Signup</h1>
        <input {...register('orgName')} placeholder="Organization Name" className="mb-2 p-2 border w-full" />
        {errors.orgName && <p className="text-red-500">{errors.orgName.message}</p>}
        <input {...register('tenantId')} placeholder="Tenant ID (e.g., plano-isd)" className="mb-2 p-2 border w-full" />
        {errors.tenantId && <p className="text-red-500">{errors.tenantId.message}</p>}
        <input {...register('adminName')} placeholder="Admin Name" className="mb-2 p-2 border w-full" />
        {errors.adminName && <p className="text-red-500">{errors.adminName.message}</p>}
        <input {...register('adminEmail')} placeholder="Admin Email" className="mb-2 p-2 border w-full" />
        {errors.adminEmail && <p className="text-red-500">{errors.adminEmail.message}</p>}
        <input type="password" {...register('adminPassword')} placeholder="Admin Password" className="mb-2 p-2 border w-full" />
        {errors.adminPassword && <p className="text-red-500">{errors.adminPassword.message}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Signup</button>
        <p className="mt-2 text-center">{message}</p>
      </form>
    </div>
  );
}
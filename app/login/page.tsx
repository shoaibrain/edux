// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginWithTenantInput, LoginWithTenantDto } from '@/lib/dto/tenant';

export default function LoginPage() {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginWithTenantInput>({
    resolver: zodResolver(LoginWithTenantDto),
  });

  const onSubmit = async (data: LoginWithTenantInput) => {
    setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage('Login successful! Redirecting...');
        window.location.href = `http://${data.tenantId}.localhost:3000/dashboard`;
      } else {
        const result = await res.json();
        setMessage(result.error || 'Login failed');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      console.error('Login request failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login to Your School</h1>
        <div className="mb-4">
          <input {...register('tenantId')} placeholder="School ID (e.g., frisco-high)" className="p-3 bg-gray-700 border border-gray-600 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.tenantId && <p className="text-red-500 text-sm mt-1">{errors.tenantId.message}</p>}
        </div>
        <div className="mb-4">
          <input {...register('email')} placeholder="Email" className="p-3 bg-gray-700 border border-gray-600 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div className="mb-6">
          <input type="password" {...register('password')} placeholder="Password" className="p-3 bg-gray-700 border border-gray-600 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" className="bg-blue-600 text-white p-3 w-full rounded-md hover:bg-blue-700 transition-colors">Login</button>
        {message && <p className="mt-4 text-center text-red-400">{message}</p>}
      </form>
    </div>
  );
}
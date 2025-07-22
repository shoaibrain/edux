// app/login/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginInput, LoginDto } from '@/lib/dto/tenant';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginDto),
  });

  const onSubmit = async (data: LoginInput) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      const result = await res.json();
      setMessage(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-green p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Login</h1>
        <input {...register('email')} placeholder="Email" className="mb-2 p-2 border w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input type="password" {...register('password')} placeholder="Password" className="mb-2 p-2 border w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Login</button>
        <p className="mt-2">{message}</p>
      </form>
    </div>
  );
}
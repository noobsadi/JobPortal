'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';


const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.5)]">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Job<span className="gradient-text">Portal</span>
            </span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <Suspense fallback={<div className="text-center text-[var(--text-muted)] py-4">Loading form...</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <>
      {serverError && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[var(--accent-bright)] hover:underline font-medium">
          Create one free
        </Link>
      </div>
    </>
  );
}

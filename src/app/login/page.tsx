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

import { AuthLayout } from '@/components/layout/AuthLayout';
import { AnimatedForm, FadeUp } from '@/components/ui/AnimatedContainer';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      bottomText="Don't have an account?"
      bottomLinkText="Create an account"
      bottomLinkHref="/signup"
    >
      <Suspense fallback={<div className="text-center text-[var(--text-muted)] py-8 animate-pulse">Loading secure connection...</div>}>
        <LoginContent />
      </Suspense>
    </AuthLayout>
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
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in zoom-in-95">
          <AlertCircle size={18} className="shrink-0" />
          {serverError}
        </div>
      )}

      <AnimatedForm onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FadeUp>
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />
        </FadeUp>
        
        <FadeUp>
          <div>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end mt-2">
              <Link href="#" className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>
        </FadeUp>

        <FadeUp>
          <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
            Sign In
          </Button>
        </FadeUp>
      </AnimatedForm>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { createCompany } from '@/lib/queries/profiles';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Zap, Mail, Lock, User, Building2, Briefcase, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';



const step1Schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['seeker', 'employer']),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const seekerStep2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
});

const employerStep2Schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  industry: z.string().optional(),
  titleAtCompany: z.string().optional(),
  description: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register: r1, handleSubmit: hs1, watch: w1, formState: { errors: e1, isSubmitting: s1 } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { role: 'seeker' },
  });

  const selectedRole = w1('role');

  const { register: r2s, handleSubmit: hs2s, formState: { errors: e2s } } = useForm<z.infer<typeof seekerStep2Schema>>({
    resolver: zodResolver(seekerStep2Schema),
  });

  const { register: r2e, handleSubmit: hs2e, formState: { errors: e2e } } = useForm<z.infer<typeof employerStep2Schema>>({
    resolver: zodResolver(employerStep2Schema),
  });

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onSeekerSubmit = async (data: z.infer<typeof seekerStep2Schema>) => {
    if (!step1Data) return;
    setServerError('');
    try {
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: { role: 'seeker' },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signUpError) { setServerError(signUpError.message); return; }
      
      if (authData.user) {
        const { setupSeekerProfile } = await import('@/app/actions/auth');
        await setupSeekerProfile(authData.user.id, data.firstName, data.lastName);
      }
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during profile setup.');
    }
  };

  const onEmployerSubmit = async (data: z.infer<typeof employerStep2Schema>) => {
    if (!step1Data) return;
    setServerError('');
    try {
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: { role: 'employer' },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signUpError) { setServerError(signUpError.message); return; }
      
      if (authData.user) {
        const { setupEmployerProfile } = await import('@/app/actions/auth');
        await setupEmployerProfile(authData.user.id, data.companyName, data.industry, data.description, data.titleAtCompany);
      }
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during profile setup.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">Account Created!</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Check your email to confirm your account, then sign in to get started.
          </p>
          <Link href="/login">
            <Button size="lg">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)' }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)]">
              Job<span className="gradient-text">Portal</span>
            </span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Step {step} of 2</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={cn('h-1 flex-1 rounded-full transition-all duration-500', s <= step ? 'bg-gradient-to-r from-violet-600 to-indigo-500' : 'bg-[var(--bg-elevated)]')} />
          ))}
        </div>

        <div className="glass-card p-8">
          {serverError && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {serverError}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={hs1(onStep1)} className="space-y-5" noValidate>
              <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" icon={<Mail size={16} />} error={e1.email?.message} {...r1('email')} />
              <Input label="Password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" icon={<Lock size={16} />} error={e1.password?.message} {...r1('password')} />
              <Input label="Confirm password" type="password" placeholder="Repeat password" autoComplete="new-password" icon={<Lock size={16} />} error={e1.confirmPassword?.message} {...r1('confirmPassword')} />

              {/* Role picker */}
              <div>
                <p className="input-label mb-3">I am a...</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'seeker', label: 'Job Seeker', icon: User, desc: 'Looking for work' },
                    { value: 'employer', label: 'Employer', icon: Building2, desc: 'Hiring talent' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <label
                      key={value}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all text-center',
                        selectedRole === value
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                          : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[rgba(255,255,255,0.02)]'
                      )}
                    >
                      <input type="radio" value={value} className="sr-only" {...r1('role')} />
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', selectedRole === value ? 'bg-[var(--accent)]' : 'bg-[var(--bg-elevated)]')}>
                        <Icon size={18} className={selectedRole === value ? 'text-white' : 'text-[var(--text-muted)]'} />
                      </div>
                      <span className={cn('text-sm font-semibold', selectedRole === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>{label}</span>
                      <span className="text-xs text-[var(--text-muted)]">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={s1} iconRight={<ChevronRight size={16} />}>
                Continue
              </Button>
            </form>
          )}

          {/* ── STEP 2 — SEEKER ── */}
          {step === 2 && selectedRole === 'seeker' && (
            <form onSubmit={hs2s(onSeekerSubmit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First name" placeholder="John" icon={<User size={16} />} error={e2s.firstName?.message} {...r2s('firstName')} />
                <Input label="Last name" placeholder="Doe" icon={<User size={16} />} error={e2s.lastName?.message} {...r2s('lastName')} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" icon={<ChevronLeft size={16} />} onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="flex-1" iconRight={<CheckCircle2 size={16} />}>Create Account</Button>
              </div>
            </form>
          )}

          {/* ── STEP 2 — EMPLOYER ── */}
          {step === 2 && selectedRole === 'employer' && (
            <form onSubmit={hs2e(onEmployerSubmit)} className="space-y-5" noValidate>
              <Input label="Company name" placeholder="Acme Corp" icon={<Building2 size={16} />} error={e2e.companyName?.message} {...r2e('companyName')} />
              <Input label="Your title" placeholder="Head of Engineering" icon={<Briefcase size={16} />} error={e2e.titleAtCompany?.message} {...r2e('titleAtCompany')} />
              <Input label="Industry" placeholder="Technology" error={e2e.industry?.message} {...r2e('industry')} />
              <Textarea label="Company description" placeholder="What does your company do?" rows={3} {...r2e('description')} />
              <div className="flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" icon={<ChevronLeft size={16} />} onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="flex-1" iconRight={<CheckCircle2 size={16} />}>Create Account</Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent-bright)] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

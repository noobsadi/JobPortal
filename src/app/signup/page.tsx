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
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AnimatedForm, FadeUp, StepTransition } from '@/components/ui/AnimatedContainer';
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

  const { register: r2s, handleSubmit: hs2s, formState: { errors: e2s, isSubmitting: isSubmittingSeeker } } = useForm<z.infer<typeof seekerStep2Schema>>({
    resolver: zodResolver(seekerStep2Schema),
  });

  const { register: r2e, handleSubmit: hs2e, formState: { errors: e2e, isSubmitting: isSubmittingEmployer } } = useForm<z.infer<typeof employerStep2Schema>>({
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
      <AuthLayout
        title="Account Created!"
        subtitle="Check your email to confirm your account, then sign in to get started."
        bottomText="Want to use a different account?"
        bottomLinkText="Sign in"
        bottomLinkHref="/login"
      >
        <div className="text-center py-8">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", damping: 12 }}
            className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle2 size={48} className="text-emerald-500" />
          </motion.div>
          <p className="text-[var(--text-secondary)]">You can now safely close this window.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join JobPortal to find your perfect match."
      bottomText="Already have an account?"
      bottomLinkText="Sign in"
      bottomLinkHref="/login"
    >
      <div className="w-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-elevated)]">
          <div 
            className="h-full bg-gradient-to-r from-[#A5E9DD] to-[#34908B] transition-all duration-700 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {serverError && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            <AlertCircle size={18} className="shrink-0" /> {serverError}
          </div>
        )}

        <div className="relative overflow-hidden mt-6">
          <StepTransition stepKey={step} direction={step === 1 ? -1 : 1}>
            {step === 1 ? (
              <AnimatedForm onSubmit={hs1(onStep1)} className="space-y-5" noValidate>
                <FadeUp>
                  <Input label="Email Address" type="email" autoComplete="email" icon={<Mail size={18} />} error={e1.email?.message} {...r1('email')} />
                </FadeUp>
                <FadeUp>
                  <Input label="Password" type="password" autoComplete="new-password" icon={<Lock size={18} />} error={e1.password?.message} {...r1('password')} />
                </FadeUp>
                <FadeUp>
                  <Input label="Confirm Password" type="password" autoComplete="new-password" icon={<Lock size={18} />} error={e1.confirmPassword?.message} {...r1('confirmPassword')} />
                </FadeUp>

                <FadeUp>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">I am a...</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'seeker', label: 'Job Seeker', icon: User, desc: 'Looking for work' },
                      { value: 'employer', label: 'Employer', icon: Building2, desc: 'Hiring talent' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <label
                        key={value}
                        className={cn(
                          'relative flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all text-center',
                          selectedRole === value
                            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                            : 'border-[var(--border)] bg-[rgba(255,255,255,0.02)]'
                        )}
                      >
                        <input type="radio" value={value} className="sr-only" {...r1('role')} />
                        <Icon size={24} className={selectedRole === value ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                        <span className={cn('text-sm font-bold', selectedRole === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>{label}</span>
                      </label>
                    ))}
                  </div>
                </FadeUp>

                <FadeUp>
                  <Button type="submit" className="w-full mt-4" size="lg">
                    Continue <ChevronRight size={18} className="ml-1" />
                  </Button>
                </FadeUp>
              </AnimatedForm>
            ) : (
              <AnimatedForm 
                onSubmit={selectedRole === 'seeker' ? hs2s(onSeekerSubmit) : hs2e(onEmployerSubmit)} 
                className="space-y-5"
              >
                {selectedRole === 'seeker' ? (
                  <>
                    <FadeUp>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" icon={<User size={18} />} error={e2s.firstName?.message} {...r2s('firstName')} />
                        <Input label="Last Name" icon={<User size={18} />} error={e2s.lastName?.message} {...r2s('lastName')} />
                      </div>
                    </FadeUp>
                  </>
                ) : (
                  <>
                    <FadeUp>
                      <Input label="Company Name" icon={<Building2 size={18} />} error={e2e.companyName?.message} {...r2e('companyName')} />
                    </FadeUp>
                    <FadeUp>
                      <Input label="Your Title" icon={<Briefcase size={18} />} error={e2e.titleAtCompany?.message} {...r2e('titleAtCompany')} />
                    </FadeUp>
                    <FadeUp>
                      <Input label="Industry" {...r2e('industry')} />
                    </FadeUp>
                    <FadeUp>
                      <Textarea label="Company Description" rows={3} {...r2e('description')} />
                    </FadeUp>
                  </>
                )}

                <FadeUp>
                  <div className="flex items-center gap-3 mt-8">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="px-4">
                      <ChevronLeft size={20} />
                    </Button>
                    <Button type="submit" className="flex-1" loading={selectedRole === 'seeker' ? isSubmittingSeeker : isSubmittingEmployer}>
                      Create Account
                    </Button>
                  </div>
                </FadeUp>
              </AnimatedForm>
            )}
          </StepTransition>
        </div>
      </div>
    </AuthLayout>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  bottomText: string;
  bottomLinkText: string;
  bottomLinkHref: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  bottomText,
  bottomLinkText,
  bottomLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] overflow-hidden">
      {/* Left Pane - Abstract Visuals (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden border-r border-[var(--border)] bg-[var(--bg-surface)] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#A5E9DD]/40 to-[#6FBEB2]/10 blur-[100px] dark:opacity-30"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -40, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-[#FDF4AF]/30 to-[#34908B]/20 blur-[120px] dark:opacity-30"
          />
        </div>

        {/* Branding */}
        <Link href="/" className="relative z-10 flex items-center gap-2 group w-max">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center shadow-[0_0_24px_rgba(52,144,139,0.3)]"
          >
            <Zap size={20} className="text-white" fill="white" />
          </motion.div>
          <span className="font-display font-bold text-2xl text-[var(--text-primary)] tracking-tight">
            Job<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6FBEB2] to-[#34908B]">Portal</span>
          </span>
        </Link>

        {/* Quote/Value Prop */}
        <div className="relative z-10 mt-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <blockquote className="space-y-5">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-[#FDF4AF] fill-current drop-shadow-[0_0_4px_rgba(253,244,175,0.6)] dark:text-[#34908B]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-2xl font-display font-medium text-[var(--text-primary)] leading-snug">
                "The skills-based matching completely transformed how we discover talent. It's the modern, effortless way to hire."
              </p>
              <footer className="text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)] font-semibold">Sarah Jenkins</strong> — VP of Engineering
              </footer>
            </blockquote>
          </motion.div>
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-0 relative bg-[var(--bg-base)]">
        {/* Mobile Background Glow */}
        <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[600px] opacity-40 pointer-events-none dark:opacity-30"
          style={{ background: 'radial-gradient(ellipse at top, rgba(165,233,221,0.5) 0%, rgba(52,144,139,0.15) 40%, transparent 80%)' }} />

        {/* Mobile Branding */}
        <div className="md:hidden flex justify-center mb-8 relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center shadow-[0_0_24px_rgba(52,144,139,0.3)]"
            >
              <Zap size={20} className="text-white" fill="white" />
            </motion.div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] mx-auto relative z-10"
        >
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">{subtitle}</p>
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-3xl md:bg-transparent md:backdrop-blur-none border border-[var(--border)] md:border-transparent shadow-[0_32px_64px_rgba(0,0,0,0.06)] md:shadow-none dark:shadow-[0_32px_64px_rgba(0,0,0,0.3)] md:dark:shadow-none rounded-[2rem] p-6 sm:p-8 md:p-0">
            {children}
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center md:text-left text-sm text-[var(--text-secondary)]">
            {bottomText}{' '}
            <Link href={bottomLinkHref} className="text-[var(--accent)] hover:text-[#277A75] font-semibold transition-colors inline-block relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[1.5px] after:bg-[var(--accent)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              {bottomLinkText}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

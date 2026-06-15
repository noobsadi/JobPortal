'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function FadeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUpItem} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedForm({ children, className, onSubmit, ...props }: any) {
  return (
    <motion.form
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </motion.form>
  );
}

export function StepTransition({ children, stepKey, direction = 1 }: { children: React.ReactNode; stepKey: number | string; direction?: number }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        initial={{ opacity: 0, x: 20 * direction }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 * direction }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

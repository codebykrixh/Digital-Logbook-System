'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardMock } from '@/components/landing/dashboard-mock';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/10 to-fuchsia-500/20 blur-3xl animate-aurora" />
        <div
          className="absolute inset-0 bg-grid-pattern opacity-[0.35] mask-fade-bottom"
          style={{ backgroundSize: '44px 44px' }}
        />
      </div>

      <div className="container flex flex-col items-center text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <Link
            href="#modules"
            className="glass glass-border group inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm shadow-soft"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
              <Sparkles className="h-3 w-3 text-white" />
            </span>
            <span className="font-medium text-muted-foreground">
              6 integrated modules · one platform
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-7 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl"
        >
          The smart digital logbook for{' '}
          <span className="text-gradient">modern industrial operations</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance"
        >
          Replace paper logbooks and scattered spreadsheets with one secure
          platform. Shift logs, incident management, CAPA, and real-time
          analytics — built for refineries, power plants, and manufacturing.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="gradient" className="group">
            <Link href="/register">
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="#analytics">
              <PlayCircle className="h-4 w-4" />
              See live demo
            </Link>
          </Button>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-success" /> ISO 27001 ready
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-warning" /> Deploy in under a day
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> No credit card required
          </span>
        </motion.div>
      </div>

      {/* Product mockup */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="container mt-16 [perspective:2000px]"
      >
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 blur-2xl" />
          <DashboardMock />
        </div>
      </motion.div>
    </section>
  );
}

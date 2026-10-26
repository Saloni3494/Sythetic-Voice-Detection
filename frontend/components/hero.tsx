"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"
import { ShieldCheck, ArrowRight, Activity, Zap, Cpu, Waves } from "lucide-react"

export function Hero({ onLaunch }: { onLaunch?: () => void }) {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92])

  return (
    <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex flex-col justify-between pt-28 pb-16 px-6 md:px-12">
      {/* Interactive 3D Sphere Background */}
      <div className="absolute inset-0 pointer-events-none opacity-85">
        <SentientSphere />
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Hero Header */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6 mt-8 md:mt-12"
      >
        {/* Category Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md font-mono text-[11px] tracking-widest text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>ENTERPRISE AUDIO FORENSICS &amp; DEEPFAKE LOCALIZATION</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-sans text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-balance text-white leading-[1.08]"
        >
          Detect Voice Clones &amp; <br />
          <span className="font-normal italic bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
            Spliced Audio Deepfakes
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sans text-base sm:text-lg md:text-xl text-white/70 max-w-2xl font-light leading-relaxed text-balance"
        >
          Sub-second temporal splice localization powered by <span className="text-white font-medium">PartialSpoofCNN</span>. Isolate AI-generated phonemes from authentic human speech with <span className="text-blue-400 font-medium">98.66% ROC-AUC</span> at 10ms frame resolution.
        </motion.p>

        {/* Action Button Group */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <button
            onClick={onLaunch}
            className="group px-8 py-4 rounded-full font-sans text-sm font-medium tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_0_35px_rgba(37,99,235,0.45)] hover:shadow-[0_0_50px_rgba(37,99,235,0.7)] flex items-center gap-3 cursor-pointer"
          >
            <span>Launch Forensics Lab</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom KPI Stat Strip & Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 max-w-6xl mx-auto w-full mt-12 md:mt-16"
      >
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl mb-8">
          <div className="flex flex-col items-center text-center p-3">
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">EQUAL ERROR RATE</span>
            <span className="font-sans text-3xl md:text-4xl font-light text-white mt-1">4.90%</span>
            <span className="font-mono text-[10px] text-emerald-400 mt-1">Benchmark SOTA</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 border-l border-white/10">
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">ROC-AUC SCORE</span>
            <span className="font-sans text-3xl md:text-4xl font-light text-blue-400 mt-1">98.66%</span>
            <span className="font-mono text-[10px] text-white/50 mt-1">Discriminative Power</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 border-l border-white/10">
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">INFERENCE SPEED</span>
            <span className="font-sans text-3xl md:text-4xl font-light text-emerald-400 mt-1">&lt;35ms</span>
            <span className="font-mono text-[10px] text-white/50 mt-1">Real-Time per Sec</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 border-l border-white/10">
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">MODEL FOOTPRINT</span>
            <span className="font-sans text-3xl md:text-4xl font-light text-indigo-400 mt-1">682k</span>
            <span className="font-mono text-[10px] text-white/50 mt-1">2.7MB FP32 Edge Core</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0a0a0d]/80 backdrop-blur-md flex flex-col gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Waves className="w-4 h-4" />
            </div>
            <h3 className="font-sans text-base font-medium text-white">Temporal Splice Localization</h3>
            <p className="font-sans text-sm font-light text-white/60 leading-relaxed">
              Isolates the exact microsecond boundaries of injected synthetic voice while leaving authentic human speech unflagged.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0a0a0d]/80 backdrop-blur-md flex flex-col gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-sans text-base font-medium text-white">VAD Energy Filtering</h3>
            <p className="font-sans text-sm font-light text-white/60 leading-relaxed">
              Adaptive RMS acoustic gating suppresses unvoiced consonants and natural breath pauses from generating false alarms.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0a0a0d]/80 backdrop-blur-md flex flex-col gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-sans text-base font-medium text-white">Edge-Ready Architecture</h3>
            <p className="font-sans text-sm font-light text-white/60 leading-relaxed">
              SE-Attention CNN coupled with dilated 1D temporal convolutions yields high accuracy without bulky billion-parameter transformers.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

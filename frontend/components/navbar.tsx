"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, ArrowRight, Activity, Terminal } from "lucide-react"

export function Navbar({ onLaunch }: { onLaunch?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-12">
        {/* Brand Logo & Version Pill */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans font-semibold tracking-wider text-base text-white">VOXGUARD</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v3.2
              </span>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase hidden sm:inline">
              PartialSpoof Speech Forensics
            </span>
          </div>
        </div>

        {/* Live Engine Telemetry Chip */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md font-mono text-[11px] text-white/70">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-white/90 font-medium">CORE READY</span>
          </div>
          <span className="text-white/20">•</span>
          <span className="text-white/50">CPU Latency: <span className="text-blue-400 font-medium">&lt;35ms</span></span>
          <span className="text-white/20">•</span>
          <span className="text-white/50">ROC-AUC: <span className="text-emerald-400 font-medium">98.66%</span></span>
        </div>

        {/* CTA Launch Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLaunch}
            className="group relative px-5 py-2.5 rounded-full font-sans text-xs font-medium tracking-wide text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Forensics Lab</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>
    </motion.header>
  )
}

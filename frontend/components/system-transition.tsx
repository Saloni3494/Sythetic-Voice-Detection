"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const stages = [
  "INITIALIZING SYSTEM...",
  "LOADING CNN ENGINE...",
  "PREPARING SIGNAL ANALYSIS...",
  "ANALYSIS SYSTEM READY"
]

export function SystemTransition({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage < stages.length) {
      const timer = setTimeout(() => {
        setStage(stage + 1)
      }, 400) // 0.4s per stage
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [stage, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden"
    >
      {/* Background Grid & Noise for consistency */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      
      {/* Animated Signal Line */}
      <motion.div 
        className="absolute inset-0 z-0 flex items-center justify-center opacity-10"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: [0, 1, 0.5, 1], rotate: [0, 90] }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <div className="w-full h-px bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.8)]" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-mono text-sm md:text-base tracking-widest text-blue-400 uppercase text-center"
            style={{ textShadow: "0 0 10px rgba(37,99,235,0.5)" }}
          >
            {stages[stage] || stages[stages.length - 1]}
          </motion.div>
        </AnimatePresence>
        
        {/* Technical progress bar */}
        <div className="w-64 h-px bg-white/10 relative overflow-hidden mt-8">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(Math.min(stage + 1, stages.length) / stages.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}

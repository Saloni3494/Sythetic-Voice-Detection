"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const stages = [
  { id: "01", name: "INGESTING AUDIO" },
  { id: "02", name: "EXTRACTING FEATURES" },
  { id: "03", name: "ANALYZING SPECTRAL PATTERNS" },
  { id: "04", name: "MODELING TEMPORAL CONTEXT" },
  { id: "05", name: "LOCALIZING SYNTHETIC SEGMENTS" },
  { id: "06", name: "GENERATING RESULT" }
]

export function AnalysisEngine({ onComplete }: { onComplete: () => void }) {
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    if (currentStage < stages.length) {
      const timer = setTimeout(() => {
        setCurrentStage(s => s + 1)
      }, 800) // 0.8s per stage
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStage, onComplete])

  return (
    <div className="w-full py-12 border-b border-white/10 mb-12">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-4 mb-12">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>
          <h3 className="font-mono text-sm tracking-widest text-blue-400">ANALYZING SIGNAL</h3>
        </div>

        <div className="w-full max-w-4xl relative">
          {/* Animated background line connecting everything */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
          
          <motion.div 
            className="absolute top-1/2 left-0 h-px bg-blue-500 -translate-y-1/2 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(Math.min(currentStage, stages.length - 1) / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          <div className="relative flex justify-between">
            {stages.map((stage, index) => {
              const isActive = index === currentStage
              const isPast = index < currentStage
              
              return (
                <div key={stage.id} className="flex flex-col items-center gap-4 relative">
                  <motion.div 
                    className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 z-10 bg-[#050505]
                      ${isActive ? "border-blue-400 bg-blue-400/20" : isPast ? "border-blue-500 bg-blue-500" : "border-white/20"}
                    `}
                    animate={isActive ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                    transition={isActive ? { repeat: Number.POSITIVE_INFINITY, duration: 1.5 } : {}}
                  />
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center gap-1">
                    <span className={`font-mono text-[10px] tracking-widest ${isActive || isPast ? "text-white" : "text-white/30"}`}>
                      {stage.id}
                    </span>
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${isActive ? "text-blue-400" : isPast ? "text-white/70" : "text-white/20"}`}>
                      {stage.name}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

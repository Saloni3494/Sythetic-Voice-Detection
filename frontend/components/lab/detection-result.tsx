"use client"

import { motion } from "framer-motion"
import { AnalysisResult } from "@/lib/mock-data"

export function DetectionResult({ result }: { result: AnalysisResult }) {
  const isSynthetic = result.label === "SYNTHETIC"
  const color = isSynthetic ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)" // Red for synthetic, Blue for human
  const strokeColor = isSynthetic ? "#ef4444" : "#3b82f6"
  
  // Circle math for gauge
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const confidence = isSynthetic ? result.syntheticProbability : result.humanProbability
  const strokeDashoffset = circumference - (confidence / 100) * circumference

  return (
    <div className="w-full mb-24">
      <div className="mb-12">
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 — DETECTION</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic">ANALYSIS COMPLETE</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Confidence Gauge */}
        <div className="lg:col-span-2 relative flex flex-col items-center justify-center py-16 border border-white/10 bg-[#050505]">
          <div className="relative w-[300px] h-[300px] flex flex-col items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
              <circle 
                cx="150" cy="150" r={radius} 
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" 
              />
              <motion.circle 
                cx="150" cy="150" r={radius} 
                fill="none" stroke={strokeColor} strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
              {/* Decorative ticks */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10) * (Math.PI / 180)
                const isFilled = (i * 10) <= (confidence / 100) * 360
                const x1 = 150 + Math.cos(angle) * (radius - 15)
                const y1 = 150 + Math.sin(angle) * (radius - 15)
                const x2 = 150 + Math.cos(angle) * (radius - 5)
                const y2 = 150 + Math.sin(angle) * (radius - 5)
                return (
                  <line 
                    key={i} x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke={isFilled ? strokeColor : "rgba(255,255,255,0.1)"} 
                    strokeWidth="1" 
                  />
                )
              })}
            </svg>

            <motion.div 
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className="font-mono text-sm tracking-[0.2em] mb-2" style={{ color }}>
                {result.label} SPEECH
              </span>
              <span className="font-sans text-6xl md:text-7xl font-light tracking-tighter text-white">
                {confidence.toFixed(1)}%
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground mt-2 uppercase">
                Confidence
              </span>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between font-mono text-[10px] tracking-widest uppercase">
            <div className="flex flex-col gap-1">
              <span className="text-white/30">HUMAN</span>
              <span className="text-white">{result.humanProbability.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-white/30">SYNTHETIC</span>
              <span className="text-white">{result.syntheticProbability.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* AI Evidence / Metrics panel */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 border border-white/10 bg-[#050505] p-6 flex flex-col">
            <h3 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-6 uppercase border-b border-white/10 pb-4">
              AI EVIDENCE
            </h3>
            
            <div className="flex flex-col gap-6 font-mono text-xs tracking-wider">
              <div className="flex flex-col gap-2">
                <span className="text-white/40">SPECTRAL ANOMALY</span>
                <span className={result.spectralAnomaly ? "text-red-400" : "text-blue-400"}>
                  {result.spectralAnomaly ? "DETECTED" : "CLEAR"}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-white/40">TEMPORAL CONSISTENCY</span>
                <span className="text-white">{result.temporalConsistency}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-white/40">MODEL ACTIVATION</span>
                <span className="text-white">{result.modelActivation}</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/10">
               <p className="font-sans font-light text-sm italic text-white/70">
                 "{isSynthetic ? "Elevated model activation detected in specific temporal-frequency regions." : "Signal exhibits natural spectral variations typical of human speech dynamics."}"
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

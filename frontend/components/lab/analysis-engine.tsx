"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield, Cpu, Activity, Terminal, CheckCircle2 } from "lucide-react"

const stages = [
  { id: "01", name: "RAW AUDIO INGESTION", log: "Reading 16kHz PCM audio stream & normalizing peak amplitude..." },
  { id: "02", name: "VAD ENERGY GATING", log: "Executing energy-based voice activity detection (VAD -35dB threshold)..." },
  { id: "03", name: "SPECTRAL LOG-MEL MAPPING", log: "Transforming signal into 80-bank Log-Mel spectrogram (FFT 1024 / hop 256)..." },
  { id: "04", name: "SVCNN CONV INFERENCE", log: "Running 4-block PartialSpoofCNN convolutional feature extraction..." },
  { id: "05", name: "TEMPORAL LOCALIZATION", log: "Clustering frame-level posterior probabilities & boundary IoU analysis..." },
  { id: "06", name: "AUDIT SYNTHESIS", log: "Assembling forensic threat certificate and calibrated softmax verdict..." }
]

export function AnalysisEngine({ onComplete }: { onComplete: () => void }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [percent, setPercent] = useState(12)

  useEffect(() => {
    if (currentStage < stages.length) {
      const stageTimer = setTimeout(() => {
        setCurrentStage(s => s + 1)
        setPercent(Math.min(100, Math.round(((currentStage + 1) / stages.length) * 100)))
      }, 700)
      return () => clearTimeout(stageTimer)
    } else {
      const finalTimer = setTimeout(() => {
        onComplete()
      }, 400)
      return () => clearTimeout(finalTimer)
    }
  }, [currentStage, onComplete])

  return (
    <div className="w-full my-8 p-6 md:p-8 rounded-2xl border border-blue-500/30 bg-[#0a0b12] shadow-[0_0_50px_rgba(37,99,235,0.15)] relative overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Top Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500" />
          </div>
          <div>
            <h3 className="font-mono text-sm tracking-wider font-semibold text-white uppercase flex items-center gap-2">
              <span>DEEP NEURAL FORENSICS IN PROGRESS</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                GPU / CPU ACCELERATED
              </span>
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Evaluating speech authenticity and boundary discontinuity metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-neutral-400">STAGE {Math.min(currentStage + 1, stages.length)}/6</span>
          <span className="text-2xl font-bold text-blue-400 font-mono tracking-tight">{percent}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-white/10 relative overflow-hidden mb-8">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 shadow-[0_0_15px_#38bdf8]"
          initial={{ width: "10%" }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Pipeline Stepper Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8 relative z-10">
        {stages.map((stage, index) => {
          const isActive = index === currentStage
          const isPast = index < currentStage
          
          return (
            <div 
              key={stage.id} 
              className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between
                ${isActive 
                  ? "border-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                  : isPast 
                    ? "border-white/20 bg-white/[0.02]" 
                    : "border-white/5 bg-transparent opacity-40"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-neutral-400 font-semibold">{stage.id}</span>
                {isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                )}
              </div>
              <div className={`font-mono text-[10px] uppercase font-semibold tracking-wider leading-tight ${isActive ? "text-blue-300" : isPast ? "text-white" : "text-neutral-500"}`}>
                {stage.name}
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Terminal Diagnostics Console */}
      <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs relative z-10 shadow-inner">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-semibold">KERNEL AUDIT LOG</span>
          </div>
          <span className="text-emerald-400 text-[10px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY
          </span>
        </div>

        <div className="space-y-1.5 text-neutral-300 text-[11px]">
          {stages.slice(0, currentStage + 1).map((s, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-blue-400 shrink-0">&gt; [{s.id}]</span>
              <span className={idx === currentStage ? "text-cyan-300 font-medium animate-pulse" : "text-neutral-400"}>
                {s.log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


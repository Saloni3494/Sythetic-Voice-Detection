"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ResolutionResult } from "@/lib/mock-data"
import { Sliders, Clock, ZoomIn } from "lucide-react"

export function MultiResolution({ resolutions, duration }: { resolutions: ResolutionResult[], duration: number }) {
  const [activeRes, setActiveRes] = useState<number | null>(null)

  return (
    <div className="w-full mb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">06 — MULTI-SCALE QUANTIZATION</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">TEMPORAL RESOLUTION FUSION</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Multi-Resolution Splice Analysis
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Cross-scale frame localization from ultra-fine 20ms phoneme windows to coarse 160ms utterance boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>FOUR-TIER TEMPORAL DECOMPOSITION</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#07080d] p-6 shadow-2xl relative overflow-hidden">
        <div className="min-w-[600px] flex flex-col gap-5">
          {resolutions.map((res, i) => {
            const isActive = activeRes === res.resolutionMs
            return (
              <div 
                key={res.resolutionMs} 
                className={`flex items-center gap-6 cursor-pointer group transition-all p-2 rounded-xl ${
                  isActive ? "bg-white/[0.04] border border-blue-500/30" : "hover:bg-white/[0.02]"
                }`}
                onClick={() => setActiveRes(isActive ? null : res.resolutionMs)}
              >
                <div className="w-20 text-left shrink-0">
                  <div className={`font-mono text-xs font-semibold ${isActive ? "text-blue-400" : "text-white"}`}>
                    {res.resolutionMs} ms
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500">
                    {res.resolutionMs <= 20 ? "Phoneme" : res.resolutionMs <= 40 ? "Syllable" : res.resolutionMs <= 80 ? "Word" : "Clause"}
                  </div>
                </div>
                
                <div className="flex-1 h-8 relative rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                  {/* Subtle Grid lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:10%_100%]" />
                  
                  {/* Segment Blocks */}
                  {res.segments.map((seg, j) => {
                    const left = (seg.start / duration) * 100
                    const width = ((seg.end - seg.start) / duration) * 100
                    return (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.05 * i + 0.03 * j }}
                        style={{ left: `${left}%`, width: `${width}%`, transformOrigin: "left" }}
                        className={`absolute top-0 bottom-0 border-x border-black/40 transition-colors
                          ${isActive 
                            ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" 
                            : "bg-red-500/70 group-hover:bg-red-500/90"
                          }
                        `}
                      />
                    )
                  })}
                </div>
                
                <div className="w-28 text-right shrink-0 flex flex-col font-mono text-xs">
                  <span className={isActive ? "text-red-400 font-bold" : "text-white"}>{res.totalDetected}</span>
                  <span className="text-[9px] tracking-wider uppercase text-neutral-500">Suspicious Frames</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Timeline markers */}
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between font-mono text-[10px] text-neutral-500 px-24">
          <span>0.00s</span>
          <span>{(duration * 0.25).toFixed(2)}s</span>
          <span>{(duration * 0.50).toFixed(2)}s</span>
          <span>{(duration * 0.75).toFixed(2)}s</span>
          <span>{duration.toFixed(2)}s</span>
        </div>
      </div>
    </div>
  )
}


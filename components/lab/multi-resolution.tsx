"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ResolutionResult } from "@/lib/mock-data"

export function MultiResolution({ resolutions, duration }: { resolutions: ResolutionResult[], duration: number }) {
  const [activeRes, setActiveRes] = useState<number | null>(null)

  return (
    <div className="w-full mb-24">
      <div className="mb-12">
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">06 — TEMPORAL RESOLUTION</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic">MULTI-RESOLUTION ANALYSIS</h2>
        <p className="text-muted-foreground mt-4 font-light max-w-xl">
          Inspect synthetic speech across multiple temporal scales to understand localization precision.
        </p>
      </div>

      <div className="border border-white/10 bg-[#050505] p-6 font-mono text-xs overflow-x-auto">
        <div className="min-w-[600px] flex flex-col gap-4">
          {resolutions.map((res, i) => {
            const isActive = activeRes === res.resolutionMs
            return (
              <div 
                key={res.resolutionMs} 
                className={`flex items-center gap-6 cursor-pointer group transition-colors ${isActive ? "text-white" : "text-white/50"}`}
                onClick={() => setActiveRes(isActive ? null : res.resolutionMs)}
              >
                <div className="w-16 text-right group-hover:text-white transition-colors">
                  {res.resolutionMs} ms
                </div>
                
                <div className="flex-1 h-6 relative border-y border-white/5 bg-white/[0.01]">
                  {/* Grid lines */}
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
                        transition={{ delay: 0.1 * i + 0.05 * j }}
                        style={{ left: `${left}%`, width: `${width}%`, transformOrigin: "left" }}
                        className={`absolute top-0 bottom-0 border-x border-black/50 transition-colors
                          ${isActive ? "bg-red-500" : "bg-red-500/50 group-hover:bg-red-500/70"}
                        `}
                      />
                    )
                  })}
                </div>
                
                <div className="w-24 text-right flex flex-col group-hover:text-white transition-colors">
                  <span>{res.totalDetected}</span>
                  <span className="text-[8px] tracking-widest uppercase opacity-50">Frames</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

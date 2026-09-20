"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SyntheticSegment } from "@/lib/mock-data"

const TABS = ["LOG-MEL", "LFCC", "CQT", "ACTIVATION"]

export function SpectralEvidence({ segments }: { segments: SyntheticSegment[] }) {
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <div className="w-full mb-24">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">05 — EVIDENCE</p>
          <h2 className="font-sans text-4xl md:text-5xl font-light italic">SPECTRAL EVIDENCE</h2>
        </div>
        
        {/* Feature Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs tracking-widest border border-white/10 p-1 bg-black">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 transition-colors ${
                activeTab === tab 
                  ? "bg-white text-black" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full border border-white/10 bg-[#050505] p-1 relative overflow-hidden h-64 md:h-96">
        {/* Mock Spectrogram generated with CSS gradients and blending to look scientific */}
        <div 
          className="w-full h-full opacity-80 mix-blend-screen"
          style={{
            background: `
              linear-gradient(90deg, rgba(37,99,235,0.1) 0%, rgba(239,68,68,0.05) 50%, rgba(37,99,235,0.1) 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)
            `,
            backgroundColor: activeTab === "ACTIVATION" ? "#110000" : "#000511"
          }}
        >
          {/* Base Noise Texture to simulate frequencies */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />

          {/* Synthetic regions as high intensity areas in the spectrogram */}
          {segments.map((seg, i) => {
            const startX = (seg.start / 12.84) * 100 // Hardcoded duration for prototype visually
            const width = ((seg.end - seg.start) / 12.84) * 100
            
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${startX}%`,
                  width: `${width}%`,
                  background: activeTab === "ACTIVATION" 
                    ? "linear-gradient(0deg, rgba(239,68,68,0) 0%, rgba(239,68,68,0.8) 50%, rgba(239,68,68,0) 100%)"
                    : "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 20%, rgba(239,68,68,0.4) 50%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)",
                  filter: "blur(4px)",
                  mixBlendMode: "screen"
                }}
              />
            )
          })}
        </div>

        {/* Overlays / Rulers */}
        <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between font-mono text-[10px] text-white/30 pointer-events-none">
          <span>8 kHz</span>
          <span>4 kHz</span>
          <span>2 kHz</span>
          <span>0 Hz</span>
        </div>
      </div>
    </div>
  )
}

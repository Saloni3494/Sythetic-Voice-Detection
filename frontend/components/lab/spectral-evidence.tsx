"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SyntheticSegment } from "@/lib/mock-data"
import { Layers, Activity, Cpu } from "lucide-react"

const TABS = [
  { id: "LOG-MEL", name: "80-Channel Log-Mel Spectrogram", desc: "Primary feature representation used by PartialSpoofCNN" },
  { id: "LFCC", name: "Linear Frequency Cepstral Coeffs", desc: "Linear filterbank capturing high-frequency acoustic artifacts" },
  { id: "CQT", name: "Constant-Q Transform", desc: "Geometrically spaced frequency bins for harmonic analysis" },
  { id: "ACTIVATION", name: "Deep Latent Activation Heatmap", desc: "Grad-CAM spatial activation highlighting vocoder anomalies" }
]

export function SpectralEvidence({ segments, duration = 12.84 }: { segments: SyntheticSegment[], duration?: number }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0]

  return (
    <div className="w-full mb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">05 — SPECTRAL AUDIT</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">TIME-FREQUENCY MANIFOLD</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Spectral Forensics & Latent Maps
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            {currentTabObj.desc}
          </p>
        </div>
        
        {/* Feature Tabs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-wider p-1.5 rounded-xl border border-white/10 bg-[#0a0b12] shadow-inner">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg transition-all duration-200 font-semibold text-[11px] ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full rounded-2xl border border-white/10 bg-[#07080d] p-4 md:p-6 relative overflow-hidden shadow-2xl">
        {/* Top Spectrogram Bar */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-white/5 text-[11px] font-mono text-neutral-400 gap-2">
          <div className="flex items-center gap-3">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white font-medium">{currentTabObj.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FFT WINDOW: 1024</span>
            <span>HOP: 256</span>
            <span className="text-blue-400">NYQUIST: 8000 HZ</span>
          </div>
        </div>

        {/* Spectrogram Display Area */}
        <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden border border-white/10">
          {/* Scientific Spectrogram Backdrop */}
          <div 
            className="w-full h-full opacity-90 transition-all duration-500"
            style={{
              background: activeTab === "ACTIVATION"
                ? `linear-gradient(180deg, #1f0202 0%, #0d0101 100%)`
                : activeTab === "LFCC"
                  ? `linear-gradient(180deg, #021a1f 0%, #01080d 100%)`
                  : activeTab === "CQT"
                    ? `linear-gradient(180deg, #1a021f 0%, #06010d 100%)`
                    : `linear-gradient(180deg, #020b1f 0%, #030611 100%)`,
            }}
          >
            {/* Grid frequency horizontal markers */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:100%_25%]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px)] bg-[size:10%_100%]" />

            {/* Simulated organic spectral bands */}
            <div 
              className="absolute inset-0 opacity-40 mix-blend-color-dodge"
              style={{
                backgroundImage: `radial-gradient(ellipse at 30% 60%, rgba(59,130,246,0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(14,165,233,0.4) 0%, transparent 70%)`
              }}
            />

            {/* Synthetic regions highlighted with high spectral intensity */}
            {segments.map((seg, i) => {
              const isFull = (seg as any).type === "full_synthetic" || (seg.start <= 0.05 && seg.end >= duration * 0.95)
              const startX = isFull ? 0 : (seg.start / duration) * 100
              const width = isFull ? 100 : Math.min(100 - startX, ((seg.end - seg.start) / duration) * 100)
              
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `${startX}%`,
                    width: `${width}%`,
                    background: activeTab === "ACTIVATION" 
                      ? "linear-gradient(0deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.7) 50%, rgba(245,158,11,0.9) 100%)"
                      : "linear-gradient(0deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.5) 50%, rgba(244,63,94,0.7) 100%)",
                    filter: "blur(3px)",
                    mixBlendMode: "screen"
                  }}
                />
              )
            })}
          </div>

          {/* Frequency Rulers on the Left */}
          <div className="absolute left-3 top-3 bottom-3 flex flex-col justify-between font-mono text-[10px] text-white/50 pointer-events-none select-none drop-shadow">
            <span className="bg-black/60 px-1 py-0.5 rounded border border-white/10">8.0 kHz</span>
            <span className="bg-black/60 px-1 py-0.5 rounded border border-white/10">4.0 kHz</span>
            <span className="bg-black/60 px-1 py-0.5 rounded border border-white/10">2.0 kHz</span>
            <span className="bg-black/60 px-1 py-0.5 rounded border border-white/10">500 Hz</span>
            <span className="bg-black/60 px-1 py-0.5 rounded border border-white/10">0 Hz</span>
          </div>

          {/* Time axis on bottom */}
          <div className="absolute bottom-2 left-16 right-4 flex justify-between font-mono text-[10px] text-white/40 pointer-events-none select-none">
            <span>0.00s</span>
            <span>{(duration * 0.25).toFixed(2)}s</span>
            <span>{(duration * 0.5).toFixed(2)}s</span>
            <span>{(duration * 0.75).toFixed(2)}s</span>
            <span>{duration.toFixed(2)}s</span>
          </div>
        </div>

        {/* Footer Interpretation */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-neutral-400 gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Red/Orange overlays denote high acoustic loss gradients & synthetic phase jitter.</span>
          </div>
          <span className="text-white/60">SPECTRO-TEMPORAL DENSITY: 80x{Math.round(duration * 62.5)} TENSORS</span>
        </div>
      </div>
    </div>
  )
}


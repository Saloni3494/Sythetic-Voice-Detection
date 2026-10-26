"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Cpu, GitBranch, Info } from "lucide-react"

const nodes = [
  { id: "AUDIO", label: "AUDIO INPUT STREAM", tag: "PCM 16kHz", desc: "Mono 16,000 Hz raw speech waveform normalized to 0 dBFS amplitude." },
  { id: "FEATURES", label: "80-CHANNEL LOG-MEL SPECTROGRAM", tag: "FFT 1024 / Hop 256", desc: "Short-Time Fourier Transform passed through 80 triangular Mel filterbanks covering human vocal bandwidth (0 - 8kHz)." },
  { id: "CNN", label: "4-STAGE 2D-CNN + SE ATTENTION", tag: "32 → 128 Channels", desc: "Hierarchical 2D convolutions with Squeeze-and-Excitation channel recalibration to detect localized vocoder harmonics." },
  { id: "FUSION", label: "SPECTRAL MEAN-POOLING", tag: "128-D Temporal", desc: "Collapses the 80 frequency channels into a rich, compact 128-dimensional frame-level representation sequence." },
  { id: "TEMPORAL", label: "DILATED 1D-TCN RECEPTIVE FIELD", tag: "Dilations: 1, 2, 4, 8", desc: "Residual 1D Temporal Convolutional Network with exponential receptive dilation to capture phoneme-to-phrase context." },
  { id: "DETECTION", label: "UTTERANCE-LEVEL HEAD", tag: "4.90% EER / 98.66% AUC", desc: "Global adaptive pooling and linear classification producing whole-utterance authenticity score & threat classification." },
  { id: "LOCALIZATION", label: "TEMPORAL SPLICE PROJECTION", tag: "Frame Boundary Refinement", desc: "Frame-by-frame projection combined with energy-based Voice Activity Gating to localize sub-second deepfake splices." }
]

export function ModelArchitecture() {
  const [hoveredNode, setHoveredNode] = useState<string>("CNN")

  return (
    <div className="w-full mb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">07 — NEURAL TOPOLOGY</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">END-TO-END PIPELINE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            PartialSpoofCNN Deep Architecture
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Lightweight dual-branch architecture for concurrent whole-clip spoof detection and temporal boundary splice localization.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>682,042 TOTAL PARAMETERS</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#07080d] p-6 lg:p-10 shadow-2xl relative flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Nodes Graph */}
        <div className="flex-1 flex flex-col items-center gap-4 relative py-2">
          {nodes.slice(0, 5).map((node, i) => {
            const isHovered = hoveredNode === node.id

            return (
              <div key={node.id} className="flex flex-col items-center w-full max-w-md">
                <motion.div
                  onHoverStart={() => setHoveredNode(node.id)}
                  onClick={() => setHoveredNode(node.id)}
                  className={`w-full px-5 py-3.5 rounded-xl border cursor-pointer transition-all duration-300 relative z-10 flex items-center justify-between
                    ${isHovered 
                      ? "border-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-white" 
                      : "border-white/10 bg-white/[0.02] text-neutral-300 hover:border-white/25 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-mono text-xs font-semibold tracking-wider">{node.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    {node.tag}
                  </span>
                </motion.div>
                
                {i < 4 && (
                  <div className="h-5 w-px bg-gradient-to-b from-blue-400/40 to-white/10 my-0.5" />
                )}
              </div>
            )
          })}

          {/* Dual Projection Split */}
          <div className="w-full max-w-xl relative mt-2 pt-4 border-t border-dashed border-white/10">
            <div className="text-center font-mono text-[10px] tracking-widest text-neutral-400 uppercase mb-3 flex items-center justify-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-blue-400" />
              <span>CONCURRENT DUAL-HEAD TASK DECOUPLING</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[nodes[5], nodes[6]].map((subNode) => {
                const isHovered = hoveredNode === subNode.id
                return (
                  <motion.div
                    key={subNode.id}
                    onHoverStart={() => setHoveredNode(subNode.id)}
                    onClick={() => setHoveredNode(subNode.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between
                      ${isHovered 
                        ? "border-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-white" 
                        : "border-white/10 bg-white/[0.02] text-neutral-300 hover:border-white/25 hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <div className="font-mono text-xs font-semibold mb-1 text-white">{subNode.label}</div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded self-start mt-2">
                      {subNode.tag}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry & Inspection Panel */}
        <div className="w-full lg:w-80 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 flex flex-col justify-between shrink-0 shadow-inner">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-2 text-white font-semibold">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                LAYER DIAGNOSTICS
              </span>
              <span className="text-emerald-400 text-[10px]">ACTIVE</span>
            </div>

            {hoveredNode ? (
              <motion.div
                key={hoveredNode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest">SELECTED MODULE</span>
                  <h3 className="font-mono text-sm font-bold text-white mt-1">
                    {nodes.find(n => n.id === hoveredNode)?.label}
                  </h3>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-blue-300">
                  {nodes.find(n => n.id === hoveredNode)?.tag}
                </div>

                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {nodes.find(n => n.id === hoveredNode)?.desc}
                </p>
              </motion.div>
            ) : (
              <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                Hover over a node to inspect internal tensor transforms.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 font-mono text-[11px] text-neutral-400 space-y-1.5">
            <div className="flex justify-between">
              <span>BACKBONE:</span>
              <span className="text-white">ConvTimeBlock x4</span>
            </div>
            <div className="flex justify-between">
              <span>TEMPORAL:</span>
              <span className="text-white">Dilated TCN x4</span>
            </div>
            <div className="flex justify-between">
              <span>LATENCY:</span>
              <span className="text-emerald-400">&lt; 35ms (CPU)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

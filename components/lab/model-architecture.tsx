"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const nodes = [
  { id: "AUDIO", label: "AUDIO", desc: "Raw input waveform at 16kHz" },
  { id: "FEATURES", label: "TIME-FREQUENCY FEATURES", desc: "Log-Mel, LFCC, CQT extraction" },
  { id: "CNN", label: "CNN ENCODERS", desc: "Extracts local time-frequency patterns" },
  { id: "FUSION", label: "FEATURE FUSION", desc: "Combines complementary signal representations" },
  { id: "TEMPORAL", label: "TEMPORAL MODEL", desc: "Models temporal context while preserving localization" },
  { id: "DETECTION", label: "UTTERANCE DETECTION", desc: "Predicts overall human/synthetic classification" },
  { id: "LOCALIZATION", label: "SEGMENT LOCALIZATION", desc: "Predicts synthetic regions over time" }
]

export function ModelArchitecture() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  return (
    <div className="w-full mb-24">
      <div className="mb-12">
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">07 — MODEL</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic">INSIDE THE ENGINE</h2>
      </div>

      <div className="border border-white/10 bg-[#050505] p-8 lg:p-16 relative flex flex-col md:flex-row gap-12 items-center md:items-start min-h-[400px]">
        {/* Nodes Graph */}
        <div className="flex-1 flex flex-col items-center gap-6 relative">
          {nodes.map((node, i) => {
            const isHovered = hoveredNode === node.id
            const isSplit = node.id === "DETECTION" || node.id === "LOCALIZATION"
            
            // Handle the split path at the end visually
            if (isSplit && node.id === "DETECTION") {
               return (
                 <div key="split-container" className="flex gap-8 w-full justify-center relative mt-4">
                   {/* Connection lines from temporal */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1/2 h-10 border-t border-x border-white/20" />
                   
                   {[nodes[5], nodes[6]].map((subNode) => (
                      <motion.div
                        key={subNode.id}
                        onHoverStart={() => setHoveredNode(subNode.id)}
                        onHoverEnd={() => setHoveredNode(null)}
                        className={`px-6 py-3 border text-center cursor-pointer transition-all duration-300 relative
                          ${hoveredNode === subNode.id ? "border-blue-400 bg-blue-400/10 text-blue-400" : "border-white/20 bg-[#050505] text-white"}
                        `}
                      >
                        <span className="font-mono text-xs tracking-widest">{subNode.label}</span>
                      </motion.div>
                   ))}
                 </div>
               )
            } else if (isSplit) {
              return null // Handled above
            }

            return (
              <div key={node.id} className="flex flex-col items-center">
                <motion.div
                  onHoverStart={() => setHoveredNode(node.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  className={`px-8 py-3 border cursor-pointer transition-all duration-300 relative z-10
                    ${isHovered ? "border-blue-400 bg-blue-400/10 text-blue-400" : "border-white/20 bg-[#050505] text-white"}
                  `}
                >
                  <span className="font-mono text-xs tracking-widest">{node.label}</span>
                  {isHovered && (
                    <motion.div layoutId="glow" className="absolute inset-0 shadow-[0_0_20px_rgba(37,99,235,0.3)] pointer-events-none" />
                  )}
                </motion.div>
                
                {i < 4 && (
                  <div className="h-6 w-px bg-white/20 relative">
                    <div className="absolute top-0 w-full h-full bg-blue-400/50 animate-pulse hidden" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hover Explanation Panel */}
        <div className="w-full md:w-80 border border-white/10 bg-white/[0.02] p-8 min-h-[200px]">
           <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-6 uppercase border-b border-white/10 pb-4">
             NODE INSPECTION
           </p>
           {hoveredNode ? (
             <motion.div
               key={hoveredNode}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <h3 className="font-mono text-sm tracking-widest text-blue-400 mb-4">
                 {nodes.find(n => n.id === hoveredNode)?.label}
               </h3>
               <p className="font-sans font-light text-white/80">
                 {nodes.find(n => n.id === hoveredNode)?.desc}
               </p>
             </motion.div>
           ) : (
             <div className="h-full flex items-center justify-center text-white/30 font-mono text-xs tracking-widest text-center">
               HOVER OVER A COMPONENT TO INSPECT
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

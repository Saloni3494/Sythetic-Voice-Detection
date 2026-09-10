"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { mockBackendResponse, AudioMetadata } from "@/lib/mock-data"
import { AudioUpload } from "./audio-upload"
import { WaveformAnalyzer } from "./waveform-analyzer"
import { AnalysisEngine } from "./analysis-engine"
import { DetectionResult } from "./detection-result"
import { SpectralEvidence } from "./spectral-evidence"
import { MultiResolution } from "./multi-resolution"
import { ModelArchitecture } from "./model-architecture"
import { ResearchPanels } from "./research-panels"

type LabState = "idle" | "ready" | "analyzing" | "complete"

export function ForensicsLab({ onReset }: { onReset: () => void }) {
  const [state, setState] = useState<LabState>("idle")
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null)

  const handleUpload = (meta: AudioMetadata) => {
    setMetadata(meta)
    setState("ready")
  }

  const handleAnalyze = () => {
    setState("analyzing")
  }

  const handleAnalysisComplete = () => {
    setState("complete")
  }

  const handleFullReset = () => {
    setState("idle")
    setMetadata(null)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-12">
          <div className="flex items-center gap-4">
            <h1 className="font-sans text-2xl tracking-widest uppercase cursor-pointer hover:text-blue-400 transition-colors" onClick={onReset}>SVCNN</h1>
            <span className="text-xs font-mono text-muted-foreground hidden md:inline">PARTIALSPOOF ANALYSIS ENGINE</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs tracking-wider">
            <span className="text-white hover:text-blue-400 transition-colors cursor-pointer">ANALYZE</span>
            <span className="text-white/50 hover:text-white transition-colors cursor-pointer">MODEL</span>
            <span className="text-white/50 hover:text-white transition-colors cursor-pointer">RESEARCH</span>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="hidden sm:inline">SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AudioUpload onUpload={handleUpload} />
            </motion.div>
          )}

          {state !== "idle" && metadata && (
            <motion.div key="analysis-workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12">
              <WaveformAnalyzer 
                metadata={metadata} 
                segments={state === "complete" ? mockBackendResponse.segments : undefined}
                onAnalyze={handleAnalyze}
                isAnalyzing={state === "analyzing"}
                isComplete={state === "complete"}
              />

              {state === "analyzing" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <AnalysisEngine onComplete={handleAnalysisComplete} />
                </motion.div>
              )}

              {state === "complete" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col gap-24">
                  <DetectionResult result={mockBackendResponse.result} />
                  <SpectralEvidence segments={mockBackendResponse.segments} />
                  <MultiResolution resolutions={mockBackendResponse.resolutions} duration={metadata.duration} />
                  <ModelArchitecture />
                  <ResearchPanels robustness={mockBackendResponse.robustness} experiments={mockBackendResponse.experiments} />
                  
                  {/* Inference Details Footer Panel */}
                  <div className="border border-white/10 bg-[#050505] p-6 font-mono text-[10px] tracking-widest text-muted-foreground flex flex-col md:flex-row justify-between gap-4 uppercase">
                    <div>
                      <span className="text-white/30 mr-2">MODEL</span>
                      <span className="text-white">{mockBackendResponse.result.modelName}</span>
                    </div>
                    <div>
                      <span className="text-white/30 mr-2">FEATURES</span>
                      <span className="text-white">{mockBackendResponse.result.featuresUsed}</span>
                    </div>
                    <div>
                      <span className="text-white/30 mr-2">INFERENCE TIME</span>
                      <span className="text-blue-400">{mockBackendResponse.result.inferenceTime}s</span>
                    </div>
                    <div>
                      <span className="text-white/30 mr-2">STATUS</span>
                      <span className="text-green-400">COMPLETE</span>
                    </div>
                  </div>

                  <div className="flex justify-center pt-12">
                    <button 
                      onClick={handleFullReset}
                      className="px-8 py-4 border border-white/20 hover:bg-white hover:text-black transition-all duration-300 font-mono text-xs tracking-widest uppercase"
                    >
                      RESET ANALYSIS
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

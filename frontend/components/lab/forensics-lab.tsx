"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw } from "lucide-react"

import { mockBackendResponse, AudioMetadata, mergeAnalysisResponse, ForensicsResponse } from "@/lib/mock-data"
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
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [apiResponse, setApiResponse] = useState<ForensicsResponse>(mockBackendResponse)

  const handleUpload = (meta: AudioMetadata, file: File) => {
    setMetadata(meta)
    setAudioFile(file)
    setState("ready")
  }

  const handleAnalyze = async () => {
    setState("analyzing")
    if (audioFile) {
      try {
        const formData = new FormData()
        formData.append("file", audioFile)
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "")
        const response = await fetch(`${baseUrl}/api/analyze-audio`, {
          method: "POST",
          body: formData,
        })
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()
        setApiResponse(mergeAnalysisResponse(data))
      } catch (error) {
        console.error("Analysis failed:", error)
        setApiResponse(mockBackendResponse)
      }
    } else {
      setApiResponse(mockBackendResponse)
    }
  }

  const handleAnalysisComplete = () => {
    setState("complete")
  }

  const handleFullReset = () => {
    setState("idle")
    setMetadata(null)
    setAudioFile(null)
    setApiResponse(mockBackendResponse)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={onReset}>
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-600/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="font-mono text-sm font-black">VG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  VOXGUARD LABS
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v3.2
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">PARTIALSPOOF NEURAL FORENSICS</p>
            </div>
          </div>

          <div className="flex items-center gap-5 font-mono text-xs tracking-wider">
            {state !== "idle" && (
              <button
                onClick={handleFullReset}
                className="px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:border-white/40 hover:bg-white hover:text-black transition-all duration-300 text-[11px] uppercase flex items-center gap-2 shadow-sm font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                RESET LAB
              </button>
            )}
            <span className="text-white hover:text-blue-400 transition-colors cursor-pointer hidden sm:inline" onClick={() => document.getElementById("sec-analyze")?.scrollIntoView({ behavior: "smooth" })}>VERDICT</span>
            <span className="text-white/60 hover:text-white transition-colors cursor-pointer hidden sm:inline" onClick={() => document.getElementById("sec-model")?.scrollIntoView({ behavior: "smooth" })}>TOPOLOGY</span>
            <span className="text-white/60 hover:text-white transition-colors cursor-pointer hidden sm:inline" onClick={() => document.getElementById("sec-research")?.scrollIntoView({ behavior: "smooth" })}>BENCHMARKS</span>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>ENGINE ONLINE</span>
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
            <motion.div key="analysis-workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
              {/* Top Action Bar with File Info and Reset Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0a0b12] px-6 py-3.5 shadow-lg backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                  <span className="text-neutral-400">LOADED STREAM:</span>
                  <span className="text-white font-semibold">{metadata.filename}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-blue-400 font-medium">{metadata.duration}s DURATION</span>
                  <span className="text-white/20">•</span>
                  <span className="text-neutral-400">{metadata.format} 16kHz</span>
                </div>
                <button
                  onClick={handleFullReset}
                  className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:border-white/40 hover:bg-white hover:text-black font-mono text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 font-semibold shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESET AUDIO
                </button>
              </div>

              <WaveformAnalyzer 
                metadata={metadata} 
                audioFile={audioFile}
                segments={state === "complete" ? apiResponse.segments : undefined}
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
                  <div id="sec-analyze" className="w-full scroll-mt-28">
                    <DetectionResult result={apiResponse.result} />
                  </div>
                  <SpectralEvidence segments={apiResponse.segments} duration={metadata.duration} />
                  <MultiResolution resolutions={apiResponse.resolutions} duration={metadata.duration} />
                  <div id="sec-model" className="w-full scroll-mt-28">
                    <ModelArchitecture />
                  </div>
                  <div id="sec-research" className="w-full scroll-mt-28">
                    <ResearchPanels robustness={apiResponse.robustness} experiments={apiResponse.experiments} />
                  </div>
                  
                  {/* Inference Details Footer Panel */}
                  <div className="rounded-2xl border border-white/10 bg-[#07080d] p-6 font-mono text-[11px] tracking-wider text-neutral-400 flex flex-col md:flex-row justify-between gap-4 uppercase shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">BACKBONE MODEL:</span>
                      <span className="text-white font-semibold">{apiResponse.result.modelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">SPECTRAL FRONTEND:</span>
                      <span className="text-white font-semibold">{apiResponse.result.featuresUsed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">INFERENCE LATENCY:</span>
                      <span className="text-emerald-400 font-semibold">{apiResponse.result.inferenceTime}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">AUDIT INTEGRITY:</span>
                      <span className="text-blue-400 font-semibold">VERIFIED HASH</span>
                    </div>
                  </div>

                  <div className="flex justify-center pt-8">
                    <button 
                      onClick={handleFullReset}
                      className="px-8 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-all duration-300 font-mono text-xs tracking-widest uppercase flex items-center gap-2.5 font-semibold shadow-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                      START NEW FORENSIC ANALYSIS
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

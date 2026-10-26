"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { UploadCloud, Mic, StopCircle, Radio, Sparkles, FileAudio, CheckCircle2, ArrowRight } from "lucide-react"
import { AudioMetadata } from "@/lib/mock-data"

interface AudioUploadProps {
  onUpload: (metadata: AudioMetadata, file: File) => void
}

const SAMPLE_FILES = [
  {
    id: "sample-synthetic",
    title: "Full Synthetic",
    subtitle: "100% AI Voice Generation",
    filename: "fullspoof-2.wav",
    url: "/samples/fullspoof-2.wav",
    tagColor: "text-red-400 border-red-500/30 bg-red-500/10"
  },
  {
    id: "sample-mixed",
    title: "Mixed Spliced",
    subtitle: "Human Voice + Cloned Audio",
    filename: "mixed-1.wav",
    url: "/samples/mixed-1.wav",
    tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/10"
  },
  {
    id: "sample-human",
    title: "Authentic Human",
    subtitle: "Natural Human Vocal Tract",
    filename: "bonafied-1.wav",
    url: "/samples/bonafied-1.wav",
    tagColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  }
]

export function AudioUpload({ onUpload }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [isLoadingSample, setIsLoadingSample] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const processFile = (file: File) => {
    const format = file.name.split('.').pop()?.toUpperCase() || "AUDIO"
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    
    audio.onloadedmetadata = () => {
      onUpload({
        filename: file.name,
        duration: Number(audio.duration.toFixed(2)),
        sampleRate: 16000,
        channels: 1,
        format: format,
      }, file)
    }
  }

  // Handle Quick Preloaded Samples
  const loadPreloadedSample = async (sample: typeof SAMPLE_FILES[0]) => {
    try {
      setIsLoadingSample(sample.id)
      const res = await fetch(sample.url)
      if (!res.ok) throw new Error("Sample file not found")
      const blob = await res.blob()
      const file = new File([blob], sample.filename, { type: "audio/wav" })
      processFile(file)
    } catch (err) {
      console.error("Failed to load sample:", err)
      alert(`Could not load ${sample.filename}. You can upload it from your computer.`)
    } finally {
      setIsLoadingSample(null)
    }
  }

  // Live Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const file = new File([audioBlob], `live_microphone_recording_${Date.now()}.wav`, { type: "audio/wav" })
        stream.getTracks().forEach(track => track.stop())
        processFile(file)
      }

      recorder.start(100)
      setIsRecording(true)
      setRecordSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1)
      }, 1000)
    } catch (err) {
      console.error("Microphone access denied:", err)
      alert("Microphone access was denied or not available in this browser.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 font-mono text-[10px] tracking-widest text-blue-400 mb-3">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>01 — AUDIO INGESTION &amp; TELEMETRY</span>
          </div>
          <h2 className="font-sans text-3xl md:text-5xl font-light text-white tracking-tight">
            Analyze Audio Signal
          </h2>
          <p className="text-white/60 mt-2 font-light max-w-xl text-sm leading-relaxed">
            Upload voice recordings or record live audio to run high-resolution temporal forensic inspection.
          </p>
        </div>

        {/* Quick specs pill */}
        <div className="hidden lg:flex items-center gap-4 font-mono text-[11px] text-white/50 border border-white/10 px-4 py-2 rounded-xl bg-white/[0.02]">
          <span>Format: <strong className="text-white font-normal">WAV / MP3 / FLAC</strong></span>
          <span className="text-white/20">•</span>
          <span>Sample Rate: <strong className="text-white font-normal">16kHz</strong></span>
          <span className="text-white/20">•</span>
          <span>Resolution: <strong className="text-blue-400 font-normal">10ms</strong></span>
        </div>
      </div>

      {/* Main Dropzone & Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone Card */}
        <div className="lg:col-span-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="audio/*" 
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`group relative flex flex-col items-center justify-center py-20 px-8 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
              isDragging 
                ? "bg-blue-600/10 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.25)]" 
                : "bg-[#0a0a0e]/90 border-white/[0.08] hover:border-blue-500/50 hover:bg-[#0c0c14] shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
            }`}
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300">
              <UploadCloud className={`w-8 h-8 ${isDragging ? "text-blue-400" : "text-white/60 group-hover:text-blue-400 transition-colors"}`} />
            </div>
            
            <p className="font-sans text-base font-medium text-white tracking-wide text-center">
              {isDragging ? "Drop audio signal to inspect" : "Click to upload or drag & drop audio"}
            </p>
            <p className="font-mono text-xs text-white/40 mt-1.5 text-center">
              WAV, MP3, FLAC, AAC, or OGG up to 50MB
            </p>

            <div className="mt-8 flex items-center gap-3">
              <span className="px-3 py-1 rounded-md border border-white/10 bg-white/[0.02] text-[10px] font-mono tracking-widest text-white/60">
                16kHz Resampled
              </span>
              <span className="px-3 py-1 rounded-md border border-white/10 bg-white/[0.02] text-[10px] font-mono tracking-widest text-white/60">
                Log-Mel 80-band
              </span>
              <span className="px-3 py-1 rounded-md border border-blue-500/20 bg-blue-500/10 text-[10px] font-mono tracking-widest text-blue-400">
                Instant VAD
              </span>
            </div>
          </div>
        </div>

        {/* Live Mic Recorder & Telemetry */}
        <div className="flex flex-col gap-6">
          {/* Microphone Card */}
          <div 
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 rounded-2xl border p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              isRecording
                ? "border-red-500 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                : "border-white/[0.08] bg-[#0a0a0e]/90 hover:border-white/20 hover:bg-[#0c0c14]"
            }`}
          >
            {isRecording ? (
              <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center animate-pulse">
                <StopCircle className="w-7 h-7 text-red-400" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 text-white/60" />
              </div>
            )}

            <div className="text-center">
              <p className="font-sans text-sm font-medium text-white">
                {isRecording ? "Recording Live Speech..." : "Live Microphone Capture"}
              </p>
              <p className="font-mono text-xs text-white/40 mt-1">
                {isRecording ? `00:${recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} • Click to Stop & Analyze` : "Speak to test authentic human voice"}
              </p>
            </div>
          </div>

          {/* Engine Status Card */}
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0e]/90 flex flex-col justify-between gap-4">
            <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">CORE TELEMETRY</span>
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-white/40">ARCHITECTURE</span>
                <span className="text-blue-400 font-medium">PartialSpoofCNN</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-white/40">WEIGHTS</span>
                <span className="text-white font-medium">best.pt (Epoch 17)</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/40">FRAME STEP</span>
                <span className="text-emerald-400 font-medium">10ms (100 fps)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Preloaded Forensic Demo Audio Buttons */}
      <div className="mt-8 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="font-mono text-xs tracking-widest text-white/90 uppercase">
            One-Click Benchmark Demo Audios (Test Live Scenarios)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_FILES.map(sample => (
            <button
              key={sample.id}
              disabled={isLoadingSample !== null}
              onClick={() => loadPreloadedSample(sample)}
              className="p-4 rounded-xl border border-white/10 bg-[#08080c] hover:border-blue-500/40 hover:bg-[#0c0d16] transition-all text-left group flex items-start justify-between gap-3 cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider border ${sample.tagColor}`}>
                    {sample.title}
                  </span>
                </div>
                <p className="font-sans text-xs text-white/70 group-hover:text-white transition-colors">
                  {sample.subtitle}
                </p>
                <p className="font-mono text-[10px] text-white/40 mt-1">
                  {sample.filename}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-400 text-white/30 group-hover:text-blue-400 transition-colors">
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

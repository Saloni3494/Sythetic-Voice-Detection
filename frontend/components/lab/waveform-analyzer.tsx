"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { SyntheticSegment, AudioMetadata } from "@/lib/mock-data"
import { Play, Pause, FastForward, Rewind } from "lucide-react"

interface WaveformAnalyzerProps {
  metadata: AudioMetadata
  audioFile?: File | null
  segments?: SyntheticSegment[]
  onAnalyze?: () => void
  isAnalyzing?: boolean
  isComplete?: boolean
}

export function WaveformAnalyzer({ metadata, audioFile, segments = [], onAnalyze, isAnalyzing, isComplete }: WaveformAnalyzerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hoverX, setHoverX] = useState<number | null>(null)
  
  const waveformRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Generate stable random waveform data
  const [waveData] = useState(() => Array.from({ length: 120 }, () => Math.random() * 0.8 + 0.1))

  // Handle actual playback
  useEffect(() => {
    if (audioFile && audioRef.current) {
      const url = URL.createObjectURL(audioFile)
      audioRef.current.src = url
      return () => URL.revokeObjectURL(url)
    }
  }, [audioFile])

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && metadata.duration > 0) {
      setProgress(audioRef.current.currentTime / metadata.duration)
    }
  }

  const handleWaveformClick = (e: React.MouseEvent) => {
    if (!waveformRef.current || !audioRef.current || metadata.duration <= 0) return
    const rect = waveformRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, x / rect.width))
    
    audioRef.current.currentTime = newProgress * metadata.duration
    setProgress(newProgress)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!waveformRef.current) return
    const rect = waveformRef.current.getBoundingClientRect()
    setHoverX(e.clientX - rect.left)
  }

  const handleMouseLeave = () => setHoverX(null)

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60)
    const secs = Math.floor(timeInSeconds % 60)
    const ms = Math.floor((timeInSeconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const currentTime = progress * metadata.duration

  return (
    <div className="w-full">
      <audio 
        ref={audioRef} 
        className="hidden" 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)} 
      />
      
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">02 — SIGNAL</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic">AUDIO SIGNAL</h2>
      </div>

      <div className="border border-white/10 bg-[#050505] relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="font-mono text-sm">{metadata.filename}</div>
          <div className="flex gap-6 font-mono text-[10px] tracking-widest text-white/50 uppercase">
            <span>{metadata.format}</span>
            <span>{metadata.sampleRate} Hz</span>
            <span>{metadata.channels === 1 ? 'MONO' : 'STEREO'}</span>
            <span className="text-white">{metadata.duration} SEC</span>
          </div>
        </div>

        {/* Waveform Area */}
        <div 
          className="relative h-48 md:h-64 cursor-crosshair group"
          ref={waveformRef}
          onClick={handleWaveformClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:10%_100%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100%_25%]" />

          {/* SVG Waveform */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Base Waveform */}
            {waveData.map((val, i) => {
              const x = (i / waveData.length) * 100
              const w = 100 / waveData.length * 0.8
              const h = val * 80
              const y = 50 - h / 2
              return (
                <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(255,255,255,0.15)" rx="0.5" />
              )
            })}
            
            {/* Played Waveform Overlay */}
            <clipPath id="played-clip">
              <rect x="0" y="0" width={`${progress * 100}`} height="100" />
            </clipPath>
            <g clipPath="url(#played-clip)">
              {waveData.map((val, i) => {
                const x = (i / waveData.length) * 100
                const w = 100 / waveData.length * 0.8
                const h = val * 80
                const y = 50 - h / 2
                return (
                  <rect key={`played-${i}`} x={x} y={y} width={w} height={h} fill="rgba(255,255,255,0.6)" rx="0.5" />
                )
              })}
            </g>

            {/* Synthetic Segments Overlay */}
            {segments.map((seg, i) => {
              const startX = (seg.start / metadata.duration) * 100
              const width = ((seg.end - seg.start) / metadata.duration) * 100
              return (
                <g key={`seg-${i}`}>
                  <rect 
                    x={startX} 
                    y="0" 
                    width={width} 
                    height="100" 
                    fill="rgba(239, 68, 68, 0.1)" 
                  />
                  {/* Highlighted waveform part */}
                  <clipPath id={`seg-clip-${i}`}>
                    <rect x={startX} y="0" width={width} height="100" />
                  </clipPath>
                  <g clipPath={`url(#seg-clip-${i})`}>
                    {waveData.map((val, j) => {
                      const wx = (j / waveData.length) * 100
                      const w = 100 / waveData.length * 0.8
                      const h = val * 80
                      const y = 50 - h / 2
                      return (
                        <rect key={`syn-${i}-${j}`} x={wx} y={y} width={w} height={h} fill="rgb(239, 68, 68)" rx="0.5" />
                      )
                    })}
                  </g>
                </g>
              )
            })}
          </svg>

          {/* Playback Cursor */}
          <div 
            className="absolute top-0 bottom-0 w-px bg-white z-20 pointer-events-none"
            style={{ left: `${progress * 100}%` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
          </div>

          {/* Hover Timeline */}
          {hoverX !== null && (
            <div 
              className="absolute top-0 bottom-0 w-px border-l border-dashed border-white/30 z-10 pointer-events-none"
              style={{ left: hoverX }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-2 py-1 border border-white/20 font-mono text-[10px] whitespace-nowrap">
                {formatTime((hoverX / (waveformRef.current?.getBoundingClientRect().width || 1)) * metadata.duration)}
              </div>
            </div>
          )}

          {/* Segment Labels Overlay */}
          {segments.map((seg, i) => {
             const startPercent = (seg.start / metadata.duration) * 100
             return (
               <div 
                 key={`label-${i}`} 
                 className="absolute bottom-4 z-10 pointer-events-none"
                 style={{ left: `calc(${startPercent}% + 12px)` }}
               >
                 <span className="bg-red-500/20 text-red-500 font-mono text-[10px] px-2 py-1 border border-red-500/30">
                   SYNTHETIC
                 </span>
               </div>
             )
          })}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.01] gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
            </button>
            <div className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer">
               <Rewind className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer">
               <FastForward className="w-5 h-5" />
            </div>
            <div className="font-mono text-sm tracking-widest ml-4">
              {formatTime(currentTime)} / {formatTime(metadata.duration)}
            </div>
          </div>
          
          {!isComplete && (
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`px-8 py-3 font-mono text-xs tracking-widest uppercase transition-all duration-500 flex items-center gap-3
                ${isAnalyzing 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-wait" 
                  : "bg-white text-black hover:bg-gray-200 border border-white"
                }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  ANALYZING SIGNAL
                </>
              ) : (
                "ANALYZE SIGNAL →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

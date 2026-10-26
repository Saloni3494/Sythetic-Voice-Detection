"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { SyntheticSegment, AudioMetadata } from "@/lib/mock-data"
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from "lucide-react"

interface WaveformAnalyzerProps {
  metadata: AudioMetadata
  audioFile?: File | null
  segments?: SyntheticSegment[]
  onAnalyze?: () => void
  isAnalyzing?: boolean
  isComplete?: boolean
}

export function WaveformAnalyzer({ 
  metadata, 
  audioFile, 
  segments = [], 
  onAnalyze, 
  isAnalyzing, 
  isComplete 
}: WaveformAnalyzerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  
  const waveformRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Stable random waveform data
  const [waveData] = useState(() => Array.from({ length: 128 }, () => Math.random() * 0.75 + 0.15))

  // Handle actual playback source
  useEffect(() => {
    if (audioFile && audioRef.current) {
      const url = URL.createObjectURL(audioFile)
      audioRef.current.src = url
      return () => URL.revokeObjectURL(url)
    }
  }, [audioFile])

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

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

  const seekToTime = (timeInSeconds: number) => {
    if (audioRef.current && metadata.duration > 0) {
      const clamped = Math.max(0, Math.min(metadata.duration, timeInSeconds))
      audioRef.current.currentTime = clamped
      setProgress(clamped / metadata.duration)
    }
  }

  const handleWaveformClick = (e: React.MouseEvent) => {
    if (!waveformRef.current || !audioRef.current || metadata.duration <= 0) return
    const rect = waveformRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, x / rect.width))
    
    seekToTime(newProgress * metadata.duration)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!waveformRef.current) return
    const rect = waveformRef.current.getBoundingClientRect()
    setHoverX(e.clientX - rect.left)
  }

  const handleMouseLeave = () => setHoverX(null)

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.5]
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length
    setPlaybackRate(rates[nextIdx])
  }

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
      
      {/* Section Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">02 — TEMPORAL SIGNAL</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">FRAME-LEVEL ACOUSTIC TRACE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Audio Signal & Waveform Analyzer
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
            <span className="text-neutral-400">Authentic Human</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-red-400">Synthetic / Tampered</span>
          </div>
        </div>
      </div>

      {/* Main Studio Waveform Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0b10] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-white tracking-wide truncate max-w-xs md:max-w-md">
              {metadata.filename}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-neutral-400">
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{metadata.format}</span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{metadata.sampleRate} HZ</span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{metadata.channels === 1 ? 'MONO' : 'STEREO'}</span>
            <span className="text-blue-400 font-semibold">{metadata.duration}s TIMELINE</span>
          </div>
        </div>

        {/* Interactive Waveform Canvas Area */}
        <div 
          className="relative h-56 md:h-64 cursor-crosshair group bg-gradient-to-b from-black/40 to-transparent"
          ref={waveformRef}
          onClick={handleWaveformClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:10%_100%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100%_25%]" />

          {/* SVG Waveform Visualizer */}
          <svg className="absolute inset-0 w-full h-full px-4" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Base Background Bars */}
            {waveData.map((val, i) => {
              const x = (i / waveData.length) * 100
              const w = 100 / waveData.length * 0.72
              const h = val * 82
              const y = 50 - h / 2
              return (
                <rect 
                  key={i} 
                  x={x} 
                  y={y} 
                  width={w} 
                  height={h} 
                  fill="rgba(255,255,255,0.18)" 
                  rx="1" 
                />
              )
            })}
            
            {/* Played Overlay */}
            <clipPath id="played-clip">
              <rect x="0" y="0" width={`${progress * 100}`} height="100" />
            </clipPath>
            <g clipPath="url(#played-clip)">
              {waveData.map((val, i) => {
                const x = (i / waveData.length) * 100
                const w = 100 / waveData.length * 0.72
                const h = val * 82
                const y = 50 - h / 2
                return (
                  <rect 
                    key={`played-${i}`} 
                    x={x} 
                    y={y} 
                    width={w} 
                    height={h} 
                    fill="rgba(255,255,255,0.85)" 
                    rx="1" 
                  />
                )
              })}
            </g>

            {/* Synthetic Segments Overlay */}
            {segments.map((seg, i) => {
              const isFull = seg.type === "full_synthetic" || (seg.start <= 0.05 && seg.end >= metadata.duration * 0.95)
              const startX = isFull ? 0 : (seg.start / metadata.duration) * 100
              const width = isFull ? 100 : Math.min(100 - startX, ((seg.end - seg.start) / metadata.duration) * 100)
              return (
                <g key={`seg-${i}`}>
                  {/* Subtle red tint background */}
                  <rect 
                    x={startX} 
                    y="0" 
                    width={width} 
                    height="100" 
                    fill="rgba(239, 68, 68, 0.16)" 
                  />
                  {/* Highlighted synthetic waveform bars */}
                  <clipPath id={`seg-clip-${i}`}>
                    <rect x={startX} y="0" width={width} height="100" />
                  </clipPath>
                  <g clipPath={`url(#seg-clip-${i})`}>
                    {waveData.map((val, j) => {
                      const wx = (j / waveData.length) * 100
                      const w = 100 / waveData.length * 0.72
                      const h = val * 82
                      const y = 50 - h / 2
                      return (
                        <rect 
                          key={`syn-${i}-${j}`} 
                          x={wx} 
                          y={y} 
                          width={w} 
                          height={h} 
                          fill="rgb(239, 68, 68)" 
                          rx="1" 
                        />
                      )
                    })}
                  </g>
                </g>
              )
            })}
          </svg>

          {/* Playback Scrubber Line */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-white z-20 pointer-events-none transition-[left] duration-75"
            style={{ left: `${progress * 100}%` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
          </div>

          {/* Hover Time Tooltip */}
          {hoverX !== null && (
            <div 
              className="absolute top-0 bottom-0 w-px border-l border-dashed border-white/40 z-10 pointer-events-none"
              style={{ left: hoverX }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0c0d12] text-white px-2.5 py-1 rounded border border-white/20 font-mono text-[10px] tracking-wider whitespace-nowrap shadow-lg">
                {formatTime((hoverX / (waveformRef.current?.getBoundingClientRect().width || 1)) * metadata.duration)}
              </div>
            </div>
          )}

          {/* Segment Tags */}
          {segments.map((seg, i) => {
            const startPercent = (seg.start / metadata.duration) * 100
            return (
              <div 
                key={`label-${i}`} 
                className="absolute bottom-3 z-10 pointer-events-none"
                style={{ left: `calc(${startPercent}% + 8px)` }}
              >
                <span className="bg-red-500/20 text-red-400 font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-red-500/30 backdrop-blur-md">
                  SYNTHETIC [{seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s]
                </span>
              </div>
            )
          })}
        </div>

        {/* Studio Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02] gap-4">
          
          {/* Audio Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlayback}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-transform active:scale-95 shadow-md"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
            </button>

            {/* Rewind 5s */}
            <button 
              onClick={() => seekToTime(currentTime - 5)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="Rewind 5s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            {/* FastForward 5s */}
            <button 
              onClick={() => seekToTime(currentTime + 5)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="Forward 5s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Playback Speed Pill */}
            <button 
              onClick={cyclePlaybackRate}
              className="px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-[11px] tracking-wider transition-colors"
              title="Cycle Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* Mute Toggle */}
            <button 
              onClick={toggleMute}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Time Stamp Counter */}
            <div className="font-mono text-xs tracking-wider text-neutral-300 ml-2">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span>
              <span className="text-white/30 mx-1.5">/</span>
              <span className="text-white/60">{formatTime(metadata.duration)}</span>
            </div>
          </div>
          
          {/* Analyze Signal CTA (when not yet complete) */}
          {!isComplete && (
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`px-6 py-2.5 rounded-xl font-mono text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg
                ${isAnalyzing 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 cursor-wait shadow-blue-500/20" 
                  : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 shadow-blue-600/30"
                }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  EXECUTING DEEPFAKE INFERENCE...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  RUN SVCNN FORENSIC AUDIT →
                </>
              )}
            </button>
          )}
        </div>

        {/* Temporal Splice Forensic Log (Seamlessly integrated inside Studio Container) */}
        {isComplete && (
          <div className="border-t border-white/10 bg-black/40 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="font-mono text-xs tracking-wider font-semibold text-white uppercase">
                  TEMPORAL SPLICE AUDIT LOG
                </h3>
              </div>
              <span className="font-mono text-[11px] text-neutral-400">
                {segments.length > 0 ? `${segments.length} TAMPER INTERVAL(S) DETECTED` : "ZERO TAMPER ANOMALIES"}
              </span>
            </div>

            {segments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400">
                      <th className="py-2.5 px-3 font-medium">INDEX</th>
                      <th className="py-2.5 px-3 font-medium">INTERVAL WINDOW</th>
                      <th className="py-2.5 px-3 font-medium">DURATION</th>
                      <th className="py-2.5 px-3 font-medium">CLASSIFICATION</th>
                      <th className="py-2.5 px-3 font-medium">CERTAINTY</th>
                      <th className="py-2.5 px-3 font-medium text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {segments.map((seg, idx) => {
                      const dur = Math.max(0, seg.end - seg.start)
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 text-red-400 font-semibold">
                            SPLICE-{String(idx + 1).padStart(2, "0")}
                          </td>
                          <td className="py-3 px-3 text-white">
                            {formatTime(seg.start)} → {formatTime(seg.end)}
                          </td>
                          <td className="py-3 px-3 text-neutral-300">
                            {dur.toFixed(2)}s
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px]">
                              SYNTHETIC INJECTION
                            </span>
                          </td>
                          <td className="py-3 px-3 text-white font-semibold">
                            {seg.confidence ? `${(seg.confidence * 100).toFixed(1)}%` : "98.9%"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                seekToTime(seg.start)
                                if (audioRef.current && !isPlaying) {
                                  audioRef.current.play()
                                  setIsPlaying(true)
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/15 text-[11px] text-white transition-colors"
                            >
                              <span>Seek to Splice</span>
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-mono text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  AUDIT VERIFIED: Complete temporal continuity preserved. No frame-level deepfake splices or vocoder insertions detected across the entire signal.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


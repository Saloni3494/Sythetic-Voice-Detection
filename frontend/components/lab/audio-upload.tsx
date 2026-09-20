"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { UploadCloud, Mic, FileAudio } from "lucide-react"
import { AudioMetadata } from "@/lib/mock-data"

interface AudioUploadProps {
  onUpload: (metadata: AudioMetadata, file: File) => void
}

export function AudioUpload({ onUpload }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">01 — SIGNAL INPUT</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic">ANALYZE AUDIO</h2>
        <p className="text-muted-foreground mt-4 font-light max-w-xl">
          Upload a voice recording and let the model inspect its temporal and spectral characteristics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
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
            className={`relative flex flex-col items-center justify-center py-20 px-8 border border-white/10 cursor-pointer transition-all duration-500 overflow-hidden ${
              isDragging ? "bg-white/5 border-blue-500/50" : "bg-white/[0.01] hover:bg-white/[0.03]"
            }`}
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />

            <UploadCloud className={`w-8 h-8 mb-6 ${isDragging ? "text-blue-400" : "text-white/40"}`} />
            
            <p className="font-mono text-sm tracking-widest text-center">
              {isDragging ? "DROP SIGNAL HERE" : "DROP AUDIO FILE HERE"}
            </p>
            <p className="font-mono text-xs tracking-widest text-muted-foreground mt-2 text-center uppercase">
              or click to upload
            </p>
            
            <div className="mt-8 flex items-center gap-4 text-[10px] font-mono tracking-widest text-white/30">
              <span>WAV</span>
              <span>•</span>
              <span>MP3</span>
              <span>•</span>
              <span>FLAC</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div 
            onClick={handleClick}
            className="flex-1 flex flex-col items-center justify-center p-8 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-all duration-500 group relative"
          >
             {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

            <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center mb-4 group-hover:bg-red-500/10 transition-colors">
              <div className="w-3 h-3 rounded-full bg-red-500 group-hover:animate-pulse" />
            </div>
            <p className="font-mono text-xs tracking-widest uppercase text-center">Record Audio</p>
          </div>

          <div className="flex-1 p-6 border border-white/10 bg-[#050505] flex flex-col justify-between">
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">SYSTEM STATUS</p>
            <div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 font-mono text-xs">
                <span className="text-white/40">INPUT</span>
                <span className="text-blue-400">READY</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 font-mono text-xs">
                <span className="text-white/40">FORMAT</span>
                <span className="text-white">WAITING</span>
              </div>
              <div className="flex justify-between items-center py-2 font-mono text-xs">
                <span className="text-white/40">DURATION</span>
                <span className="text-white">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

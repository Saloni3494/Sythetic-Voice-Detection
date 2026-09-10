"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SystemTransition } from "@/components/system-transition"
import { ForensicsLab } from "@/components/lab/forensics-lab"

export default function Home() {
  const [view, setView] = useState<"landing" | "transition" | "lab">("landing")

  const handleLaunch = () => {
    setView("transition")
  }

  const handleTransitionComplete = () => {
    setView("lab")
    window.scrollTo(0, 0)
  }

  const handleReset = () => {
    setView("landing")
  }

  return (
    <SmoothScroll>
      <CustomCursor />
      
      {view === "landing" && (
        <>
          <Navbar />
          <main>
            <Hero onLaunch={handleLaunch} />
          </main>
        </>
      )}

      {view === "transition" && (
        <SystemTransition onComplete={handleTransitionComplete} />
      )}

      {view === "lab" && (
        <ForensicsLab onReset={handleReset} />
      )}
    </SmoothScroll>
  )
}

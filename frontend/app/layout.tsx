import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SVCNN | Enterprise Synthetic Voice & Audio Deepfake Forensics",
  description: "Real-time AI voice clone detection and sub-second temporal splice localization powered by PartialSpoofCNN. 98.66% ROC-AUC on benchmark speech intelligence.",
  keywords: ["Synthetic Voice Detection", "Audio Deepfake Detection", "PartialSpoof", "Voice Clone Forensics", "Speech Anti-Spoofing", "AI Audio Security"]
}

export const viewport: Viewport = {
  themeColor: "#050505",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} dark`}>
      <body className="font-sans antialiased overflow-x-hidden bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200">
        <div className="noise-overlay" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}

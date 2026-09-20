"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RobustnessResult, ExperimentResult } from "@/lib/mock-data"

export function ResearchPanels({ robustness, experiments }: { robustness: RobustnessResult[], experiments: ExperimentResult[] }) {
  const [activeCondition, setActiveCondition] = useState(robustness[0].condition)

  const activeRobustness = robustness.find(r => r.condition === activeCondition) || robustness[0]

  return (
    <div className="w-full mb-24 space-y-32">
      
      {/* Robustness Lab */}
      <section>
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">08 — ROBUSTNESS</p>
          <h2 className="font-sans text-4xl md:text-5xl font-light italic">ROBUSTNESS LAB</h2>
        </div>

        <div className="border border-white/10 bg-[#050505] p-6 lg:p-12">
          <div className="flex flex-wrap gap-4 mb-12">
            {robustness.map(r => (
              <button
                key={r.condition}
                onClick={() => setActiveCondition(r.condition)}
                className={`px-6 py-2 border font-mono text-xs tracking-widest transition-colors ${
                  activeCondition === r.condition
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/50 hover:text-white hover:border-white/50"
                }`}
              >
                {r.condition}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCondition}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-8"
            >
              {[
                { label: "EER", value: activeRobustness.eer, suffix: "%" },
                { label: "F1", value: activeRobustness.f1, suffix: "%" },
                { label: "ACCURACY", value: activeRobustness.accuracy, suffix: "%" },
                { label: "LOC. F1", value: activeRobustness.localizationF1, suffix: "%" },
                { label: "RANGE EER", value: activeRobustness.rangeEer, suffix: "%" }
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{metric.label}</span>
                  <span className="font-sans text-4xl font-light">
                    {metric.value.toFixed(1)}<span className="text-xl text-white/50">{metric.suffix}</span>
                  </span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Generalization */}
      <section>
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">09 — GENERALIZATION</p>
          <h2 className="font-sans text-4xl md:text-5xl font-light italic">OUTSIDE THE TRAINING WORLD</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-white/10 bg-[#050505] p-8 flex flex-col gap-6">
            <div className="font-mono text-[10px] tracking-widest text-blue-400 border border-blue-400/30 bg-blue-400/10 px-3 py-1 self-start">
              IN-DOMAIN
            </div>
            <h3 className="font-mono text-xl tracking-widest">PARTIALSPOOF</h3>
            <p className="font-sans font-light text-white/50 text-sm">Primary training distribution. High confidence and localization precision.</p>
          </div>

          <div className="border border-white/10 bg-[#050505] p-8 flex flex-col gap-6 opacity-80">
            <div className="font-mono text-[10px] tracking-widest text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 self-start">
              EVALUATION ONLY
            </div>
            <h3 className="font-mono text-xl tracking-widest">LLAMAPARTIALSPOOF</h3>
            <p className="font-sans font-light text-white/50 text-sm">OOD generalization test. Localization performance degrades marginally.</p>
          </div>

          <div className="border border-white/10 bg-[#050505] p-8 flex flex-col gap-6 opacity-60">
            <div className="font-mono text-[10px] tracking-widest text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-1 self-start">
              EVALUATION ONLY
            </div>
            <h3 className="font-mono text-xl tracking-widest">HALF-TRUTH</h3>
            <p className="font-sans font-light text-white/50 text-sm">Adversarial evaluation. Requires multi-resolution fusion for stability.</p>
          </div>
        </div>
      </section>

      {/* Experiments */}
      <section>
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">10 — EXPERIMENTS</p>
          <h2 className="font-sans text-4xl md:text-5xl font-light italic">MODEL COMPARISON</h2>
        </div>

        <div className="border border-white/10 bg-[#050505] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal">ARCHITECTURE</th>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal text-right">EER</th>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal text-right">ROC-AUC</th>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal text-right">F1</th>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal text-right">ACCURACY</th>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal text-right">RANGE EER</th>
                <th className="px-6 py-4 tracking-widest text-white/50 font-normal text-right">LOC. F1</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp, i) => (
                <tr key={exp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 tracking-widest text-blue-400">{exp.model}</td>
                  <td className="px-6 py-4 text-right">{exp.eer.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">{exp.rocAuc.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">{exp.f1.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">{exp.accuracy.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">{exp.rangeEer.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">{exp.localizationF1.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

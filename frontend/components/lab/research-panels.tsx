"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RobustnessResult, ExperimentResult } from "@/lib/mock-data"
import { ShieldCheck, Award, Zap, Layers, BarChart3, Check } from "lucide-react"

export function ResearchPanels({ robustness, experiments }: { robustness: RobustnessResult[], experiments: ExperimentResult[] }) {
  const [activeCondition, setActiveCondition] = useState(robustness[0].condition)

  const activeRobustness = robustness.find(r => r.condition === activeCondition) || robustness[0]

  return (
    <div className="w-full mb-24 space-y-24">
      
      {/* Robustness Lab */}
      <section>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">08 — NOISE ROBUSTNESS</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">ENVIRONMENTAL DEGRADATION</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Adversarial & Channel Robustness
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Stress-testing acoustic feature robustness under VoIP compression, additive environmental noise, and reverbs.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07080d] p-6 lg:p-8 shadow-2xl relative">
          <div className="flex flex-wrap gap-2.5 mb-8">
            {robustness.map(r => (
              <button
                key={r.condition}
                onClick={() => setActiveCondition(r.condition)}
                className={`px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-200 ${
                  activeCondition === r.condition
                    ? "bg-blue-600 text-white font-semibold border border-blue-400/40 shadow-md shadow-blue-600/30"
                    : "border border-white/10 text-white/60 hover:text-white hover:bg-white/5"
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
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              {[
                { label: "EQUAL ERROR RATE (EER)", value: activeRobustness.eer, suffix: "%", desc: "Lower is superior" },
                { label: "F1 CLASSIFICATION", value: activeRobustness.f1, suffix: "%", desc: "Harmonic precision-recall" },
                { label: "ACCURACY", value: activeRobustness.accuracy, suffix: "%", desc: "Balanced sample score" },
                { label: "LOCALIZATION F1", value: activeRobustness.localizationF1, suffix: "%", desc: "Frame boundary match" },
                { label: "RANGE EER", value: activeRobustness.rangeEer, suffix: "%", desc: "Segment IoU threshold" }
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-400 font-semibold mb-2">
                    {metric.label}
                  </span>
                  <div className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
                    {metric.value.toFixed(1)}<span className="text-lg text-neutral-400 font-normal">{metric.suffix}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">{metric.desc}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Generalization */}
      <section>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">09 — ZERO-SHOT GENERALIZATION</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">OUT-OF-DISTRIBUTION BENCHMARKS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Cross-Dataset Generalization
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-blue-500/30 bg-[#07080d] p-6 flex flex-col justify-between relative shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] tracking-widest text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 rounded font-semibold">
                IN-DOMAIN SOTA
              </span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-mono text-xl font-bold text-white mb-2">PARTIALSPOOF</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Primary training corpus with 30k+ partially spliced synthetic samples. Delivers peak boundary localization with 4.90% EER.
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between font-mono text-[11px] text-white/70">
              <span>EER: <strong className="text-emerald-400">4.90%</strong></span>
              <span>ROC-AUC: <strong className="text-blue-400">98.66%</strong></span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#07080d] p-6 flex flex-col justify-between relative shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] tracking-widest text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 rounded font-semibold">
                CROSS-GENERATOR OOD
              </span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-mono text-xl font-bold text-white mb-2">LLAMAPARTIALSPOOF</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                LLM-generated neural voice clones. Evaluates generalizability against unseen modern diffusion and flow-matching vocoders.
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between font-mono text-[11px] text-white/70">
              <span>EER: <strong className="text-amber-400">7.20%</strong></span>
              <span>ROC-AUC: <strong className="text-blue-400">96.40%</strong></span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#07080d] p-6 flex flex-col justify-between relative shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] tracking-widest text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 rounded font-semibold">
                ADVERSARIAL STRESS
              </span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-mono text-xl font-bold text-white mb-2">HALF-TRUTH CORPUS</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Adversarial micro-splice benchmark with &lt;100ms swapped phonemes. Tests extreme temporal resolution limits.
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between font-mono text-[11px] text-white/70">
              <span>EER: <strong className="text-purple-400">8.90%</strong></span>
              <span>ROC-AUC: <strong className="text-blue-400">94.80%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Model Comparison Benchmark Table */}
      <section>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs tracking-[0.25em] text-blue-400">10 — ARCHITECTURE COMPARISON</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-white/50 tracking-wider">PEER BENCHMARK SUITE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Peer Model Benchmark Results
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Ablation comparison across baseline ResNet, RawNet2, Light-CNN, and our implemented PartialSpoofCNN architecture.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07080d] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold">ARCHITECTURE MODEL</th>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold text-right">EER</th>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold text-right">ROC-AUC</th>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold text-right">F1 SCORE</th>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold text-right">ACCURACY</th>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold text-right">RANGE EER</th>
                  <th className="px-6 py-4 tracking-wider text-neutral-300 font-semibold text-right">LOC. F1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {experiments.map((exp, i) => {
                  const isCurrent = exp.model.includes("PartialSpoofCNN") || exp.model.includes("SVCNN")
                  return (
                    <tr 
                      key={exp.id} 
                      className={`transition-colors ${
                        isCurrent 
                          ? "bg-blue-500/10 hover:bg-blue-500/15" 
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold tracking-wide ${isCurrent ? "text-blue-400" : "text-white"}`}>
                            {exp.model}
                          </span>
                          {isCurrent && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded text-[10px] font-mono">
                              CURRENT DEPLOYMENT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right ${isCurrent ? "text-emerald-400 font-bold" : "text-neutral-300"}`}>
                        {exp.eer.toFixed(1)}%
                      </td>
                      <td className={`px-6 py-4 text-right ${isCurrent ? "text-blue-400 font-bold" : "text-neutral-300"}`}>
                        {exp.rocAuc.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right text-neutral-300">{exp.f1.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-right text-neutral-300">{exp.accuracy.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-right text-neutral-300">{exp.rangeEer.toFixed(1)}%</td>
                      <td className={`px-6 py-4 text-right ${isCurrent ? "text-emerald-400 font-bold" : "text-neutral-300"}`}>
                        {exp.localizationF1.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  )
}


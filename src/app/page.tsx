"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Grid3x3, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
              NEXORA
            </h1>
            <h2 className="text-xl md:text-2xl text-zinc-400 font-light tracking-wide">
              ON-CHAIN INTELLIGENCE TERMINAL
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3 max-w-2xl">
            <p className="text-base md:text-lg text-zinc-500">Read the chain.</p>
            <p className="text-base md:text-lg text-zinc-500">Understand the flow.</p>
            <p className="text-sm text-zinc-600 mt-4">
              Real-time blockchain analytics for the next generation of traders.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link
              href="/dashboard"
              className="px-8 py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-100 transition-colors text-center"
            >
              Launch Terminal
            </Link>
            <Link
              href="/markets"
              className="px-8 py-3 rounded-lg border border-zinc-700 text-white hover:border-zinc-500 transition-colors text-center"
            >
              Explore Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.section
          className="py-24 space-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Market Preview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {[
                { symbol: "BTC", price: "$104,821.42", change: "+3.21%" },
                { symbol: "ETH", price: "$3,921.42", change: "+5.82%" },
                { symbol: "SOL", price: "$182.41", change: "+8.21%" },
              ].map((asset) => (
                <div key={asset.symbol} className="bg-[#121212] border border-[#1f1f1f] rounded p-6 space-y-2">
                  <p className="text-sm font-mono text-zinc-500">{asset.symbol}</p>
                  <p className="text-2xl font-bold font-mono">{asset.price}</p>
                  <p className="text-sm text-emerald-400 font-mono">{asset.change}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center space-y-12">
            <h3 className="text-2xl font-bold">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: TrendingUp, title: "Market Intelligence", desc: "Track market movements, volume and liquidity." },
                { icon: Zap, title: "Smart Money", desc: "Explore wallet activity and on-chain flows." },
                { icon: Grid3x3, title: "Portfolio", desc: "Understand wallet performance and asset allocation." },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  className="space-y-3 p-6 rounded border border-[#1f1f1f] bg-[#0c0c0c] hover:bg-[#121212] hover:border-zinc-700 transition-all"
                  variants={itemVariants}
                >
                  <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-lg">{`0${i + 1}`}</h4>
                  <h5 className="font-semibold">{title}</h5>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          className="py-24 text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-3xl font-bold">Understand the chain.</h3>
            <p className="text-lg text-zinc-500">Not just the price.</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-4 rounded-lg bg-white text-black font-semibold hover:bg-zinc-100 transition-colors"
            >
              Launch NEXORA
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

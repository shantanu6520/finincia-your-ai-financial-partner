import { motion } from "framer-motion";
import {
  Brain,
  PieChart,
  TrendingDown,
  Target,
  Bell,
  Lock,
  Zap,
  Sparkles,
} from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="relative py-28 bg-deep-hero overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,225,240,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,225,240,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[radial-gradient(ellipse,hsl(220_40%_30%/0.25),transparent_70%)] blur-3xl" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-white/60 mb-6 rounded-full glass-card neon-border">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-platinum-glow">Everything You Need to</span>{" "}
            <span className="shimmer-text italic">Take Control</span>
          </h2>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">
            Not just another expense tracker. A complete financial operating
            system designed for Indian professionals.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-[180px]">
          {/* Hero feature - large */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="glass-card neon-border rounded-2xl p-7 md:col-span-2 md:row-span-2 relative overflow-hidden group"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,hsl(220_40%_70%/0.25),transparent_70%)] blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/25 to-white/5 border border-white/20 flex items-center justify-center mb-5">
                <Brain className="w-5 h-5 text-white/90" />
              </div>
              <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 mb-4">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px] font-medium tracking-widest uppercase text-emerald-300">
                  RAG Powered
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
                AI-Powered Insights
              </h3>
              <p className="text-white/65 leading-relaxed max-w-md">
                Personalized recommendations based on your spending patterns,
                income, and financial goals. Like having a CA in your pocket —
                always available, never judgmental.
              </p>
              <div className="mt-auto pt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Learning from your finances
              </div>
            </div>
          </motion.div>

          {[
            { icon: PieChart, title: "Smart Expense Tracking", desc: "Categorize transactions and visualize where your money goes." },
            { icon: TrendingDown, title: "Debt Destroyer", desc: "Strategic payoff plans that save you lakhs in interest." },
            { icon: Target, title: "Goal-Based Savings", desc: "Set goals — emergency fund, vacation, home — get a real plan." },
            { icon: Bell, title: "Smart Alerts", desc: "Unusual spending, upcoming bills, and chances to save." },
            { icon: Zap, title: "One-Click Actions", desc: "Adjust budgets and make decisions with guided actions." },
            { icon: Lock, title: "Bank-Grade Security", desc: "End-to-end encrypted. We never sell your data." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 * (i + 1) }}
              className="glass-card neon-border rounded-2xl p-5 relative overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <f.icon className="w-4 h-4 text-white/85" />
              </div>
              <h3 className="font-display text-base font-semibold text-white mb-1.5 leading-tight">
                {f.title}
              </h3>
              <p className="text-xs text-white/55 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

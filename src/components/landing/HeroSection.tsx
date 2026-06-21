import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import CrystallineOrb from "./CrystallineOrb";
import AIChatMockup from "./AIChatMockup";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-deep-hero overflow-hidden">
      {/* Grid + ambient glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,225,240,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(220,225,240,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsl(220_50%_30%/0.35),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsl(225_40%_25%/0.3),transparent_65%)] blur-3xl" />

      <div className="relative container mx-auto px-4 pt-28 pb-20">
        {/* Headline + Orb + Chat — Bento style */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card neon-border mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium tracking-widest uppercase text-white/70">
                RAG Powered · Personal CFO
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-7"
            >
              <span className="text-platinum-glow">Your AI-Powered</span>
              <br />
              <span className="shimmer-text italic">Wealth Advisor</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              FININCIA transforms your financial chaos into clarity with intelligent
              insights that help you save more, spend smarter, and build wealth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10"
            >
              <Link to="/auth">
                <Button
                  size="xl"
                  className="group bg-gradient-to-r from-white to-white/85 text-neutral-900 hover:from-white hover:to-white px-8 shadow-[0_0_40px_hsl(220_30%_70%/0.35)] hover:shadow-[0_0_60px_hsl(220_40%_75%/0.5)] transition-all"
                >
                  Subscribe Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/25 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm px-8 transition-all"
                >
                  See How It Works
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 text-white/50"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">10,000+ Users</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Orb + floating chat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lg:col-span-5 relative h-[480px] flex items-center justify-center"
          >
            <CrystallineOrb />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -bottom-4 -left-6 md:left-0 z-10 w-[300px] hidden md:block"
            >
              <AIChatMockup />
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile chat mockup */}
        <div className="md:hidden mt-12 flex justify-center">
          <AIChatMockup />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

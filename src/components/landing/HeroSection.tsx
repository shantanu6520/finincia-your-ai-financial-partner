import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import screenshotDashboard from "@/assets/screenshots/dashboard.png";
import screenshotAnalytics from "@/assets/screenshots/analytics.png";
import screenshotReports from "@/assets/screenshots/reports.png";
import screenshotAICoach from "@/assets/screenshots/ai-coach.png";
import screenshotLoan from "@/assets/screenshots/loan-strategist.png";
import screenshotBills from "@/assets/screenshots/bill-optimizer.png";

const screenshots = [
  { src: screenshotDashboard, label: "Dashboard" },
  { src: screenshotAnalytics, label: "Predictive Analytics" },
  { src: screenshotReports, label: "Financial Reports" },
  { src: screenshotAICoach, label: "AI Coach" },
  { src: screenshotLoan, label: "Loan Strategist" },
  { src: screenshotBills, label: "Bill Optimizer" },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % screenshots.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-hero overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary-foreground/20 mb-10"
          >
            <span className="text-sm font-medium tracking-wide text-primary-foreground/80">AI-Powered Financial Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-8"
          >
            Your Personal{" "}
            <span className="italic">CFO,</span>
            <br />
            Powered by AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-primary-foreground/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Stop guessing. Start growing. FININCIA transforms your financial chaos into clarity with 
            intelligent insights that help you save more, spend smarter, and build wealth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link to="/auth">
              <Button 
                size="xl" 
                className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
              >
                Subscribe Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button 
                size="xl"
                variant="outline"
                className="border-primary-foreground text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary transition-all duration-300 px-8"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-10 text-primary-foreground/50"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm tracking-wide">Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm tracking-wide">AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm tracking-wide">10,000+ Users Growing</span>
            </div>
          </motion.div>
        </div>

        {/* Screenshot Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="relative group">
            {/* Layered glow effects */}
            <div className="absolute -inset-6 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-[2rem] blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="absolute -inset-1 bg-gradient-to-b from-white/20 via-transparent to-white/5 rounded-[1.25rem] opacity-50" />
            
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-secondary/90 to-secondary/70 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/15 ring-1 ring-foreground/10" />
                  <div className="w-3 h-3 rounded-full bg-foreground/15 ring-1 ring-foreground/10" />
                  <div className="w-3 h-3 rounded-full bg-foreground/15 ring-1 ring-foreground/10" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto bg-background/40 backdrop-blur-sm rounded-lg px-4 py-1.5 text-xs text-muted-foreground/70 border border-white/5 font-mono tracking-wide">
                    app.finincia.in/{screenshots[current].label.toLowerCase().replace(/\s+/g, '-')}
                  </div>
                </div>
              </div>
              
              {/* Screenshot - crossfade */}
              <div className="relative bg-background overflow-hidden">
                {screenshots.map((s, i) => (
                  <motion.img
                    key={i}
                    src={s.src}
                    alt={`FININCIA ${s.label}`}
                    animate={{ opacity: i === current ? 1 : 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className={`w-full h-auto block ${i === current ? 'relative' : 'absolute inset-0'}`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation pills */}
            <div className="flex justify-center gap-2 mt-8">
              {screenshots.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 border backdrop-blur-sm ${
                    i === current
                      ? 'bg-primary-foreground text-primary border-primary-foreground shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                      : 'bg-white/5 text-primary-foreground/40 border-white/10 hover:bg-white/10 hover:text-primary-foreground/70'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
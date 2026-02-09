import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import fininciaLogo from "@/assets/finincia-logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-hero overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Gradient orbs - subtle monochrome */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary-foreground/20 mb-10"
          >
            <span className="text-sm font-medium tracking-wide text-primary-foreground/80">AI-Powered Financial Intelligence</span>
          </motion.div>

          {/* Headline */}
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

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-primary-foreground/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Stop guessing. Start growing. FININCIA transforms your financial chaos into clarity with 
            intelligent insights that help you save more, spend smarter, and build wealth.
          </motion.p>

          {/* CTA Buttons */}
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

          {/* Trust indicators */}
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

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect - subtle */}
            <div className="absolute -inset-4 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-3xl blur-2xl" />
            
            {/* Dashboard mockup */}
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto bg-background/50 rounded-md px-4 py-1.5 text-xs text-muted-foreground">
                    app.finincia.in/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 md:p-8 bg-background">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <DashboardCard
                    title="Total Balance"
                    value="₹4,85,230"
                    change="+12.5%"
                    positive
                  />
                  <DashboardCard
                    title="Monthly Savings"
                    value="₹52,400"
                    change="+8.2%"
                    positive
                  />
                  <DashboardCard
                    title="Debt Cleared"
                    value="₹1,20,000"
                    change="3 months ahead"
                    positive
                  />
                </div>
                
                {/* Chart placeholder */}
                <div className="bg-secondary/50 rounded-xl p-4 h-48 flex items-end justify-between gap-2">
                  {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-foreground to-foreground/60 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const DashboardCard = ({ 
  title, 
  value, 
  change, 
  positive 
}: { 
  title: string; 
  value: string; 
  change: string; 
  positive?: boolean;
}) => (
  <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <p className="text-2xl font-bold font-display text-foreground">{value}</p>
    <p className={`text-sm mt-1 ${positive ? 'text-foreground/70' : 'text-foreground/50'}`}>
      {change}
    </p>
  </div>
);

export default HeroSection;
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Shield, Brain } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-hero overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Financial Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6"
          >
            Your Personal{" "}
            <span className="text-gradient-accent">CFO,</span>
            <br />
            Powered by AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed"
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
            <Button variant="hero" size="xl" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              See How It Works
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 text-primary-foreground/50"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent" />
              <span className="text-sm">AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm">10,000+ Users Growing</span>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-gold/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
            
            {/* Dashboard mockup */}
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto bg-background/50 rounded-md px-4 py-1.5 text-xs text-muted-foreground">
                    app.finincia.in/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 md:p-8">
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
                <div className="bg-secondary/30 rounded-xl p-4 h-48 flex items-end justify-between gap-2">
                  {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-accent to-accent/60 rounded-t-md"
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
  <div className="bg-background rounded-xl p-4 border border-border/50">
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <p className="text-2xl font-bold font-display text-foreground">{value}</p>
    <p className={`text-sm mt-1 ${positive ? 'text-success' : 'text-destructive'}`}>
      {change}
    </p>
  </div>
);

export default HeroSection;

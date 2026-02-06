import { motion } from "framer-motion";
import { Link2, Brain, TrendingUp, Repeat } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Add Your Finances",
    description: "Quickly add your wallets, income, and expenses manually. Your data stays private—no bank linking required.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analyzes",
    description: "Our AI studies your income, expenses, debts, and goals to understand your complete financial picture.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Get Your Plan",
    description: "Receive personalized recommendations: where to cut, how much to save, which debts to clear first.",
  },
  {
    number: "04",
    icon: Repeat,
    title: "Grow Consistently",
    description: "Watch your wealth grow as FININCIA continuously optimizes and adapts to your changing situation.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            From Financial Chaos to Clarity
          </h2>
          <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto">
            Get started in minutes. See results in days.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent/50 to-transparent" />
              )}
              
              <div className="relative bg-card/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300">
                {/* Step number */}
                <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-bold text-accent-foreground text-sm">
                  {step.number}
                </span>
                
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 mt-2">
                  <step.icon className="w-7 h-7 text-accent" />
                </div>
                
                <h3 className="font-display text-xl font-semibold text-primary-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-primary-foreground/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

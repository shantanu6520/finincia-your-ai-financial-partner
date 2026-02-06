import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const features = [
  "Unlimited AI-powered insights",
  "Connect all bank accounts",
  "Smart expense categorization",
  "Debt payoff optimizer",
  "Goal tracking & planning",
  "Investment recommendations",
  "Weekly financial reports",
  "Priority support",
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Invest in Your{" "}
            <span className="text-gradient-gold">Financial Future</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Less than what you spend on coffee each month. More valuable than any financial advisor.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-gold to-accent rounded-3xl blur-lg opacity-30" />
            
            <div className="relative bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
              {/* Header */}
              <div className="bg-hero p-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
                <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                  FININCIA Pro
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display font-bold text-primary-foreground">₹999</span>
                  <span className="text-primary-foreground/60">/month</span>
                </div>
                <p className="text-primary-foreground/60 mt-2">Billed monthly. Cancel anytime.</p>
              </div>
              
              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Button variant="hero" size="xl" className="w-full group">
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No credit card required. Full access for 14 days.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROI Calculator hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Average FININCIA user saves{" "}
            <span className="font-semibold text-accent">₹8,500/month</span>{" "}
            within 3 months of using the platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;

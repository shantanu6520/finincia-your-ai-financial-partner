import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const features = [
  "Unlimited AI-powered insights",
  "Manual wallet & expense tracking",
  "Smart expense categorization",
  "Debt payoff optimizer",
  "Goal tracking & planning",
  "Financial recommendations",
  "Weekly financial reports",
  "Priority support",
];

const PricingSection = () => {
  return (
    <section className="py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-sm font-medium tracking-wider uppercase text-muted-foreground mb-6">
            Simple Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Invest in Your{" "}
            <span className="italic">Financial Future</span>
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
            {/* Subtle shadow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-border via-transparent to-border rounded-2xl blur-lg opacity-50" />
            
            <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-primary p-10 text-center">
                <span className="inline-block px-3 py-1 rounded-full border border-primary-foreground/20 text-primary-foreground/80 text-xs font-medium tracking-wider uppercase mb-4">
                  Most Popular
                </span>
                <h3 className="font-display text-2xl font-bold text-primary-foreground mb-4">
                  FININCIA Pro
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display font-bold text-primary-foreground">₹999</span>
                  <span className="text-primary-foreground/60">/month</span>
                </div>
                <p className="text-primary-foreground/50 mt-2 text-sm">Billed monthly. Cancel anytime.</p>
              </div>
              
              {/* Features */}
              <div className="p-10">
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
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                        <Check className="w-3 h-3 text-foreground" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Button size="xl" className="w-full group bg-primary text-primary-foreground hover:bg-primary/90">
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
          className="text-center mt-16"
        >
          <p className="text-muted-foreground">
            Average FININCIA user saves{" "}
            <span className="font-semibold text-foreground">₹8,500/month</span>{" "}
            within 3 months of using the platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
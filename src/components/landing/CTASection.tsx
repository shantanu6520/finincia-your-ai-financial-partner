import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, CreditCard } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Take Control of Your{" "}
            <span className="text-gradient-accent">Financial Future?</span>
          </h2>
          <p className="text-xl text-primary-foreground/70 mb-10">
            Join thousands of Indian professionals who've transformed their finances with FININCIA. 
            Your personal CFO is waiting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="xl" className="group">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Schedule a Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-sm">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

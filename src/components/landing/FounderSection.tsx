import { motion } from "framer-motion";
import { Building2, Shield, Target } from "lucide-react";
import { Link } from "react-router-dom";

const FounderSection = () => {
  return (
    <section className="py-28 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-sm font-medium tracking-wider uppercase text-muted-foreground mb-6">
            Who We Are
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Built by <span className="italic">People Who Care</span> About Your Money
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card border border-border/60 rounded-2xl p-10 md:p-14"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Building2 className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Reveon Retail
              </h3>
              <p className="text-muted-foreground text-sm">
                The company behind FININCIA
              </p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed text-lg mb-10">
            FININCIA was born from a simple frustration — managing personal
            finances in India shouldn't require a CA or an expensive advisor.
            We built FININCIA to give every salaried professional, freelancer,
            and young family access to the same calibre of financial
            intelligence that was once reserved for the wealthy.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/5 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  Your Data, Your Control
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bank-grade encryption. No auto-scraping. GDPR & DPDP Act
                  compliant.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/5 rounded-lg flex-shrink-0">
                <Target className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  Built for India
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Multi-currency, regional financial year logic, and
                  India-first pricing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/5 rounded-lg flex-shrink-0">
                <Building2 className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  Transparent & Honest
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No hidden fees, no data selling, no financial product
                  commissions.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Questions? Reach us at{" "}
              <a
                href="mailto:business@reveonretail.store"
                className="text-foreground font-medium hover:underline"
              >
                business@reveonretail.store
              </a>
            </p>
            <Link
              to="/about"
              className="text-sm font-medium text-foreground hover:underline"
            >
              Learn more about us →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderSection;

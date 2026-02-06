import { motion } from "framer-motion";
import { X, AlertTriangle, Clock, HelpCircle } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Money disappears every month",
    description: "You earn well but wonder where it all goes. Subscriptions, impulse buys, and hidden leaks drain your wealth.",
  },
  {
    icon: Clock,
    title: "No time for financial planning",
    description: "Between work and life, who has hours to track expenses, analyze patterns, and optimize investments?",
  },
  {
    icon: HelpCircle,
    title: "Confused by conflicting advice",
    description: "Should you invest in stocks? Mutual funds? Clear debt first? Generic advice doesn't fit your situation.",
  },
  {
    icon: X,
    title: "Spreadsheets don't work",
    description: "You've tried budgeting apps and Excel sheets. They need constant updates and don't give actionable insights.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            The Problem
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Managing Money Shouldn't Be This Hard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            If you're earning ₹40,000 to ₹3,00,000 per month but still feel financially stuck, you're not alone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-destructive/30 transition-all duration-300 shadow-card hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 text-lg text-muted-foreground"
        >
          Sound familiar? <span className="text-accent font-semibold">There's a better way.</span>
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSection;

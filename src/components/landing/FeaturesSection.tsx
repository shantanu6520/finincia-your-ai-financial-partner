import { motion } from "framer-motion";
import { 
  Brain, 
  PieChart, 
  TrendingDown, 
  Target, 
  Bell, 
  Lock,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations based on your spending patterns, income, and financial goals. Like having a CA in your pocket.",
    highlight: true,
  },
  {
    icon: PieChart,
    title: "Smart Expense Tracking",
    description: "Automatically categorize transactions and visualize where your money goes. No manual entry needed.",
  },
  {
    icon: TrendingDown,
    title: "Debt Destroyer",
    description: "Strategic debt payoff plans that save you lakhs in interest. See exactly when you'll be debt-free.",
  },
  {
    icon: Target,
    title: "Goal-Based Savings",
    description: "Set financial goals—emergency fund, vacation, home—and get a realistic plan to achieve them.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified about unusual spending, upcoming bills, and opportunities to save money.",
  },
  {
    icon: Zap,
    title: "One-Click Actions",
    description: "Move money, adjust budgets, and make financial decisions with guided one-click actions.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Your data is encrypted end-to-end. We never sell your information. Read-only access to accounts.",
  },
];

const FeaturesSection = () => {
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
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="italic">Take Control</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Not just another expense tracker. A complete financial operating system designed for Indian professionals.
          </p>
        </motion.div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`group relative rounded-lg p-6 transition-all duration-300 snap-start shrink-0 w-[280px] md:w-auto ${
                feature.highlight 
                  ? 'bg-primary text-primary-foreground md:col-span-2' 
                  : 'bg-card border border-border hover:border-foreground/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                feature.highlight 
                  ? 'bg-primary-foreground/10' 
                  : 'bg-secondary group-hover:bg-foreground/5'
              }`}>
                <feature.icon className={`w-5 h-5 ${feature.highlight ? 'text-primary-foreground' : 'text-foreground/70'}`} />
              </div>
              <h3 className={`font-display font-semibold mb-2 ${feature.highlight ? 'text-xl text-primary-foreground' : 'text-lg text-foreground'}`}>
                {feature.title}
              </h3>
              <p className={`leading-relaxed ${feature.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground text-sm'}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
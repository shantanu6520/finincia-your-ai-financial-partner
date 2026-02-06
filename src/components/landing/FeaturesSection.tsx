import { motion } from "framer-motion";
import { 
  Brain, 
  PieChart, 
  TrendingDown, 
  Target, 
  Bell, 
  Lock,
  Zap,
  BarChart3
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
    icon: BarChart3,
    title: "Investment Guidance",
    description: "Understand what to invest based on your risk profile, goals, and current financial health.",
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient-accent">Take Control</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Not just another expense tracker. A complete financial operating system designed for Indian professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`group relative rounded-2xl p-6 transition-all duration-300 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-2 border-accent/20 shadow-glow md:col-span-2' 
                  : 'bg-card border border-border hover:border-accent/30 shadow-card hover:shadow-lg'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                feature.highlight 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary group-hover:bg-accent/10'
              }`}>
                <feature.icon className={`w-6 h-6 ${feature.highlight ? '' : 'text-accent'}`} />
              </div>
              <h3 className={`font-display font-semibold mb-2 ${feature.highlight ? 'text-xl' : 'text-lg'} text-foreground`}>
                {feature.title}
              </h3>
              <p className={`text-muted-foreground leading-relaxed ${feature.highlight ? 'text-base' : 'text-sm'}`}>
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

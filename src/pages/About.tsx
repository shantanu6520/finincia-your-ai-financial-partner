import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Target, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import fininciaLogo from "@/assets/finincia-logo.png";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img src={fininciaLogo} alt="FININCIA" className="h-8 w-auto" />
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              About FININCIA
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering individuals to take control of their financial future with AI-powered intelligence.
            </p>
          </div>

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border/50 rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Reveon Retail</h2>
                <p className="text-muted-foreground">The company behind FININCIA</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Reveon Retail is a forward-thinking technology company dedicated to building innovative 
              solutions that simplify and enhance everyday life. FININCIA is our flagship product in 
              the personal finance space, designed to bring professional-grade financial management 
              tools to individuals and families across India.
            </p>
          </motion.div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border/50 rounded-2xl p-8 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To democratize financial intelligence by providing every individual with a personal 
                CFO powered by AI, enabling smarter money decisions and long-term wealth creation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border/50 rounded-2xl p-8 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To become the most trusted financial companion for millions of Indian professionals, 
                helping them achieve financial freedom through intelligent insights and actionable guidance.
              </p>
            </motion.div>
          </div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border/50 rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold">Our Values</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Trust & Security</h4>
                <p className="text-sm text-muted-foreground">
                  Your financial data is protected with bank-grade encryption and strict privacy policies.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Clarity & Simplicity</h4>
                <p className="text-sm text-muted-foreground">
                  Complex financial concepts explained in simple, actionable language without jargon.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">User-First Design</h4>
                <p className="text-sm text-muted-foreground">
                  Every feature is built with the user's financial success as the primary goal.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-4"
          >
            <p className="text-muted-foreground">Ready to take control of your finances?</p>
            <Link to="/auth">
              <Button size="lg" className="px-8">
                Get Started with FININCIA
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;

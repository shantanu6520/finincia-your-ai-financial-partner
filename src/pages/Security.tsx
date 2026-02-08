import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  Key, 
  FileCheck, 
  UserCheck,
  Database,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import fininciaLogo from "@/assets/finincia-logo.png";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption in Transit",
    description: "All data transmitted between your device and our servers is protected using TLS 1.3 encryption, ensuring your financial information cannot be intercepted."
  },
  {
    icon: Database,
    title: "Encryption at Rest",
    description: "Your financial data is encrypted at rest using AES-256 encryption. Even if someone gained access to our storage, your data remains unreadable."
  },
  {
    icon: UserCheck,
    title: "Row-Level Security",
    description: "Every database query is filtered at the row level to ensure you can only access your own data. Complete multi-tenant isolation is enforced at the database level."
  },
  {
    icon: Key,
    title: "Secure Authentication",
    description: "Industry-standard authentication with secure password hashing, email verification, and optional OAuth integration. Your credentials are never stored in plain text."
  },
  {
    icon: Eye,
    title: "Privacy by Design",
    description: "We collect only the data necessary for the service. No selling of personal information, no unauthorized sharing with third parties."
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure with automatic backups, DDoS protection, and 24/7 monitoring for security threats."
  },
  {
    icon: FileCheck,
    title: "Regular Security Audits",
    description: "Our systems undergo regular security assessments to identify and address potential vulnerabilities before they can be exploited."
  },
  {
    icon: Shield,
    title: "Data Isolation",
    description: "Complete separation between user accounts. No user can ever access another user's financial data through any means."
  }
];

const complianceItems = [
  "GDPR Ready",
  "India DPDP Act Compliant",
  "HTTPS Everywhere",
  "No Plain-Text Storage",
  "Secure API Design",
  "Access Logging"
];

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={fininciaLogo} alt="FININCIA" className="h-8 w-auto" />
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/10 mb-8">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Financial Data is <span className="italic">Secure</span>
            </h1>
            <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              We take security seriously. Your financial information is protected by 
              industry-leading security measures at every layer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How We Protect Your Data
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Multiple layers of security ensure your financial information remains private and secure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compliance & Standards
            </h2>
            <p className="text-muted-foreground text-lg">
              We adhere to global security standards and regulations.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {complianceItems.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-3 bg-card rounded-full border border-border text-foreground font-medium"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
                Our Security Commitments
              </h2>
              
              <div className="space-y-6 text-muted-foreground">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">No Third-Party Data Sales</h3>
                  <p>We never sell your financial data to advertisers, data brokers, or any third parties. Your data is yours alone.</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Data Export & Deletion</h3>
                  <p>You have full control over your data. Export your financial history anytime or request complete deletion of your account and data.</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Transparent Practices</h3>
                  <p>We're committed to transparency. Our privacy policy clearly explains what data we collect, why, and how it's used.</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Incident Response</h3>
                  <p>In the unlikely event of a security incident, we commit to timely notification and transparent communication with affected users.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Questions About Security?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              We're happy to answer any questions about how we protect your financial data.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Get Started Securely
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 FININCIA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Security;

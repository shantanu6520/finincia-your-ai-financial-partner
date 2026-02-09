import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">Last updated: February 2026</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reveon Retail ("we," "our," or "us") operates FININCIA, an AI-powered personal finance management platform. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Personal Information</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Name and email address</li>
                    <li>Account credentials</li>
                    <li>Profile information (region, currency preferences)</li>
                    <li>Payment information (processed securely via Razorpay)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Financial Data</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Transaction records you manually enter</li>
                    <li>Budget and goal information</li>
                    <li>Wallet balances and categories</li>
                    <li>Loan and bill details</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>To provide and maintain our service</li>
                <li>To personalize your experience and AI recommendations</li>
                <li>To process your subscription payments</li>
                <li>To send you service-related communications</li>
                <li>To improve our platform and develop new features</li>
                <li>To ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures including encryption at rest and in transit, 
                row-level security policies, and secure authentication protocols. Your financial data is isolated 
                and accessible only to you through your authenticated account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share data only with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Payment processors (Razorpay) for subscription management</li>
                <li>Service providers who assist in operating our platform</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Under applicable data protection laws (including GDPR and India's DPDP Act), you have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies and local storage to maintain your session and preferences. 
                We do not use third-party tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related inquiries or to exercise your data rights, contact us at:
              </p>
              <p className="text-primary font-medium mt-2">business@reveonretail.store</p>
            </section>

            <section className="border-t border-border pt-8">
              <p className="text-sm text-muted-foreground">
                © 2024 FININCIA by Reveon Retail. All rights reserved.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

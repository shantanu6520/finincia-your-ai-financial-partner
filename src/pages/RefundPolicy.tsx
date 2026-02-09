import { motion } from "framer-motion";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RefundPolicy = () => {
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
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Refund Policy
              </h1>
              <p className="text-muted-foreground">Last updated: February 2026</p>
            </div>
          </div>

          <Alert className="mb-8 border-primary/20 bg-primary/5">
            <CreditCard className="h-4 w-4" />
            <AlertDescription className="text-foreground font-medium">
              Important: All subscription purchases are final and non-refundable. Please review this policy carefully before subscribing.
            </AlertDescription>
          </Alert>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. No Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                FININCIA, operated by Reveon Retail, maintains a strict no-refund policy. Once a subscription 
                is purchased, whether Monthly (₹999) or Annual (₹7,999), the payment is final and non-refundable 
                under any circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Subscription Terms</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>All subscription fees are charged in advance at the beginning of each billing period</li>
                <li>Monthly subscriptions are billed every 30 days</li>
                <li>Annual subscriptions are billed once per year</li>
                <li>No partial refunds will be issued for unused portions of a subscription period</li>
                <li>No refunds will be issued for subscription downgrades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cancellation Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time through your account settings. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Your subscription will remain active until the end of the current billing period</li>
                <li>You will continue to have access to all Pro features until the subscription expires</li>
                <li>No refund will be issued for the remaining days in your billing period</li>
                <li>Automatic renewal will be disabled</li>
                <li>Your data will be retained and accessible if you choose to resubscribe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Before You Subscribe</h2>
              <p className="text-muted-foreground leading-relaxed">
                We encourage you to carefully consider your purchase before subscribing. Please:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Review all features and pricing on our website</li>
                <li>Understand the terms of the subscription plan you are choosing</li>
                <li>Ensure you have the financial means to maintain the subscription</li>
                <li>Contact our support team if you have any questions before purchasing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Exceptions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Refunds may only be considered in the following exceptional circumstances, at our sole discretion:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Duplicate charges due to technical errors (verified by our payment processor)</li>
                <li>Unauthorized transactions (with valid proof of fraud)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                All exception requests must be submitted within 48 hours of the transaction and will be reviewed 
                on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Payment Disputes</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you believe there has been an error with your payment, please contact us at 
                <span className="text-primary font-medium"> business@reveonretail.store </span> 
                before initiating a chargeback with your bank. We will work with you to resolve any 
                legitimate payment issues.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that initiating a chargeback without first contacting us may result in 
                immediate termination of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Service Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, update, or discontinue features of the service. Such changes 
                do not constitute grounds for a refund as long as the core functionality of the platform 
                remains available.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Refund Policy or need to report a payment issue, 
                please contact us at:
              </p>
              <p className="text-primary font-medium mt-2">business@reveonretail.store</p>
              <p className="text-muted-foreground mt-2">
                We aim to respond to all inquiries within 2-3 business days.
              </p>
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

export default RefundPolicy;

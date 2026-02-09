import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Product Manager, Bengaluru",
    income: "₹18 LPA",
    quote:
      "FININCIA helped me identify ₹12,000 in unnecessary subscriptions I was paying every month. Within 3 months, I built an emergency fund I'd been putting off for years.",
    savings: "₹36,000 saved in 3 months",
    stars: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Startup Founder, Mumbai",
    income: "Variable income",
    quote:
      "As a founder with irregular income, budgeting felt impossible. FININCIA's AI coach gave me a realistic plan — I paid off my education loan 8 months early.",
    savings: "₹1.2L interest saved",
    stars: 5,
  },
  {
    name: "Ananya Iyer",
    role: "Software Engineer, Hyderabad",
    income: "₹24 LPA",
    quote:
      "The quarterly financial reviews feel like sitting with a CA. Clear, no-jargon, and actionable. My financial health score went from 42 to 78 in six months.",
    savings: "Health score: 42 → 78",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-sm font-medium tracking-wider uppercase text-muted-foreground mb-6">
            Real Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by <span className="italic">Professionals</span> Across India
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how FININCIA is helping real people take control of their
            finances.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative bg-card border border-border/60 rounded-2xl p-8 flex flex-col"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-muted-foreground/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 fill-foreground text-foreground"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-foreground/80 leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </p>

              {/* Result badge */}
              <div className="inline-flex self-start px-3 py-1.5 rounded-full bg-primary/5 border border-border text-xs font-medium text-foreground mb-6">
                {t.savings}
              </div>

              {/* Author */}
              <div className="border-t border-border/50 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-foreground">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

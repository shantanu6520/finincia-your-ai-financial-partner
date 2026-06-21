import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Send } from "lucide-react";

const script = [
  { role: "user", text: "Where did most of my money go last month?" },
  {
    role: "ai",
    text: "Dining & subscriptions ate 38% of your spend. I can trim ₹4,200/mo without touching essentials — want the plan?",
  },
  { role: "user", text: "Yes, show me." },
  {
    role: "ai",
    text: "Cancel 2 unused OTTs (₹698), renegotiate broadband (₹450), cap weekend dining at ₹3,000. Net save: ₹4,248.",
  },
];

const AIChatMockup = () => {
  const [visible, setVisible] = useState(0);
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const current = script[visible];
    if (!current) return;
    setTyped("");
    setTypingDone(false);
    if (current.role === "user") {
      // user messages appear instantly
      const t = setTimeout(() => {
        setTyped(current.text);
        setTypingDone(true);
      }, 250);
      return () => clearTimeout(t);
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(current.text.slice(0, i));
      if (i >= current.text.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!typingDone) return;
    const delay = visible >= script.length - 1 ? 3200 : 900;
    const t = setTimeout(() => {
      setVisible((v) => (v + 1) % script.length);
    }, delay);
    return () => clearTimeout(t);
  }, [typingDone, visible]);

  const shown = script.slice(0, visible);
  const active = script[visible];

  return (
    <div className="glass-card neon-border rounded-2xl p-5 w-full max-w-md">
      <div className="flex items-center gap-2 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/30 to-white/5 border border-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white/90" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white/90">FININCIA AI Coach</div>
          <div className="text-[10px] uppercase tracking-widest text-emerald-300/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            RAG Powered · Online
          </div>
        </div>
      </div>

      <div className="py-4 space-y-3 min-h-[260px]">
        {shown.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-white/90 text-neutral-900 rounded-br-sm"
                  : "bg-white/5 border border-white/10 text-white/85 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${active.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                active.role === "user"
                  ? "bg-white/90 text-neutral-900 rounded-br-sm"
                  : "bg-white/5 border border-white/10 text-white/85 rounded-bl-sm"
              }`}
            >
              {typed}
              {!typingDone && <span className="caret-blink ml-0.5">▍</span>}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
        <div className="flex-1 text-xs text-white/40 select-none">Ask anything about your money…</div>
        <button
          aria-hidden
          tabIndex={-1}
          className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/90 to-white/60 flex items-center justify-center text-neutral-900"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AIChatMockup;

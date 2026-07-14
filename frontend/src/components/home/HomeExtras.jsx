import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';

/* ─────────────────────────────────────────────
   1. OFFER BANNER (trust strip)
───────────────────────────────────────────── */
const OFFERS = [
  { icon: '🚚', text: 'Free Shipping on orders above ₹2,000' },
  { icon: '↩️', text: '5-Day Easy Returns' },
  { icon: '🔒', text: '100% Secure Payments' },
  { icon: '🪡', text: 'Authentic Handcrafted Quality' },
  { icon: '📦', text: 'Same-Day Dispatch before 12 PM' },
];

export const OfferBanner = () => (
  <div className="bg-primary overflow-hidden py-3">
    <div className="flex gap-12 animate-[ticker_30s_linear_infinite] whitespace-nowrap w-max">
      {[...OFFERS, ...OFFERS].map((o, i) => (
        <div key={i} className="flex items-center gap-2 text-white font-semibold text-sm shrink-0">
          <span>{o.icon}</span> {o.text}
          <span className="text-white/40 ml-6">•</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   2. NEWSLETTER
───────────────────────────────────────────── */
export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/20 via-bg-card to-secondary/10 border-y border-border-color relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail size={26} className="text-primary" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black font-serif text-text-main mb-4">
          Join the Ladli Family
        </h2>
        <p className="text-text-muted mb-8">
          Get early access to new collections, exclusive offers, and festive deals straight to your inbox.
        </p>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 text-green-400 bg-green-900/20 border border-green-700/40 rounded-2xl px-6 py-4 font-bold"
          >
            <CheckCircle size={20} />
            You're subscribed! Welcome to Ladli ✨
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-4 bg-bg-main border border-border-color rounded-2xl text-text-main placeholder:text-text-muted/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
            />
            <button
              type="submit"
              className="bg-primary text-white px-7 py-4 rounded-2xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 whitespace-nowrap active:scale-95"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-text-muted mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
};

export default { OfferBanner, Newsletter };
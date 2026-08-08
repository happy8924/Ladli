import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';

/* ─────────────────────────────────────────────
   1. OFFER BANNER (trust strip)
───────────────────────────────────────────── */
const OFFERS = [
  { icon: '🚚', text: 'Free Shipping on orders above ₹2,000' },
  { icon: '↩️', text: '5-Day Easy Returns Policy' },
  { icon: '🔒', text: '100% Secure Checkout' },
  { icon: '🪡', text: 'Authentic Handcrafted Quality' },
  { icon: '📦', text: 'Express Dispatch Available' },
];

export const OfferBanner = () => (
  <div className="bg-[#800000] border-y border-[#C9A227]/40 overflow-hidden py-3 text-white">
    <div className="flex gap-12 animate-[ticker_30s_linear_infinite] whitespace-nowrap w-max">
      {[...OFFERS, ...OFFERS].map((o, i) => (
        <div key={i} className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider shrink-0 text-white">
          <span className="text-base">{o.icon}</span> {o.text}
          <span className="text-[#C9A227] ml-8 font-black">•</span>
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
    <section className="py-20 bg-amber-50/50 border-t border-[#EADBC8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-[#800000] text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-[#C9A227]">
          <Mail size={28} />
        </div>
        <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900 mb-3">
          Join The Ladli Family
        </h2>
        <p className="text-gray-600 mb-8 font-medium text-sm md:text-base">
          Get early access to new Chaniya Choli collections, festive secret sales, and VIP discounts.
        </p>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-2xl px-6 py-4 font-bold shadow-md"
          >
            <CheckCircle size={22} className="text-emerald-700" />
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
              className="flex-1 px-5 py-4 bg-white border border-[#EADBC8] rounded-2xl text-gray-900 placeholder:text-gray-400 text-sm focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/30 outline-none shadow-sm"
            />
            <button
              type="submit"
              className="bg-[#800000] text-white border border-[#C9A227] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-[#5C0000] transition-all shadow-lg whitespace-nowrap active:scale-95"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  );
};

export default { OfferBanner, Newsletter };
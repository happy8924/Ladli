import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

/* ── Countdown to next midnight (resets daily; swap for a fixed end-date if needed) ── */
const getTimeLeft = () => {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end - now);
  return {
    hours: Math.floor(diff / 3.6e6),
    minutes: Math.floor((diff % 3.6e6) / 6e4),
    seconds: Math.floor((diff % 6e4) / 1000),
  };
};

const TimeBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white text-primary font-black text-lg md:text-xl rounded-lg w-12 md:w-14 h-12 md:h-14 flex items-center justify-center shadow-md">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-1">{label}</span>
  </div>
);

const FlashSale = ({ products = [], loading }) => {
  const [time, setTime] = useState(getTimeLeft());
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-primary/80 to-slate-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10">

        {/* Header with countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black font-serif text-white">Flash Sale</h2>
              <p className="text-white/80 text-sm">Up to 40% off — today only</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TimeBox value={time.hours} label="Hrs" />
            <span className="text-white font-black text-xl pb-4">:</span>
            <TimeBox value={time.minutes} label="Min" />
            <span className="text-white font-black text-xl pb-4">:</span>
            <TimeBox value={time.seconds} label="Sec" />
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-2xl aspect-[3/4.6] skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((p, i) => {
              const discount = Math.round((1 - 1 / 1.4) * 100);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl group relative"
                >
                  <Link to={`/product/${p.id}`} className="block relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-md">
                      -{discount}%
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(p); }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isInWishlist(p.id) ? 'bg-secondary text-white' : 'bg-white/90 text-text-muted hover:text-secondary'
                      }`}
                    >
                      <Heart size={13} className={isInWishlist(p.id) ? 'fill-current' : ''} />
                    </button>
                  </Link>
                  <div className="p-3">
                    <p className="text-xs font-bold text-text-main truncate font-serif">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-black text-primary">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-text-muted line-through">₹{(p.price * 1.4).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${30 + (p.id * 13) % 60}%` }} />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">Selling fast</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-black hover:bg-cream transition-colors shadow-xl"
          >
            <ShoppingBag size={18} /> View All Deals
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
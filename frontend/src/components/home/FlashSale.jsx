import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

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
    <div className="bg-[#C9A227] text-[#5C0000] font-black text-xl md:text-2xl rounded-xl w-12 md:w-14 h-12 md:h-14 flex items-center justify-center shadow-lg border border-amber-200">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-[10px] text-amber-200 font-extrabold uppercase tracking-widest mt-1">{label}</span>
  </div>
);

const FlashSale = ({ products = [], loading }) => {
  const [time, setTime] = useState(getTimeLeft());
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-[#5C0000] via-[#800000] to-[#4A0000] relative overflow-hidden text-white border-y border-[#C9A227]/40">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header with countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#C9A227] rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
              <Zap size={28} className="text-[#5C0000] fill-[#5C0000]" />
            </div>
            <div>
              <div className="inline-block bg-[#C9A227]/20 border border-[#C9A227]/40 px-3 py-0.5 rounded-full text-xs font-bold text-amber-200 uppercase tracking-widest mb-1">
                Limited Time Offer
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-serif text-white">Festive Flash Sale</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TimeBox value={time.hours} label="Hours" />
            <span className="text-[#C9A227] font-black text-2xl pb-4">:</span>
            <TimeBox value={time.minutes} label="Mins" />
            <span className="text-[#C9A227] font-black text-2xl pb-4">:</span>
            <TimeBox value={time.seconds} label="Secs" />
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-2xl aspect-[3/4.6] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {products.slice(0, 5).map((p, i) => {
              const discount = Math.round((1 - 1 / 1.35) * 100);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl group relative border border-[#EADBC8] hover:border-[#C9A227] transition-all"
                >
                  <Link to={`/product/${p.id}`} className="block relative aspect-[3/4] overflow-hidden bg-amber-50">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2.5 left-2.5 bg-[#800000] text-white text-[10px] font-black px-2.5 py-1 rounded-md border border-[#C9A227]">
                      -{discount}% OFF
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(p); }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                        isInWishlist(p.id) ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white/90 text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Heart size={14} className={isInWishlist(p.id) ? 'fill-current' : ''} />
                    </button>
                  </Link>

                  <div className="p-3.5 text-gray-900 bg-white">
                    <p className="text-xs font-bold text-gray-900 truncate font-serif mb-1">{p.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-[#800000]">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400 line-through">₹{(p.price * 1.35).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#800000] to-[#C9A227] rounded-full" style={{ width: `${40 + (p.id * 13) % 50}%` }} />
                    </div>
                    <p className="text-[10px] font-semibold text-gray-500 mt-1">Almost Sold Out</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-[#C9A227] text-[#5C0000] px-8 py-3.5 rounded-full font-black text-sm hover:bg-amber-300 transition-colors shadow-xl border border-white/50"
          >
            <ShoppingBag size={18} /> View All Flash Deals
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
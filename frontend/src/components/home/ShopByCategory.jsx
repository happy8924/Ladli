import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    label: 'Bridal',
    emoji: '👰',
    to: '/catalog?category=bridal',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    color: 'from-rose-600/80 to-pink-800/80',
    count: '48 styles',
  },
  {
    label: 'Navratri',
    emoji: '🪔',
    to: '/catalog?category=navratri',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=800&auto=format&fit=crop',
    color: 'from-orange-500/80 to-red-700/80',
    count: '60 styles',
  },
  {
    label: 'New Arrivals',
    emoji: '✨',
    to: '/catalog?category=new',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07facd68?q=80&w=800&auto=format&fit=crop',
    color: 'from-emerald-600/80 to-teal-800/80',
    count: '24 styles',
  },
];

const ShopByCategory = () => (
  <section className="py-20 bg-bg-main">
    <div className="container">

      {/* Heading */}
      <div className="text-center mb-12">
        <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3">Browse by Style</p>
        <h2 className="text-4xl md:text-5xl font-black font-serif text-text-main">Shop by Category</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={cat.to}
              className="group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
              {/* BG image */}
              <img
                src={cat.image}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-70 transition-opacity`} />

              {/* Glassmorphism card at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-inner">
                  <p className="text-2xl mb-1">{cat.emoji}</p>
                  <h3 className="text-white font-black font-serif text-xl leading-tight">{cat.label}</h3>
                  <p className="text-white/70 text-xs font-medium mt-0.5">{cat.count}</p>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default ShopByCategory;
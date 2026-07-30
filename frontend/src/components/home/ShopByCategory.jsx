import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    label: 'Bridal Edit',
    emoji: '👰',
    to: '/catalog?category=bridal',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    color: 'from-rose-900/90 via-rose-950/80 to-amber-950/70',
    count: '48 handcrafted styles',
  },
  {
    label: 'Navratri Special',
    emoji: '🪔',
    to: '/catalog?category=navratri',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=800&auto=format&fit=crop',
    color: 'from-amber-900/90 via-red-950/80 to-rose-950/70',
    count: '60 mirror-work sets',
  },
  {
    label: 'New Arrivals',
    emoji: '👑',
    to: '/catalog?category=new',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07facd68?q=80&w=800&auto=format&fit=crop',
    color: 'from-emerald-950/90 via-teal-950/80 to-amber-950/70',
    count: '24 fresh creations',
  },
];

const ShopByCategory = () => (
  <section className="py-20 bg-bg-main">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Heading */}
      <div className="text-center mb-14">
        <p className="text-secondary font-bold tracking-[0.25em] uppercase text-xs mb-2">Heritage Collections</p>
        <h2 className="text-4xl md:text-5xl font-black font-serif text-text-main">Shop By Category</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-primary via-secondary to-primary mx-auto mt-4 rounded-full" />
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link
              to={cat.to}
              className="group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-xl hover:shadow-2xl transition-all duration-500 border border-border-color"
            >
              {/* BG image */}
              <img
                src={cat.image}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-85 group-hover:opacity-75 transition-opacity duration-500`} />

              {/* Card content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="self-end">
                  <span className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-xl shadow-lg">
                    {cat.emoji}
                  </span>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/15 p-4 shadow-xl group-hover:bg-black/50 transition-colors">
                  <h3 className="text-white font-black font-serif text-xl leading-tight mb-1">{cat.label}</h3>
                  <p className="text-amber-200/90 text-xs font-medium">{cat.count}</p>
                </div>
              </div>

              {/* Hover arrow button */}
              <div className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
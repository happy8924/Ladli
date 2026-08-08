import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    label: 'Bridal Edit',
    emoji: '👰',
    to: '/catalog?category=bridal',
    image: '/images/bridal.png',
    fallback: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    color: 'from-[#5C0000]/90 via-[#800000]/75 to-transparent',
    count: '48 Handcrafted Styles',
  },
  {
    label: 'Navratri Special',
    emoji: '🪔',
    to: '/catalog?category=navratri',
    image: '/images/navratri.png',
    fallback: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=800&auto=format&fit=crop',
    color: 'from-[#5C0000]/90 via-[#800000]/75 to-transparent',
    count: '60 Mirror-Work Sets',
  },
  {
    label: 'New Arrivals',
    emoji: '👑',
    to: '/catalog?category=new',
    image: '/images/new_arrivals.png',
    fallback: 'https://images.unsplash.com/photo-1583391733958-d25e07facd68?q=80&w=800&auto=format&fit=crop',
    color: 'from-[#5C0000]/90 via-[#800000]/75 to-transparent',
    count: '24 Fresh Creations',
  },
];

const ShopByCategory = () => (
  <section className="py-20 bg-white border-b border-[#EADBC8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Heading */}
      <div className="text-center mb-14">
        <p className="text-[#C9A227] font-extrabold tracking-[0.25em] uppercase text-xs mb-2">Heritage Collections</p>
        <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900">Shop By Category</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#800000] via-[#C9A227] to-[#800000] mx-auto mt-4 rounded-full" />
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              className="group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#EADBC8] hover:border-[#C9A227]"
            >
              {/* BG image with onError fallback */}
              <img
                src={cat.image}
                onError={(e) => { e.target.src = cat.fallback; }}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-85 group-hover:opacity-95 transition-opacity duration-500`} />

              {/* Card content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="self-end">
                  <span className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl border border-[#C9A227] flex items-center justify-center text-xl shadow-md">
                    {cat.emoji}
                  </span>
                </div>

                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#EADBC8] p-5 shadow-xl group-hover:border-[#C9A227] transition-all">
                  <h3 className="text-gray-900 font-black font-serif text-2xl leading-tight mb-1">{cat.label}</h3>
                  <p className="text-[#800000] text-xs font-extrabold uppercase tracking-wider">{cat.count}</p>
                </div>
              </div>

              {/* Hover arrow button */}
              <div className="absolute top-4 left-4 w-10 h-10 bg-[#800000] text-white rounded-full border border-[#C9A227] flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-md">
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
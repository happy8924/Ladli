import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/* ── Slide data ── */
const SLIDES = [
  {
    id: 1,
    eyebrow: 'Festive Collection 2026',
    title: 'The Royal',
    titleAccent: 'Heritage Edit',
    desc: 'Discover handcrafted elegance inspired by authentic Gujarati Chaniya Cholis and royal craftsmanship.',
    image: '/images/new_arrivals.png',
    fallback: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=2000&auto=format&fit=crop',
    cta: { label: 'Shop Collection', to: '/catalog' },
  },
  {
    id: 2,
    eyebrow: 'Navratri Special',
    title: 'Dance In',
    titleAccent: 'Vibrant Colors',
    desc: 'Mirror-work and authentic bandhani Chaniya Cholis crafted for nine nights of grand celebration.',
    image: '/images/navratri.png',
    fallback: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000&auto=format&fit=crop',
    cta: { label: 'Shop Navratri', to: '/catalog?category=navratri' },
  },
  {
    id: 3,
    eyebrow: 'Bridal Edit',
    title: 'Say Yes To',
    titleAccent: 'Timeless Grace',
    desc: 'Heavy zari and zardozi bridal work meticulously designed for your unforgettable wedding day.',
    image: '/images/bridal.png',
    fallback: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
    cta: { label: 'Shop Bridal', to: '/catalog?category=bridal' },
  },
];

const AUTO_PLAY_MS = 5500;

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex(i => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex(i => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative h-[80vh] min-h-[560px] max-h-[750px] w-full bg-[#1A0A0A] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0"
        >
          {/* Base image */}
          <img
            src={slide.image}
            onError={(e) => { e.target.src = slide.fallback; }}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* High-contrast gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D0000]/95 via-[#4A0000]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Text Content */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-center items-start px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-white pt-8"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#FCE8B2] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-5 backdrop-blur-sm">
              <Sparkles size={14} className="text-[#C9A227]" />
              <span>{slide.eyebrow}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 leading-[1.1] font-serif text-white drop-shadow-md">
              {slide.title}<br />
              <span className="text-[#FCE8B2] font-black italic">
                {slide.titleAccent}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-xl font-normal leading-relaxed drop-shadow-sm">
              {slide.desc}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={slide.cta.to}
                className="bg-[#800000] text-white border-2 border-[#C9A227] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-[#5C0000] transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2"
              >
                <span>{slide.cta.label}</span>
                <span className="text-[#C9A227]">→</span>
              </Link>
              <Link
                to="/catalog"
                className="bg-white text-[#800000] border-2 border-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-amber-50 transition-all duration-300 shadow-md"
              >
                Explore All
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-[#800000] border border-white/40 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-[#800000] border border-white/40 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-10 bg-[#C9A227] shadow-md' : 'w-2.5 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;

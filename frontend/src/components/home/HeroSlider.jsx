import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Slide data — edit images/text here ── */
const SLIDES = [
  {
    id: 1,
    eyebrow: 'Festive Collection 2026',
    title: 'The Royal',
    titleAccent: 'Heritage Edit',
    desc: 'Discover handcrafted elegance inspired by authentic Gujarati traditions.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=2000&auto=format&fit=crop',
    cta: { label: 'Shop Collection', to: '/catalog' },
  },
  {
    id: 2,
    eyebrow: 'Navratri Special',
    title: 'Dance In',
    titleAccent: 'Vibrant Colors',
    desc: 'Mirror-work and bandhani Chaniya Cholis made for nine nights of celebration.',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000&auto=format&fit=crop',
    cta: { label: 'Shop Navratri', to: '/catalog?category=navratri' },
  },
  {
    id: 3,
    eyebrow: 'Bridal Edit',
    title: 'Say Yes To',
    titleAccent: 'Timeless Grace',
    desc: 'Heavy zari and zardozi work crafted for your most precious day.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
    cta: { label: 'Shop Bridal', to: '/catalog?category=bridal' },
  },
];

const AUTO_PLAY_MS = 5500;

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex(i => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex(i => (i - 1 + SLIDES.length) % SLIDES.length), []);

  /* ── Autoplay ── */
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative h-[85vh] min-h-[600px] w-full bg-slate-900 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-secondary/60 mix-blend-multiply z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <div className="relative z-20 container h-full flex flex-col justify-center items-start pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-white"
          >
            <p className="text-secondary font-bold tracking-[0.2em] uppercase text-sm mb-4 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-secondary inline-block" />
              {slide.eyebrow}
            </p>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] font-serif">
              {slide.title}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {slide.titleAccent}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg font-light">
              {slide.desc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={slide.cta.to}
                className="bg-white text-text-main px-8 py-4 rounded-full font-bold hover:bg-primary hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-xl"
              >
                {slide.cta.label}
              </Link>
              <Link
                to="/catalog"
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all duration-300"
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
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots + progress */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="relative h-1.5 rounded-full bg-white/30 overflow-hidden transition-all duration-300"
            style={{ width: i === index ? 32 : 8 }}
          >
            {i === index && !paused && (
              <motion.span
                key={`${slide.id}-progress`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: AUTO_PLAY_MS / 1000, ease: 'linear' }}
                className="absolute inset-y-0 left-0 bg-white rounded-full"
              />
            )}
            {i === index && paused && <span className="absolute inset-0 bg-white rounded-full" />}
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;

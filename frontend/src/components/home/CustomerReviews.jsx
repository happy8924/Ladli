import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Ahmedabad, Gujarat',
    avatar: 'P',
    rating: 5,
    title: 'Absolutely Stunning Quality!',
    text: 'I ordered the Royal Bridal Chaniya Choli and it arrived in just 3 days. The fabric quality is exceptional and the embroidery work is even more beautiful in person. Got so many compliments at my cousin\'s wedding!',
    product: 'Royal Bridal Chaniya Choli',
    color: 'bg-primary',
  },
  {
    id: 2,
    name: 'Meera Patel',
    location: 'Surat, Gujarat',
    avatar: 'M',
    rating: 5,
    title: 'Perfect Navratri Look!',
    text: 'Bought three sets for Navratri and all of them were perfect. The mirror work catches the light beautifully while dancing. The size was exactly as per the size chart. Will definitely order again!',
    product: 'Mirror Work Chaniya Choli Set',
    color: 'bg-secondary',
  },
  {
    id: 3,
    name: 'Anjali Desai',
    location: 'Vadodara, Gujarat',
    avatar: 'A',
    rating: 5,
    title: 'Best Online Boutique!',
    text: 'Ladli has become my go-to for all ethnic wear. The packaging is beautiful, delivery is fast, and the quality never disappoints. The return process was also very smooth when I needed a size exchange.',
    product: 'Silk Bandhani Chaniya Choli',
    color: 'bg-emerald-600',
  },
  {
    id: 4,
    name: 'Ritu Shah',
    location: 'Mumbai, Maharashtra',
    avatar: 'R',
    rating: 4,
    title: 'Loved the Fabric Quality',
    text: 'The georgette fabric drapes beautifully and the zari work is very intricate. I was hesitant to order online but the detailed photos helped a lot. Colour was exactly as shown. Highly recommend!',
    product: 'Georgette Zari Chaniya Choli',
    color: 'bg-orange-500',
  },
  {
    id: 5,
    name: 'Kavita Joshi',
    location: 'Jaipur, Rajasthan',
    avatar: 'K',
    rating: 5,
    title: 'Exceeded Expectations!',
    text: 'Ordered for my daughter\'s sangeet ceremony. The leheriya print Chaniya Choli was vibrant and the stitching quality was top-notch. She looked like a princess. Thank you Ladli!',
    product: 'Leheriya Print Chaniya Choli',
    color: 'bg-rose-600',
  },
];

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={14} className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
    ))}
  </div>
);

const CustomerReviews = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(c => (c - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setCurrent(c => (c + 1) % REVIEWS.length);

  /* Show 3 cards on desktop, center active */
  const getVisible = () => {
    const arr = [];
    for (let i = -1; i <= 1; i++) {
      arr.push(REVIEWS[(current + i + REVIEWS.length) % REVIEWS.length]);
    }
    return arr;
  };

  return (
    <section className="py-20 bg-bg-card border-y border-border-color overflow-hidden">
      <div className="container">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3">Happy Customers</p>
          <h2 className="text-4xl md:text-5xl font-black font-serif text-text-main mb-4">What They Say</h2>
          <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
            <StarRow rating={5} />
            <span className="font-bold text-text-main">4.9/5</span>
            <span>from 2,400+ reviews</span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">

          {/* Desktop: 3-card view */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {getVisible().map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: idx === 1 ? 1.03 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`bg-bg-main border rounded-3xl p-6 flex flex-col gap-4 ${
                    idx === 1 ? 'border-primary/40 shadow-xl shadow-primary/10' : 'border-border-color'
                  }`}
                >
                  <Quote size={28} className="text-primary/30" />
                  <StarRow rating={review.rating} />
                  <h3 className="font-bold text-text-main">{review.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-4">{review.text}</p>
                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border-color">
                    <div className={`w-10 h-10 rounded-full ${review.color} text-white flex items-center justify-center font-black shrink-0`}>
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-text-main text-sm">{review.name}</p>
                      <p className="text-[11px] text-text-muted">{review.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile: single card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={REVIEWS[current].id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="bg-bg-main border border-primary/40 rounded-3xl p-6 flex flex-col gap-4"
              >
                <Quote size={28} className="text-primary/30" />
                <StarRow rating={REVIEWS[current].rating} />
                <h3 className="font-bold text-text-main">{REVIEWS[current].title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{REVIEWS[current].text}</p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border-color">
                  <div className={`w-10 h-10 rounded-full ${REVIEWS[current].color} text-white flex items-center justify-center font-black shrink-0`}>
                    {REVIEWS[current].avatar}
                  </div>
                  <div>
                    <p className="font-bold text-text-main text-sm">{REVIEWS[current].name}</p>
                    <p className="text-[11px] text-text-muted">{REVIEWS[current].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-bg-main border border-border-color flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1.5">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-1.5 bg-border-color'}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-bg-main border border-border-color flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;

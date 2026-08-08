import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Verified Buyer',
    avatar: 'P',
    rating: 5,
    title: 'Absolutely Stunning Quality!',
    text: 'I ordered the Royal Bridal Chaniya Choli and it arrived in just 3 days. The fabric quality is exceptional and the embroidery work is even more beautiful in person. Got so many compliments!',
    product_name: 'Royal Bridal Chaniya Choli',
    color: 'bg-[#800000]',
  },
  {
    id: 2,
    name: 'Meera Patel',
    location: 'Verified Buyer',
    avatar: 'M',
    rating: 5,
    title: 'Perfect Navratri Look!',
    text: 'Bought three sets for Navratri and all of them were perfect. The mirror work catches the light beautifully while dancing. The size was exactly as per the size chart.',
    product_name: 'Mirror Work Chaniya Choli Set',
    color: 'bg-[#C9A227]',
  },
  {
    id: 3,
    name: 'Anjali Desai',
    location: 'Verified Buyer',
    avatar: 'A',
    rating: 5,
    title: 'Best Online Boutique!',
    text: 'Ladli has become my go-to for all ethnic wear. The packaging is beautiful, delivery is fast, and the quality never disappoints.',
    product_name: 'Silk Bandhani Chaniya Choli',
    color: 'bg-[#800000]',
  },
];

const StarRow = ({ rating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={15} className={s <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'} />
    ))}
  </div>
);

const CustomerReviews = () => {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/reviews/recent')
      .then(res => {
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map(r => ({
            id: r.id,
            name: r.username || 'Customer',
            location: 'Verified Buyer',
            avatar: (r.username || 'C')[0].toUpperCase(),
            rating: r.rating || 5,
            title: r.comment ? `"${r.comment.slice(0, 35)}..."` : 'Verified Purchase Review',
            text: r.comment || 'Wonderful product quality, fast delivery and great fitting! Highly recommended.',
            product_name: r.product_name || 'Traditional Ensemble',
            product_id: r.product_id,
            color: (r.id % 2 === 0) ? 'bg-[#800000]' : 'bg-[#C9A227]',
          }));
          setReviews(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const prev = () => setCurrent(c => (c - 1 + reviews.length) % reviews.length);
  const next = () => setCurrent(c => (c + 1) % reviews.length);

  const getVisible = () => {
    if (reviews.length <= 3) return reviews;
    const arr = [];
    for (let i = -1; i <= 1; i++) {
      arr.push(reviews[(current + i + reviews.length) % reviews.length]);
    }
    return arr;
  };

  const visibleList = getVisible();

  return (
    <section className="py-20 bg-white border-b border-[#EADBC8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-[#800000] font-extrabold tracking-[0.2em] uppercase text-xs mb-2">Happy Ladli Clients</p>
          <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900 mb-3">Loved By 2,400+ Women</h2>
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <StarRow rating={5} />
            <span className="font-bold text-gray-900">4.9/5 Rating</span>
            <span>from verified customer reviews</span>
          </div>
        </div>

        {/* Carousel / Grid */}
        <div className="relative">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {visibleList.map((review, idx) => (
                <motion.div
                  key={review.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: idx === 1 ? 1.02 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`bg-amber-50/50 border rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs ${
                    idx === 1 ? 'border-[#800000] shadow-xl bg-white' : 'border-[#EADBC8]'
                  }`}
                >
                  <div className="space-y-3">
                    <Quote size={28} className="text-[#800000]/30" />
                    <StarRow rating={review.rating} />
                    <h3 className="font-bold text-gray-900 text-base font-serif">{review.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-4">{review.text}</p>
                  </div>

                  <div className="pt-4 border-t border-[#EADBC8] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${review.color} text-white flex items-center justify-center font-black shrink-0 border border-[#C9A227] text-xs font-serif`}>
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{review.name}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{review.location}</p>
                      </div>
                    </div>

                    {review.product_id && (
                      <Link
                        to={`/product/${review.product_id}`}
                        className="text-[10px] font-extrabold text-[#800000] hover:underline truncate max-w-[120px]"
                        title={review.product_name}
                      >
                        {review.product_name}
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Nav arrows for Carousel if more than 3 */}
          {reviews.length > 3 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-[#EADBC8] bg-white text-gray-700 hover:bg-[#800000] hover:text-white transition-all flex items-center justify-center shadow-xs"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-[#EADBC8] bg-white text-gray-700 hover:bg-[#800000] hover:text-white transition-all flex items-center justify-center shadow-xs"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default CustomerReviews;

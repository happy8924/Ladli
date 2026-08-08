import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Sparkles } from 'lucide-react';
import ProductCard from '../ProductCard';

/* ── Skeleton Card ── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-[#EADBC8]">
    <div className="aspect-[3/4] bg-amber-50 animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-amber-100 rounded-full w-1/3 animate-pulse" />
      <div className="h-4 bg-amber-100 rounded-full w-3/4 animate-pulse" />
      <div className="h-4 bg-amber-100 rounded-full w-1/2 animate-pulse" />
    </div>
  </div>
);

/* ── Section with tabs: Trending / Best Sellers ── */
const TABS = [
  { key: 'trending',    label: 'Trending Now',  icon: <TrendingUp size={15} /> },
  { key: 'bestsellers', label: 'Best Sellers',   icon: <Award size={15} /> },
  { key: 'new',         label: 'New Collection', icon: <Sparkles size={15} /> },
];

const ProductSection = ({ products = [], loading }) => {
  const [activeTab, setActiveTab] = useState('trending');

  const displayed = products.slice(
    activeTab === 'trending'    ? 0 :
    activeTab === 'bestsellers' ? 4 : 8,
    activeTab === 'trending'    ? 8 :
    activeTab === 'bestsellers' ? 12 : 16,
  );

  return (
    <section className="py-20 bg-white border-b border-[#EADBC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[#800000] font-extrabold tracking-[0.2em] uppercase text-xs mb-2 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C9A227]" /> Ladli Signature Picks
            </p>
            <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900">Featured Chaniya Cholis</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 bg-amber-50 border border-[#EADBC8] rounded-2xl p-1.5 self-start md:self-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#800000] text-white shadow-md'
                    : 'text-gray-700 hover:text-[#800000] hover:bg-white/60'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {displayed.length > 0
                ? displayed.map((p) => <ProductCard key={p.id} product={p} />)
                : products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
              }
            </motion.div>
          )}
        </AnimatePresence>

        {/* View all button */}
        <div className="text-center mt-14">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-3 bg-[#800000] text-white border-2 border-[#C9A227] px-10 py-4 rounded-full font-black text-base hover:bg-[#5C0000] transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            <span>View Full Catalog</span>
            <span className="text-[#C9A227]">→</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ProductSection;

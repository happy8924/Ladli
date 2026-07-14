import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, TrendingUp, Award } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

/* ── Skeleton Card ── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-bg-card border border-border-color">
    <div className="aspect-[3/4] skeleton" />
    <div className="p-4 space-y-2">
      <div className="h-3 skeleton rounded-full w-1/3" />
      <div className="h-4 skeleton rounded-full w-3/4" />
      <div className="h-4 skeleton rounded-full w-1/2" />
    </div>
  </div>
);

/* ── Single Product Card ── */
const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [cartFlash, setCartFlash] = useState(false);
  const discount = Math.round((1 - 1 / 1.4) * 100);
  const rating = (4.2 + (product.id % 8) * 0.1).toFixed(1);
  const reviews = 50 + (product.id * 17) % 350;

  const handleCart = (e) => {
    e.preventDefault();
    addToCart(product);
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="group relative flex flex-col bg-bg-card rounded-2xl overflow-hidden border border-border-color hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(129,140,248,0.15)]"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2 py-0.5 bg-green-500/20 border border-green-400/40 backdrop-blur-sm text-[10px] font-bold text-green-300 rounded-md">
            -{discount}% OFF
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
            isInWishlist(product.id)
              ? 'bg-red-500/30 border border-red-400 text-red-400'
              : 'bg-black/30 border border-white/20 text-white/70 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400'
          }`}
        >
          <Heart size={15} className={isInWishlist(product.id) ? 'fill-current' : ''} />
        </button>

        {/* Add to cart — hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
          cartFlash ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0'
        }`}>
          <button
            onClick={handleCart}
            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg ${
              cartFlash
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
          >
            <ShoppingBag size={15} />
            {cartFlash ? 'Added!' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1">
        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
          {product.fabric || 'Designer Silk'}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold font-serif text-text-main hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} className={s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
            ))}
          </div>
          <span className="text-[10px] text-text-muted">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-black text-text-main font-serif">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-xs text-text-muted line-through">₹{(product.price * 1.4).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Section with tabs: Trending / Best Sellers ── */
const TABS = [
  { key: 'trending',    label: 'Trending Now',  icon: <TrendingUp size={15} /> },
  { key: 'bestsellers', label: 'Best Sellers',   icon: <Award size={15} /> },
  { key: 'new',         label: 'New Collection', icon: <span className="text-xs">✨</span> },
];

const ProductSection = ({ products = [], loading }) => {
  const [activeTab, setActiveTab] = useState('trending');

  /* Simple mock filter — in production filter by real tags */
  const displayed = products.slice(
    activeTab === 'trending'    ? 0 :
    activeTab === 'bestsellers' ? 4 : 8,
    activeTab === 'trending'    ? 8 :
    activeTab === 'bestsellers' ? 12 : 16,
  );

  return (
    <section className="py-20 bg-bg-main">
      <div className="container">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3">Ladli Picks</p>
            <h2 className="text-4xl md:text-5xl font-black font-serif text-text-main">Our Collection</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-bg-card border border-border-color rounded-2xl p-1.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-text-muted hover:text-text-main'
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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            >
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            >
              {displayed.length > 0
                ? displayed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                : products.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
              }
            </motion.div>
          )}
        </AnimatePresence>

        {/* View all */}
        <div className="text-center mt-12">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-full font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
          >
            View Full Collection →
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ProductSection;

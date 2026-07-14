import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Heart, ShoppingBag, Star, Sparkles, Grid2X2, LayoutList
} from 'lucide-react';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

/* ── Constants ── */
const CATEGORIES = [
  { value: '',         label: 'All Collections', emoji: '✨' },
  { value: 'bridal',   label: 'Bridal Edit',      emoji: '👰' },
  { value: 'navratri', label: 'Navratri Special',  emoji: '🪔' },
  { value: 'party',    label: 'Party Wear',        emoji: '🎉' },
  { value: 'new',      label: 'New Arrivals',       emoji: '🆕' },
];

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'rating',     label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'All Prices',       min: 0,     max: Infinity },
  { label: 'Under ₹1,500',     min: 0,     max: 1500 },
  { label: '₹1,500 – ₹3,000', min: 1500,  max: 3000 },
  { label: '₹3,000 – ₹6,000', min: 3000,  max: 6000 },
  { label: 'Above ₹6,000',     min: 6000,  max: Infinity },
];

/* ── Product Card ── */
const CatalogCard = ({ product, view }) => {
  const { addToCart }                   = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [hovered, setHovered]           = useState(false);
  const rating  = (Math.random() * 1.5 + 3.5).toFixed(1);
  const reviews = Math.floor(Math.random() * 400) + 20;
  const discount = Math.round((1 - 1 / 1.4) * 100);

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-5 bg-bg-card border border-border-color rounded-2xl overflow-hidden hover:border-primary/40 transition-all group"
      >
        <Link to={`/product/${product.id}`} className="w-36 shrink-0 overflow-hidden">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
        <div className="flex flex-col justify-center py-4 pr-4 flex-1 min-w-0">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Ladli Collection</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold font-serif text-text-main text-lg mb-1 hover:text-primary transition-colors truncate">{product.name}</h3>
          </Link>
          <p className="text-sm text-text-muted mb-2">{product.fabric || 'Designer Silk'} • Handcrafted</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />)}
            </div>
            <span className="text-xs text-text-muted">({reviews})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-text-main font-serif">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="text-sm text-text-muted line-through">₹{(product.price * 1.4).toLocaleString('en-IN')}</span>
            <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded-md">{discount}% OFF</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-4 border-l border-border-color shrink-0">
          <button
            onClick={() => toggleWishlist(product)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'bg-red-900/30 border-red-500 text-red-400' : 'border-border-color text-text-muted hover:border-red-400 hover:text-red-400'}`}
          >
            <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
          </button>
          <button
            onClick={() => addToCart(product)}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col bg-bg-card rounded-2xl overflow-hidden border border-border-color hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(129,140,248,0.15)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
        <Link to={`/product/${product.id}`} className="absolute inset-0">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.price > 5000 && (
            <span className="px-2.5 py-1 bg-yellow-400/20 border border-yellow-400/40 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-yellow-300 rounded-lg">
              Premium
            </span>
          )}
          <span className="px-2.5 py-1 bg-green-500/20 border border-green-400/30 backdrop-blur-sm text-[10px] font-bold text-green-300 rounded-lg">
            {discount}% OFF
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
            isInWishlist(product.id)
              ? 'bg-red-500/30 border border-red-400 text-red-400'
              : 'bg-black/30 border border-white/20 text-white/70 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400'
          }`}
        >
          <Heart size={15} className={isInWishlist(product.id) ? 'fill-current' : ''} />
        </button>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 group-hover:opacity-0 transition-opacity">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-white">{rating}</span>
          <span className="text-[10px] text-white/60">({reviews})</span>
        </div>

        {/* Add to Cart - hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-lg"
          >
            <ShoppingBag size={15} /> Add to Bag
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{product.fabric || 'Designer Silk'}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold font-serif text-text-main hover:text-primary transition-colors truncate mb-2">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-main font-serif">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="text-xs text-text-muted line-through">₹{(product.price * 1.4).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Catalog Page ── */
const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy]           = useState('featured');
  const [priceRange, setPriceRange]   = useState(0);   // index in PRICE_RANGES
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView]               = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Filter + Sort
  const displayed = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.fabric || '').toLowerCase().includes(q));
    }

    // Category
    if (category) {
      list = list.filter(p => (p.category?.name || '').toLowerCase().includes(category.toLowerCase()));
    }

    // Price
    const { min, max } = PRICE_RANGES[priceRange];
    list = list.filter(p => p.price >= min && p.price <= max);

    // Sort
    switch (sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest':     list.sort((a, b) => b.id - a.id); break;
      default: break;
    }

    return list;
  }, [products, search, category, priceRange, sortBy]);

  const activeFilters = [
    category && CATEGORIES.find(c => c.value === category)?.label,
    priceRange > 0 && PRICE_RANGES[priceRange].label,
    search && `"${search}"`,
  ].filter(Boolean);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPriceRange(0);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-bg-main pb-24">

      {/* ── Hero Banner ── */}
      <div className="relative h-52 md:h-64 overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=2000&auto=format&fit=crop"
          alt="Collections"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-primary font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
            <Sparkles size={14} /> Ladli Heritage
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white mb-2">Our Collections</h1>
          <p className="text-white/70 text-sm">Handcrafted Chaniya Choli for every occasion</p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 pt-8">

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all shrink-0 ${
                category === cat.value
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-bg-card border border-border-color text-text-muted hover:border-primary/40 hover:text-text-main'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or fabric…"
              className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-bg-card border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none cursor-pointer min-w-[180px]"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${
              showFilters ? 'bg-primary text-white border-primary' : 'bg-bg-card border-border-color text-text-muted hover:border-primary/40'
            }`}
          >
            <SlidersHorizontal size={16} /> Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-primary text-xs font-black flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex bg-bg-card border border-border-color rounded-xl overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-3 py-3 transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'}`}>
              <Grid2X2 size={16} />
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-3 transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'}`}>
              <LayoutList size={16} />
            </button>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-bg-card border border-border-color rounded-2xl p-5">
                <h3 className="font-bold text-text-main mb-4 text-sm uppercase tracking-wider">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPriceRange(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        priceRange === idx
                          ? 'bg-primary text-white border-primary'
                          : 'border-border-color text-text-muted hover:border-primary/40 hover:text-text-main'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active Filters ── */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-xs text-text-muted font-bold">Active:</span>
            {activeFilters.map(f => (
              <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-xs font-bold rounded-full">
                {f}
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 font-bold ml-1">Clear all</button>
          </div>
        )}

        {/* ── Results Count ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-text-muted">
            <span className="font-bold text-text-main">{displayed.length}</span> products found
          </p>
        </div>

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-bg-card border border-border-color">
                <div className="aspect-[3/4] skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-3 skeleton rounded-full w-1/2" />
                  <div className="h-4 skeleton rounded-full w-3/4" />
                  <div className="h-4 skeleton rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Products Grid / List ── */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold font-serif text-text-main mb-2">No products found</h3>
            <p className="text-text-muted mb-6">Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-hover transition-colors">
              Clear Filters
            </button>
          </div>
        )}

        {!loading && displayed.length > 0 && (
          <motion.div
            layout
            className={view === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'
              : 'flex flex-col gap-4'
            }
          >
            <AnimatePresence>
              {displayed.map(product => (
                <CatalogCard key={product.id} product={product} view={view} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Catalog;
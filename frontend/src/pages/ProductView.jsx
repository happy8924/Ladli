import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import SizeGuide from '../components/SizeGuide';
import {
  Award, Truck, RotateCcw, ChevronLeft, ChevronRight,
  Plus, Minus, ShoppingBag, CheckCircle, ShieldCheck,
  Star, Heart, ZoomIn, Ruler, Share2, Package,
  X, MessageSquare
} from 'lucide-react';

/* ══════════════════════════════════════════
   OFFLINE / LOCAL IMAGE BANK
   If product has no image, we cycle through
   these beautiful Chaniya Choli images
═══════════════════════════════════════════ */
const OFFLINE_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583391733958-d25e07facd68?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
];

/* Returns 4 gallery images for a product:
   first = product's own image (or fallback),
   rest  = related offline images */
const getGalleryImages = (product) => {
  const seed   = product?.id || 0;
  const main   = product?.image_url || OFFLINE_IMAGES[seed % OFFLINE_IMAGES.length];
  const extras = [0, 1, 2].map(i => OFFLINE_IMAGES[(seed + i + 1) % OFFLINE_IMAGES.length]);
  return [main, ...extras];
};

/* ══════════════════════════════════════════
   ZOOM HOOK — magnifier follows mouse
═══════════════════════════════════════════ */
const useImageZoom = () => {
  const [lens, setLens] = useState({ visible: false, x: 0, y: 0, bgX: 0, bgY: 0 });
  const ZOOM = 2.5;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width)  * 100;
    const pctY = (y / rect.height) * 100;
    setLens({ visible: true, x, y, bgX: pctX, bgY: pctY });
  };

  const handleMouseLeave = () => setLens(l => ({ ...l, visible: false }));

  return { lens, handleMouseMove, handleMouseLeave, ZOOM };
};

/* ══════════════════════════════════════════
   STAR DISPLAY
═══════════════════════════════════════════ */
const StarRow = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
    ))}
  </div>
);

/* ══════════════════════════════════════════
   SINGLE RELATED PRODUCT MINI-CARD
═══════════════════════════════════════════ */
const RelatedCard = ({ product }) => {
  const img = product.image_url || OFFLINE_IMAGES[product.id % OFFLINE_IMAGES.length];
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col bg-bg-card rounded-2xl overflow-hidden border border-border-color hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg duration-300"
    >
      <div className="aspect-[3/4] overflow-hidden bg-slate-800">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-3">
        <p className="text-xs text-primary font-bold mb-0.5">{product.fabric || 'Designer'}</p>
        <p className="text-sm font-bold text-text-main truncate font-serif">{product.name}</p>
        <p className="text-sm font-black text-text-main mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
      </div>
    </Link>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const ProductView = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart }                   = useCart();
  const { user }                        = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { lens, handleMouseMove, handleMouseLeave, ZOOM } = useImageZoom();

  /* ── State ── */
  const [product, setProduct]       = useState(null);
  const [relatedProducts, setRelated] = useState([]);
  const [selectedSize, setSize]     = useState('M');
  const [quantity, setQty]          = useState(1);
  const [loading, setLoading]       = useState(true);
  const [addedFeedback, setAdded]   = useState(false);
  const [showSizeGuide, setShowSG]  = useState(false);
  const [activeTab, setTab]         = useState('description'); // description | reviews

  /* Gallery */
  const [gallery, setGallery]       = useState([]);
  const [mainImg, setMainImg]       = useState('');
  const [lightbox, setLightbox]     = useState(false);

  /* Reviews */
  const [reviewsData, setReviewsData] = useState({ average_rating: 0, total_reviews: 0, reviews: [] });
  const [newReview, setNewReview]     = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [reviewError, setReviewError] = useState('');

  /* ── Fetch ── */
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetch = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes, allRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`).catch(() => ({ data: { average_rating: 0, total_reviews: 0, reviews: [] } })),
          api.get('/products/').catch(() => ({ data: [] })),
        ]);

        const prod = prodRes.data;
        setProduct(prod);

        const imgs = getGalleryImages(prod);
        setGallery(imgs);
        setMainImg(imgs[0]);

        if (prod.sizes) setSize(prod.sizes.split(',')[0].trim());
        setReviewsData(revRes.data);

        /* Related = same category, excluding current */
        const related = allRes.data
          .filter(p => p.id !== prod.id && p.category_id === prod.category_id)
          .slice(0, 6);
        /* If fewer than 4, pad with other products */
        if (related.length < 4) {
          const others = allRes.data.filter(p => p.id !== prod.id && !related.find(r => r.id === p.id)).slice(0, 4 - related.length);
          setRelated([...related, ...others]);
        } else {
          setRelated(related);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  /* ── Actions ── */
  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product, selectedSize, quantity);
    navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!newReview.comment.trim()) { setReviewError('Please write a review comment.'); return; }
    setSubmitting(true);
    setReviewError('');
    try {
      await api.post('/reviews/', { product_id: product.id, rating: newReview.rating, comment: newReview.comment });
      const res = await api.get(`/reviews/product/${id}`);
      setReviewsData(res.data);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-8 pb-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="w-20 h-24 skeleton rounded-xl" />)}
              </div>
              <div className="flex-1 aspect-[3/4] skeleton rounded-2xl" />
            </div>
            <div className="space-y-4 pt-4">
              {[...Array(8)].map((_, i) => <div key={i} className={`h-4 skeleton rounded-full ${i===0?'w-1/3':i===1?'w-3/4':'w-1/2'}`} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Package size={48} className="text-text-muted opacity-40" />
        <h2 className="text-2xl font-bold font-serif text-text-main">Product not found</h2>
        <Link to="/catalog" className="text-primary font-bold hover:underline">← Back to collections</Link>
      </div>
    );
  }

  const sizes      = product.sizes ? product.sizes.split(',').map(s => s.trim()) : ['XS','S','M','L','XL','2XL'];
  const discount   = Math.round((1 - 1 / 1.4) * 100);
  const wishlisted = isInWishlist(product.id);

  /* Estimated delivery = 5 days from today */
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="bg-bg-main min-h-screen pb-28 pt-6">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-text-main truncate max-w-[180px]">{product.name}</span>
        </nav>

        {/* ════════ MAIN GRID ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 mb-20">

          {/* ─────── LEFT: Image Gallery ─────── */}
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24 h-max">

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 w-full md:w-20 shrink-0">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImg(img)}
                  className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 shrink-0 transition-all duration-200 ${
                    mainImg === img
                      ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-border-color'
                  }`}
                  style={{ width: 76, height: 96 }}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image with zoom */}
            <div className="relative flex-1 bg-slate-900 rounded-3xl overflow-hidden aspect-[3/4] md:aspect-auto md:h-[680px] border border-border-color cursor-crosshair group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={mainImg}
                  src={mainImg}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover object-top"
                  style={lens.visible ? {
                    transformOrigin: `${lens.bgX}% ${lens.bgY}%`,
                    transform: `scale(${ZOOM})`,
                    transition: 'transform 0.05s ease-out',
                  } : undefined}
                />
              </AnimatePresence>

              {/* Zoom icon hint */}
              <div className={`absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full transition-opacity ${lens.visible ? 'opacity-0' : 'opacity-100'}`}>
                <ZoomIn size={12} /> Hover to zoom
              </div>

              {/* Discount badge */}
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                -{discount}% OFF
              </div>

              {/* Lightbox trigger */}
              <button
                onClick={() => setLightbox(true)}
                className="absolute bottom-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
              >
                <ZoomIn size={16} />
              </button>

              {/* Prev/Next arrows for gallery */}
              <button
                onClick={() => {
                  const idx = gallery.indexOf(mainImg);
                  setMainImg(gallery[(idx - 1 + gallery.length) % gallery.length]);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  const idx = gallery.indexOf(mainImg);
                  setMainImg(gallery[(idx + 1) % gallery.length]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* ─────── RIGHT: Product Details ─────── */}
          <div className="flex flex-col gap-6 pt-2">

            {/* Category + share */}
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">
                {product.category?.name || 'Ladli Collection'}
              </span>
              <button
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="p-2 rounded-xl border border-border-color text-text-muted hover:text-primary hover:border-primary/40 transition-all"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRow rating={reviewsData.average_rating || 4.8} size={18} />
              <span className="font-bold text-text-main">{(reviewsData.average_rating || 4.8).toFixed(1)}</span>
              <button
                onClick={() => setTab('reviews')}
                className="text-sm text-text-muted underline hover:text-primary transition-colors"
              >
                {reviewsData.total_reviews || 0} Reviews
              </button>
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-xs font-bold text-red-400 bg-red-900/20 border border-red-700/30 px-2.5 py-1 rounded-full">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 py-4 border-y border-border-color">
              <span className="text-4xl font-black font-serif text-text-main">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <div className="flex flex-col pb-1">
                <span className="text-lg text-text-muted line-through">
                  ₹{(product.price * 1.4).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-green-400">
                  You save ₹{(product.price * 0.4).toLocaleString('en-IN')} ({discount}%)
                </span>
              </div>
            </div>

            {/* Fabric */}
            {product.fabric && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Fabric:</span>
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                  {product.fabric}
                </span>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-text-main uppercase tracking-wider">Select Size</span>
                <button
                  onClick={() => setShowSG(true)}
                  className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                >
                  <Ruler size={13} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[48px] h-12 px-3 rounded-xl font-bold text-sm transition-all duration-200 border ${
                      selectedSize === s
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105'
                        : 'bg-bg-card border-border-color text-text-muted hover:border-primary/50 hover:text-text-main'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <span className="text-sm font-bold text-text-main uppercase tracking-wider block mb-3">Quantity</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border-color rounded-xl bg-bg-card overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-3 font-bold text-text-main min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                    className="px-4 py-3 text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-text-muted">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-primary-hover hover:to-indigo-600 shadow-xl shadow-primary/25 active:scale-95 transition-all duration-200 disabled:opacity-40"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addedFeedback}
                className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                  addedFeedback
                    ? 'bg-green-600 text-white'
                    : 'bg-bg-card border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-40'
                }`}
              >
                {addedFeedback ? <><CheckCircle size={18} /> Added!</> : <><ShoppingBag size={18} /> Add to Bag</>}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-200 active:scale-95 ${
                  wishlisted
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-border-color text-text-muted hover:border-red-400 hover:text-red-400'
                }`}
              >
                <Heart size={20} className={wishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-bg-card border border-border-color rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-text-main">Estimated Delivery</p>
                  <p className="text-xs text-text-muted">{deliveryStr}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={18} className="text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold text-text-main">5-Day Easy Returns</p>
                  <p className="text-xs text-text-muted">No questions asked return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-indigo-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-text-main">100% Authentic</p>
                  <p className="text-xs text-text-muted">Handcrafted by verified artisans</p>
                </div>
              </div>
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Award size={18} />, label: 'Authentic' },
                { icon: <Truck size={18} />, label: 'Fast Delivery' },
                { icon: <RotateCcw size={18} />, label: '5-Day Return' },
                { icon: <ShieldCheck size={18} />, label: 'Secure Pay' },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 bg-bg-card border border-border-color rounded-xl text-center">
                  <span className="text-primary">{b.icon}</span>
                  <span className="text-[11px] font-bold text-text-muted">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ TABS: Description | Reviews ════════ */}
        <div className="mb-16">

          {/* Tab headers */}
          <div className="flex border-b border-border-color mb-8">
            {[
              { key: 'description', label: 'Description', icon: <Package size={15} /> },
              { key: 'reviews',     label: `Reviews (${reviewsData.total_reviews || 0})`, icon: <MessageSquare size={15} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* Description Tab */}
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="font-bold font-serif text-text-main text-xl mb-4">About This Product</h3>
                  <p className="text-text-muted leading-relaxed text-sm">
                    {product.description || `This exquisite ${product.name} is crafted by skilled artisans using traditional techniques passed down through generations. The intricate embroidery work and premium fabric make it perfect for festive occasions, celebrations, and cultural events.`}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold font-serif text-text-main text-xl mb-4">Product Details</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      ['Product Name',   product.name],
                      ['Fabric',         product.fabric || 'Premium Designer Fabric'],
                      ['Available Sizes',product.sizes  || 'XS, S, M, L, XL, 2XL'],
                      ['Category',       product.category?.name || 'Chaniya Choli'],
                      ['Stock',          product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'],
                      ['Care',           'Dry clean only'],
                      ['Origin',         'Made in India — Surat, Gujarat'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-4 py-2.5 border-b border-border-color last:border-0">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider w-36 shrink-0">{label}</span>
                        <span className="text-sm text-text-main">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
              >
                {/* Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-bg-card border border-border-color rounded-2xl p-6 mb-6">
                    <h3 className="font-black font-serif text-5xl text-text-main mb-1">
                      {(reviewsData.average_rating || 0).toFixed(1)}
                    </h3>
                    <StarRow rating={reviewsData.average_rating || 0} size={20} />
                    <p className="text-text-muted text-sm mt-2">Based on {reviewsData.total_reviews || 0} reviews</p>
                  </div>

                  {/* Write a review */}
                  <div className="bg-bg-card border border-border-color rounded-2xl p-6">
                    <h3 className="font-bold text-text-main mb-4">Write a Review</h3>
                    {!user ? (
                      <p className="text-sm text-text-muted">
                        <Link to="/login" className="text-primary font-bold">Log in</Link> to share your thoughts.
                      </p>
                    ) : (
                      <form onSubmit={submitReview} className="flex flex-col gap-4">
                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Your Rating</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <button
                                type="button" key={s}
                                onClick={() => setNewReview(r => ({ ...r, rating: s }))}
                                className="hover:scale-110 transition-transform"
                              >
                                <Star size={24} className={s <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Comment</label>
                          <textarea
                            rows={4}
                            value={newReview.comment}
                            onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))}
                            placeholder="What did you like about this product?"
                            className="w-full px-4 py-3 rounded-xl bg-bg-main border border-border-color text-text-main text-sm focus:border-primary outline-none resize-none"
                          />
                        </div>
                        {reviewError && <p className="text-red-400 text-xs">{reviewError}</p>}
                        <button
                          type="submit" disabled={submitting}
                          className="bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
                        >
                          {submitting ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {reviewsData.reviews?.length === 0 ? (
                    <div className="text-center py-16 bg-bg-card border border-border-color rounded-2xl">
                      <Star size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-text-main mb-1">No reviews yet</p>
                      <p className="text-text-muted text-sm">Be the first to review this product!</p>
                    </div>
                  ) : (
                    reviewsData.reviews.map(review => (
                      <div key={review.id} className="bg-bg-card border border-border-color rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center uppercase shrink-0">
                              {review.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-text-main text-sm">{review.username || 'Customer'}</p>
                              <p className="text-xs text-text-muted">
                                {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <StarRow rating={review.rating} size={14} />
                        </div>
                        {review.comment && (
                          <p className="text-text-muted text-sm leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ════════ RELATED PRODUCTS ════════ */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black font-serif text-text-main">You May Also Like</h2>
              <Link to="/catalog" className="text-primary font-bold text-sm hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map(p => <RelatedCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-[60px] left-0 right-0 bg-bg-card/95 backdrop-blur-md border-t border-border-color px-4 py-3 z-40 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted truncate">{product.name}</p>
          <p className="font-black text-primary font-serif">₹{product.price.toLocaleString('en-IN')}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${addedFeedback ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary-hover'}`}
        >
          {addedFeedback ? 'Added!' : 'Add to Bag'}
        </button>
        <button
          onClick={handleBuyNow}
          className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all"
        >
          Buy Now
        </button>
      </div>

      {/* ════════ LIGHTBOX ════════ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={mainImg}
              alt={product.name}
              className="max-w-2xl max-h-[90vh] object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <SizeGuide isOpen={showSizeGuide} onClose={() => setShowSG(false)} />
    </div>
  );
};

export default ProductView;
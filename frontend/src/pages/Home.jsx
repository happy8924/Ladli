import React, { useEffect, useState } from 'react';
import api from '../api/api';

/* ── Home Sections ── */
import HeroSlider      from '../components/home/HeroSlider';
import ShopByCategory  from '../components/home/ShopByCategory';
import ProductSection  from '../components/home/ProductSection';
import FlashSale       from '../components/home/FlashSale';
import CustomerReviews from '../components/home/CustomerReviews';
import { OfferBanner, Newsletter } from '../components/home/HomeExtras';

/* ── Trust strip data (below hero) ── */
const TRUST = [
  { icon: '🪡', label: 'Handcrafted',   sub: 'Authentic embroidery' },
  { icon: '🚚', label: 'Free Delivery',  sub: 'Orders above ₹2,000' },
  { icon: '↩️', label: 'Easy Returns',   sub: '5-day return policy' },
  { icon: '🔒', label: 'Secure Pay',     sub: 'Encrypted checkout' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (e) {
        console.error('Failed to fetch products', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-bg-main overflow-x-hidden">

      {/* 1 ── Offer ticker */}
      <OfferBanner />

      {/* 2 ── Hero Slider */}
      <HeroSlider />

      {/* 3 ── Trust badges */}
      <div className="bg-bg-card border-b border-border-color">
        <div className="container py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map(t => (
              <div key={t.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors">
                <span className="text-2xl shrink-0">{t.icon}</span>
                <div>
                  <p className="font-bold text-text-main text-sm">{t.label}</p>
                  <p className="text-text-muted text-xs">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 ── Shop by Category */}
      <ShopByCategory />

      {/* 5 ── Trending / Best Sellers / New Collection tabs */}
      <ProductSection products={products} loading={loading} />

      {/* 6 ── Flash Sale */}
      <FlashSale products={products} loading={loading} />

      {/* 7 ── Customer Reviews */}
      <CustomerReviews />

      {/* 8 ── Newsletter */}
      <Newsletter />

    </div>
  );
};

export default Home;
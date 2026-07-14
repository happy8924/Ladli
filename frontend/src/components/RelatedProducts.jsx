// =====================================================
// RelatedProducts.jsx
// =====================================================
// Shows other products from the same category on the
// Product Details page ("You May Also Like").
//
// Usage in ProductView.jsx:
//   import RelatedProducts from '../components/RelatedProducts';
//   <RelatedProducts categoryId={product.category_id} excludeId={product.id} />

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../api/api';
import ProductCard from './ProductCard';

const RelatedProducts = ({ categoryId, excludeId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api.get('/products/', { params: { category_id: categoryId, limit: 8 } })
      .then(res => {
        if (!isMounted) return;
        const filtered = (res.data || []).filter(p => p.id !== excludeId);
        setProducts(filtered.slice(0, 4));
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [categoryId, excludeId]);

  if (loading) {
    return (
      <section className="mt-16 border-t border-border-color pt-12">
        <h2 className="text-2xl md:text-3xl font-black font-serif text-text-main mb-6 flex items-center gap-2">
          <Sparkles size={22} className="text-primary" /> You May Also Like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border-color pt-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-black font-serif text-text-main flex items-center gap-2">
          <Sparkles size={22} className="text-primary" /> You May Also Like
        </h2>
        <p className="text-sm text-text-muted hidden sm:block">Handpicked from the same collection</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;

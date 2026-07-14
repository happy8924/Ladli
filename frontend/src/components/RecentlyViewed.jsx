// =====================================================
// RecentlyViewed.jsx
// =====================================================
// 1. Wrap App with <RecentlyViewedProvider> (in main.jsx or App.jsx)
// 2. In ProductView.jsx useEffect, call addToRecent(product)
// 3. Drop <RecentlyViewed /> anywhere (e.g. bottom of ProductView)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// ---------- Context ----------
const RecentlyViewedContext = createContext();
export const useRecentlyViewed = () => useContext(RecentlyViewedContext);

const MAX_ITEMS = 6;
const STORAGE_KEY = 'ladli_recently_viewed';

export const RecentlyViewedProvider = ({ children }) => {
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  });

  const addToRecent = (product) => {
    setRecent(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated  = [product, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ recent, addToRecent }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

// ---------- UI Component ----------
const RecentlyViewed = ({ excludeId }) => {
  const { recent } = useRecentlyViewed();
  const items = recent.filter(p => p.id !== excludeId);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border-color pt-12">
      <h2 className="text-2xl font-black font-serif text-text-main mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map(product => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group flex flex-col bg-white rounded-xl border border-border-color overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="aspect-[3/4] overflow-hidden bg-slate-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-bold text-text-main truncate font-serif">{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-primary">₹{product.price?.toLocaleString('en-IN')}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
                  <Star size={9} className="fill-yellow-400 text-yellow-400" /> 4.8
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;

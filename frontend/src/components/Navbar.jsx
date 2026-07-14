import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Search, ShoppingBag, LogOut, Menu, X, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin, isLogistics } = useAuth();
  const { cartItems }     = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { name: 'Home',        path: '/'        },
    { name: 'Collections', path: '/catalog' },
    { name: 'New Arrivals',path: '/catalog?category=new' },
    // ✅ /about changed to /contact — no more "No routes matched /about"
    { name: 'About',       path: '/contact' },
  ];

  const isActive = (path) => {
    const base = path.split('?')[0];
    if (base === '/' && location.pathname === '/') return true;
    if (base !== '/' && location.pathname.startsWith(base)) return true;
    return false;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-border-color ${
      scrolled ? 'bg-bg-card/95 backdrop-blur-md shadow-sm' : 'bg-bg-card'
    }`}>
      <div className="container mx-auto flex justify-between items-center h-[72px] px-4">

        {/* Logo + mobile toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden p-2 text-text-muted hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            to="/"
            className="text-3xl font-black tracking-tight text-primary hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            LADLI<span className="text-secondary text-4xl leading-none">.</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-full text-[15px] font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-main hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link to="/search" className="p-2 rounded-full text-text-muted hover:bg-white/5 transition-colors">
            <Search size={20} />
          </Link>

          <Link to="/wishlist" className="relative p-2 rounded-full text-text-muted hover:bg-white/5 transition-colors">
            <Heart size={20} className={wishlistItems?.length > 0 ? 'text-secondary' : ''} />
            {wishlistItems?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-bg-card">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative p-2 rounded-full text-text-muted hover:bg-white/5 transition-colors">
            <ShoppingBag size={20} />
            {cartItems?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-bg-card">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* User */}
          <div className="hidden sm:block ml-1">
            {isAdmin || isLogistics ? (
              <Link to="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">A</div>
                <span className="text-sm font-medium text-text-main">Admin</span>
              </Link>
            ) : user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                <Link to="/account" className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-text-main max-w-[80px] truncate">
                    {user.username || 'User'}
                  </span>
                </Link>
                <button onClick={logout} className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors ml-1">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors shadow-sm">
                <User size={15} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-bg-card w-72 h-full p-6 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setMobileOpen(false)} className="self-end p-2 text-text-muted hover:text-primary">
                <X size={24} />
              </button>

              <div className="mt-4 mb-6">
                <p className="text-2xl font-black font-serif text-primary">LADLI<span className="text-secondary">.</span></p>
                {user && <p className="text-sm text-text-muted mt-1">Hello, {user.username}!</p>}
              </div>

              <nav className="space-y-2 flex-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(link.path)
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-text-muted hover:text-text-main hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link to="/orders"  className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-white/5">My Orders</Link>
                <Link to="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-white/5">Account</Link>
                <Link to="/faq"     className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-white/5">FAQ & Help</Link>
              </nav>

              <div className="border-t border-border-color pt-4 mt-4">
                {user ? (
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-2 text-red-400 font-bold py-2 px-4">
                    <LogOut size={18} /> Sign Out
                  </button>
                ) : (
                  <Link to="/login" className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold">
                    <User size={18} /> Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
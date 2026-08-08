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
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { name: 'Home',        path: '/'        },
    { name: 'Collections', path: '/catalog' },
    { name: 'New Arrivals',path: '/catalog?category=new' },
  ];

  const isActive = (path) => {
    const base = path.split('?')[0];
    if (base === '/' && location.pathname === '/') return true;
    if (base !== '/' && location.pathname.startsWith(base)) return true;
    return false;
  };

  // Do not render storefront Navbar on Admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-[#EADBC8] ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
    }`}>
      <div className="container mx-auto flex justify-between items-center h-[76px] px-4 sm:px-6">

        {/* Logo + mobile toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden p-2 text-gray-700 hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            to="/"
            className="text-3xl font-black tracking-tight text-primary hover:opacity-90 transition-opacity flex items-baseline"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            LADLI<span className="text-secondary text-4xl leading-none font-bold">.</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-full text-[15px] font-semibold transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:text-primary hover:bg-amber-50/80'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/search" className="p-2.5 rounded-full text-gray-700 hover:bg-amber-50 hover:text-primary transition-colors" title="Search">
            <Search size={20} />
          </Link>

          {!isAdmin && !isLogistics && (
            <>
              <Link to="/wishlist" className="relative p-2.5 rounded-full text-gray-700 hover:bg-amber-50 hover:text-primary transition-colors" title="Wishlist">
                <Heart size={20} className={wishlistItems?.length > 0 ? 'text-red-600 fill-red-600' : ''} />
                {wishlistItems?.length > 0 && (
                  <span className="absolute top-0 right-0 bg-secondary text-white text-[11px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative p-2.5 rounded-full text-gray-700 hover:bg-amber-50 hover:text-primary transition-colors" title="Cart">
                <ShoppingBag size={20} />
                {cartItems?.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[11px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* User Account / Login */}
          <div className="hidden sm:block ml-2">
            {isAdmin || isLogistics ? (
              <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-amber-100/70 border border-amber-300 rounded-full hover:bg-amber-200/80 transition-colors">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">A</div>
                <span className="text-sm font-bold text-primary">Admin Panel</span>
              </Link>
            ) : user ? (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-amber-50/80 border border-[#EADBC8] rounded-full">
                <Link to="/account" className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-gray-900 max-w-[90px] truncate">
                    {user.username || 'User'}
                  </span>
                </Link>
                <button onClick={logout} className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors ml-1 bg-red-50 px-2 py-1 rounded-full">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 active:scale-95">
                <User size={16} /> Login
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
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-72 h-full p-6 flex flex-col shadow-2xl border-r border-[#EADBC8]"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setMobileOpen(false)} className="self-end p-2 text-gray-600 hover:text-primary">
                <X size={24} />
              </button>

              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-lg font-semibold py-2 px-3 rounded-xl ${
                      isActive(link.path) ? 'bg-primary text-white' : 'text-gray-800 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-6 border-t border-[#EADBC8] space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-xl">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role || 'Customer'}</p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 font-bold bg-red-50 rounded-xl"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl"
                    >
                      <User size={18} /> Login / Register
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
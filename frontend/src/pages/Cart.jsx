import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  CheckCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CouponBox from '../components/CouponBox';
import CheckoutStepper from '../components/CheckoutStepper';

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalPrice
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [discount, setDiscount] = useState(0);

  const SHIPPING_THRESHOLD = 2000;
  const shippingFree = totalPrice >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : 150;
  const grandTotal = Math.max(0, totalPrice - discount + shipping);

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (user?.role === 'admin' || user?.role === 'logistics') {
    return (
      <div className="min-h-[75vh] bg-bg-main py-12 flex flex-col justify-center items-center px-4">
        <div className="bg-[#0F172A] border border-amber-500/40 rounded-3xl p-10 max-w-lg mx-auto text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-2xl font-black font-serif text-white mb-2">
            Admin Account Notice
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Admin accounts manage store operations, product listings, and customer orders. Customer cart and purchasing actions are disabled for admin accounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/admin"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-sm shadow-md transition-colors"
            >
              Go to Admin Dashboard
            </Link>
            <Link
              to="/catalog"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] bg-bg-main py-12 flex flex-col justify-center items-center px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <CheckoutStepper currentStep={1} />
          
          <div className="bg-bg-card border border-border-color rounded-3xl p-10 md:p-16 shadow-xl text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-serif text-text-main mb-3">
              Aapka Cart Khaali Hai
            </h2>
            <p className="text-text-muted text-sm leading-relaxed mb-8">
              Apni pasandida Chaniya Choli aur designer outfits add kijiye aur festive shopping ka anand lijiye.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
            >
              Collection Dekho <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main py-8 pb-24">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Stepper Header */}
        <CheckoutStepper currentStep={1} />

        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main">
              Shopping Bag
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Aapke paas {cartItems.reduce((s, i) => s + i.quantity, 0)} items cart mein hain.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-1.5"
          >
            Shopping Continue Karo <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {/* Free Shipping Banner */}
            {!shippingFree ? (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 text-primary text-sm font-bold">
                <Tag size={18} className="shrink-0 text-primary" />
                <span>
                  ₹{(SHIPPING_THRESHOLD - totalPrice).toLocaleString('en-IN')} aur kharido — FREE Shipping milegi!
                </span>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3 text-green-700 dark:text-green-400 text-sm font-bold">
                <CheckCircle size={18} className="shrink-0 text-green-500" />
                <span>Mubarak ho! Aapko Is Order Par FREE Shipping Mil Rahi Hai.</span>
              </div>
            )}

            <div className="bg-bg-card border border-border-color rounded-3xl p-4 sm:p-6 shadow-sm">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.cartItemId || `${item.id}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-border-color last:border-0"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-bg-main shrink-0 border border-border-color hover:border-primary transition-all"
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md inline-block mb-1">
                          {item.fabric || 'Designer Fabric'}
                        </span>
                        <h3 className="font-bold text-text-main text-base sm:text-lg font-serif truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                          Size: <strong className="text-text-main font-bold">{item.selectedSize || 'M'}</strong>
                        </p>
                        <p className="font-black text-text-main text-base sm:hidden mt-2">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-color">
                      <div className="flex items-center border border-border-color rounded-xl bg-bg-main overflow-hidden">
                        <button
                          onClick={() => decreaseQuantity(item.id, item.selectedSize)}
                          className="p-2 text-text-muted hover:text-text-main hover:bg-white/10 transition-colors"
                          title="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 font-bold text-text-main min-w-[36px] text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id, item.selectedSize)}
                          className="p-2 text-text-muted hover:text-text-main hover:bg-white/10 transition-colors"
                          title="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="font-black text-text-main text-lg hidden sm:block min-w-[90px] text-right">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div className="bg-bg-card border border-border-color rounded-2xl p-4 flex items-center gap-3">
                <Truck size={20} className="text-primary shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-text-main">Fast Express Shipping</h4>
                  <p className="text-[11px] text-text-muted">Delivered in 4-6 days</p>
                </div>
              </div>
              <div className="bg-bg-card border border-border-color rounded-2xl p-4 flex items-center gap-3">
                <RotateCcw size={20} className="text-primary shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-text-main">5-Day Easy Returns</h4>
                  <p className="text-[11px] text-text-muted">Hassle-free exchange</p>
                </div>
              </div>
              <div className="bg-bg-card border border-border-color rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-text-main">100% Authentic Quality</h4>
                  <p className="text-[11px] text-text-muted">Gujarati Artisans Handcrafted</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-black font-serif text-text-main mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Order Summary
              </h2>

              {/* Coupon Box */}
              <div className="mb-6">
                <CouponBox totalPrice={totalPrice} onDiscount={setDiscount} />
              </div>

              <div className="flex flex-col gap-3 py-4 border-y border-border-color text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-main">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-muted">
                  <span>Shipping Fee</span>
                  <span className={shippingFree ? 'font-bold text-green-600 dark:text-green-400' : 'font-bold text-text-main'}>
                    {shippingFree ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 text-lg">
                <span className="font-black text-text-main font-serif">Grand Total</span>
                <span className="font-black text-primary text-2xl font-serif">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-4 active:scale-95"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              {!user && (
                <p className="text-xs text-center text-text-muted mt-3">
                  Aapko checkout continue karne ke liye login karna hoga.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
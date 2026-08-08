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
    clearCart,
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
      <div className="min-h-[75vh] bg-white py-12 flex flex-col justify-center items-center px-4">
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
      <div className="min-h-[75vh] bg-white py-12 flex flex-col justify-center items-center px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <CheckoutStepper currentStep={1} />
          
          <div className="bg-white border border-[#EADBC8] rounded-3xl p-10 md:p-16 shadow-xl text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#800000]/10 text-[#800000] flex items-center justify-center mx-auto mb-6 border border-[#C9A227]">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-serif text-gray-900 mb-3">
              Aapka Cart Khaali Hai
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Apni pasandida Chaniya Choli aur designer outfits add kijiye aur festive shopping ka anand lijiye.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-[#800000] text-white border border-[#C9A227] px-8 py-4 rounded-xl font-bold hover:bg-[#5C0000] transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Collection Dekho <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Stepper Header */}
        <CheckoutStepper currentStep={1} />

        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-serif text-gray-900">
              Shopping Bag
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Aapke paas <strong className="text-[#800000]">{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong> items cart mein hain.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 text-xs font-extrabold bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-all border border-red-200"
            >
              Clear Entire Cart
            </button>
            <Link
              to="/catalog"
              className="text-[#800000] font-bold text-sm hover:underline inline-flex items-center gap-1.5"
            >
              Shopping Continue Karo <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {/* Free Shipping Banner */}
            {!shippingFree ? (
              <div className="bg-amber-50 border border-[#C9A227] rounded-2xl p-4 flex items-center gap-3 text-[#800000] text-sm font-bold shadow-sm">
                <Tag size={18} className="shrink-0 text-[#800000]" />
                <span>
                  ₹{(SHIPPING_THRESHOLD - totalPrice).toLocaleString('en-IN')} aur kharido — FREE Shipping milegi!
                </span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-sm">
                <CheckCircle size={18} className="shrink-0 text-emerald-600" />
                <span>Mubarak ho! Aapko Is Order Par FREE Shipping Mil Rahi Hai.</span>
              </div>
            )}

            <div className="bg-white border border-[#EADBC8] rounded-3xl p-4 sm:p-6 shadow-sm">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => {
                  const itemKey = item.cartItemId || `${item.id}-${item.selectedSize}`;
                  return (
                    <motion.div
                      key={itemKey}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50, height: 0, padding: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-[#EADBC8] last:border-0"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          to={`/product/${item.id}`}
                          className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-amber-50 shrink-0 border border-[#EADBC8] hover:border-[#800000] transition-all"
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#800000] bg-amber-50 px-2.5 py-0.5 rounded-md inline-block mb-1 border border-amber-200">
                            {item.fabric || 'Designer Fabric'}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg font-serif truncate">
                            <Link to={`/product/${item.id}`} className="hover:text-[#800000] transition-colors">{item.name}</Link>
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Size: <strong className="text-gray-900 font-bold">{item.selectedSize || 'M'}</strong>
                          </p>
                          <p className="font-black text-[#800000] text-base sm:hidden mt-2 font-serif">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EADBC8]">
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#EADBC8] rounded-xl bg-amber-50/50 overflow-hidden">
                          <button
                            onClick={() => decreaseQuantity(item.id, item.selectedSize)}
                            className="p-2 text-gray-700 hover:text-[#800000] hover:bg-amber-100 transition-colors"
                            title="Decrease Quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3.5 py-1 font-bold text-gray-900 min-w-[36px] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id, item.selectedSize)}
                            className="p-2 text-gray-700 hover:text-[#800000] hover:bg-amber-100 transition-colors"
                            title="Increase Quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="font-black text-[#800000] text-lg hidden sm:block min-w-[90px] text-right font-serif">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>

                        {/* REMOVE FROM CART BUTTON */}
                        <button
                          onClick={() => removeFromCart(item, item.selectedSize)}
                          className="p-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-200 shadow-sm flex items-center gap-1 font-bold text-xs"
                          title="Remove item from cart"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div className="bg-white border border-[#EADBC8] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <Truck size={20} className="text-[#800000] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Fast Express Shipping</h4>
                  <p className="text-[11px] text-gray-500">Delivered in 4-6 days</p>
                </div>
              </div>
              <div className="bg-white border border-[#EADBC8] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <RotateCcw size={20} className="text-[#800000] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">5-Day Easy Returns</h4>
                  <p className="text-[11px] text-gray-500">Hassle-free exchange</p>
                </div>
              </div>
              <div className="bg-white border border-[#EADBC8] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <ShieldCheck size={20} className="text-[#800000] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">100% Authentic Quality</h4>
                  <p className="text-[11px] text-gray-500">Gujarati Artisans Handcrafted</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border border-[#EADBC8] rounded-3xl p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-black font-serif text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-[#800000]" /> Order Summary
              </h2>

              {/* Coupon Box */}
              <div className="mb-6">
                <CouponBox totalPrice={totalPrice} onDiscount={setDiscount} />
              </div>

              <div className="flex flex-col gap-3 py-4 border-y border-[#EADBC8] text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 font-serif">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className={shippingFree ? 'font-bold text-emerald-700' : 'font-bold text-gray-900'}>
                    {shippingFree ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 text-lg">
                <span className="font-black text-gray-900 font-serif">Grand Total</span>
                <span className="font-black text-[#800000] text-2xl font-serif">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-[#800000] text-white border border-[#C9A227] rounded-2xl font-bold text-base hover:bg-[#5C0000] transition-all shadow-lg flex items-center justify-center gap-2 mt-4 active:scale-95"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              {!user && (
                <p className="text-xs text-center text-gray-500 mt-3 font-medium">
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
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, User, Home, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutStepper from '../components/CheckoutStepper';

const Checkout = () => {
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('ladli_shipping');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      shipping_name: user?.username || '',
      shipping_phone: user?.phone || '',
      shipping_address: user?.address || '',
      shipping_city: 'Surat',
      shipping_state: 'Gujarat',
      shipping_pincode: '',
    };
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.shipping_name.trim()) errs.shipping_name = 'Full name is required';
    if (!/^\d{10}$/.test(form.shipping_phone.trim())) errs.shipping_phone = 'Enter valid 10-digit mobile number';
    if (!form.shipping_address.trim()) errs.shipping_address = 'Address is required';
    if (!form.shipping_city.trim()) errs.shipping_city = 'City is required';
    if (!form.shipping_state.trim()) errs.shipping_state = 'State is required';
    if (!/^\d{6}$/.test(form.shipping_pincode.trim())) errs.shipping_pincode = 'Enter valid 6-digit pincode';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    sessionStorage.setItem('ladli_shipping', JSON.stringify(form));
    navigate('/payment');
  };

  const SHIPPING_THRESHOLD = 2000;
  const shippingFree = totalPrice >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : 150;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="min-h-screen bg-bg-main py-8 pb-24">
      <div className="container max-w-5xl mx-auto px-4">
        
        <CheckoutStepper currentStep={2} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black font-serif text-text-main">
              Shipping Address
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Enter your delivery details to ensure accurate shipping.
            </p>
          </div>
          <Link
            to="/cart"
            className="text-text-muted hover:text-primary text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Bag
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Shipping Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-bg-card border border-border-color rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2 border-b border-border-color pb-3">
                <MapPin size={18} /> Delivery Contact & Location
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    name="shipping_name"
                    value={form.shipping_name}
                    onChange={handleChange}
                    placeholder="Recipient's Full Name"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${errors.shipping_name ? 'border-red-500 bg-red-500/5' : 'border-border-color'} bg-bg-main text-text-main text-sm outline-none focus:border-primary transition-colors`}
                  />
                </div>
                {errors.shipping_name && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shipping_name}</p>}
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={form.shipping_phone}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="10-digit mobile number for order updates"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${errors.shipping_phone ? 'border-red-500 bg-red-500/5' : 'border-border-color'} bg-bg-main text-text-main text-sm outline-none focus:border-primary transition-colors`}
                  />
                </div>
                {errors.shipping_phone && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shipping_phone}</p>}
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Street Address & House No *
                </label>
                <div className="relative">
                  <Home size={16} className="absolute left-4 top-4 text-text-muted" />
                  <textarea
                    name="shipping_address"
                    rows={3}
                    value={form.shipping_address}
                    onChange={handleChange}
                    placeholder="Flat / House No, Building Name, Street, Landmark"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${errors.shipping_address ? 'border-red-500 bg-red-500/5' : 'border-border-color'} bg-bg-main text-text-main text-sm outline-none focus:border-primary transition-colors resize-none`}
                  />
                </div>
                {errors.shipping_address && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shipping_address}</p>}
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={form.shipping_city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.shipping_city ? 'border-red-500 bg-red-500/5' : 'border-border-color'} bg-bg-main text-text-main text-sm outline-none focus:border-primary transition-colors`}
                  />
                  {errors.shipping_city && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shipping_city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="shipping_state"
                    value={form.shipping_state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.shipping_state ? 'border-red-500 bg-red-500/5' : 'border-border-color'} bg-bg-main text-text-main text-sm outline-none focus:border-primary transition-colors`}
                  />
                  {errors.shipping_state && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shipping_state}</p>}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Pincode (6 Digits) *
                </label>
                <input
                  type="text"
                  name="shipping_pincode"
                  value={form.shipping_pincode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="e.g. 395002"
                  className={`w-full px-4 py-3.5 rounded-xl border ${errors.shipping_pincode ? 'border-red-500 bg-red-500/5' : 'border-border-color'} bg-bg-main text-text-main text-sm outline-none focus:border-primary transition-colors`}
                />
                {errors.shipping_pincode && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shipping_pincode}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-4 active:scale-95"
              >
                Proceed to Payment <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="lg:col-span-5">
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-md sticky top-24">
              <h3 className="font-serif font-black text-xl text-text-main mb-4 pb-3 border-b border-border-color">
                Order Items ({cartItems.length})
              </h3>

              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 mb-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId || `${item.id}-${item.selectedSize}`} className="flex items-center gap-3 py-2 border-b border-border-color/50 last:border-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-xl bg-bg-main shrink-0 border border-border-color"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-text-main text-sm truncate">{item.name}</p>
                      <p className="text-xs text-text-muted">Size: {item.selectedSize || 'M'} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-text-main text-sm shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-border-color text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-main">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Delivery Charge</span>
                  <span className={shippingFree ? 'font-bold text-green-600 dark:text-green-400' : 'font-bold text-text-main'}>
                    {shippingFree ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-text-main pt-2 border-t border-border-color">
                  <span>Total Payable</span>
                  <span className="text-primary font-serif">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-5 flex items-center gap-3 text-xs text-text-muted">
                <ShieldCheck size={20} className="text-primary shrink-0" />
                <span>Your delivery address and details are protected under 256-bit SSL encryption.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Banknote,
  Wallet,
  ShieldCheck,
  MapPin,
  CheckCircle,
  QrCode,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import CheckoutStepper from '../components/CheckoutStepper';

const Payment = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingForm, setShippingForm] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Online simulated payment state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStatus, setQrStatus] = useState('waiting'); // 'waiting' | 'verifying' | 'success'

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'logistics') {
      alert('Admin accounts are reserved for store management and cannot place customer orders.');
      navigate('/admin');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const savedShipping = sessionStorage.getItem('ladli_shipping');
    if (!savedShipping) {
      navigate('/checkout');
      return;
    }

    try {
      setShippingForm(JSON.parse(savedShipping));
    } catch (e) {
      navigate('/checkout');
    }
  }, [cartItems, navigate]);

  const SHIPPING_THRESHOLD = 2000;
  const shippingFree = totalPrice >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : 150;
  const grandTotal = totalPrice + shipping;

  const handlePlaceOrder = async (overridePaymentMethod = null) => {
    if (!user || !shippingForm) return;
    setPlacing(true);
    setError('');

    const itemsPayload = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      selected_size: item.selectedSize || 'M'
    }));

    const orderPayload = {
      items: itemsPayload,
      shipping_name: shippingForm.shipping_name,
      shipping_phone: shippingForm.shipping_phone,
      shipping_address: shippingForm.shipping_address,
      shipping_city: shippingForm.shipping_city,
      shipping_state: shippingForm.shipping_state,
      shipping_pincode: shippingForm.shipping_pincode,
      payment_method: overridePaymentMethod || paymentMethod,
    };

    try {
      const res = await api.post('/orders/', orderPayload);
      const createdOrder = res.data;
      clearCart();
      sessionStorage.removeItem('ladli_shipping');
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to place order. Stock update failed or server unreachable.');
    } finally {
      setPlacing(false);
    }
  };

  const handleSimulatePayment = () => {
    setQrStatus('verifying');
    setTimeout(() => {
      setQrStatus('success');
      setTimeout(() => {
        setShowQrModal(false);
        handlePlaceOrder('online');
      }, 1000);
    }, 1500);
  };

  if (!shippingForm) return null;

  return (
    <div className="min-h-screen bg-bg-main py-8 pb-24">
      <div className="container max-w-5xl mx-auto px-4">
        
        <CheckoutStepper currentStep={3} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black font-serif text-text-main">
              Payment & Review
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Select your payment method and confirm your order placement.
            </p>
          </div>
          <Link
            to="/checkout"
            className="text-text-muted hover:text-primary text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={16} /> Edit Address
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Delivery Address + Payment Method selection */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Delivery Details Card */}
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-color">
                <h3 className="font-bold text-text-main text-sm flex items-center gap-2 uppercase tracking-wider">
                  <MapPin size={16} className="text-primary" /> Delivery Address
                </h3>
                <Link to="/checkout" className="text-xs text-primary font-bold hover:underline">
                  Change Address
                </Link>
              </div>
              <p className="font-bold text-text-main text-base">{shippingForm.shipping_name}</p>
              <p className="text-sm text-text-muted mt-1">{shippingForm.shipping_address}</p>
              <p className="text-sm text-text-muted">
                {shippingForm.shipping_city}, {shippingForm.shipping_state} - {shippingForm.shipping_pincode}
              </p>
              <p className="text-xs text-text-main font-bold mt-2">
                Phone: <span className="text-text-muted font-normal">{shippingForm.shipping_phone}</span>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-text-main text-sm flex items-center gap-2 uppercase tracking-wider mb-4 pb-2 border-b border-border-color">
                <Wallet size={16} className="text-primary" /> Choose Payment Option
              </h3>

              <div className="flex flex-col gap-3">
                
                {/* Cash On Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border-color bg-bg-main hover:border-primary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote size={18} className="text-primary" />
                      <span className="font-bold text-text-main text-base">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Pay in cash when your package is delivered right at your doorstep.
                    </p>
                  </div>
                </label>

                {/* Online Payment (Razorpay / UPI) */}
                <label
                  onClick={() => setPaymentMethod('online')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border-color bg-bg-main hover:border-primary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="mt-1 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={18} className="text-primary" />
                        <span className="font-bold text-text-main text-base">Online Payment (UPI / Cards / NetBanking)</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                        Instant Order
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Instant & 100% secure payment through GPay, PhonePe, Paytm, Credit/Debit Card.
                    </p>
                  </div>
                </label>

              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (paymentMethod === 'online') {
                    setShowQrModal(true);
                  } else {
                    handlePlaceOrder('cod');
                  }
                }}
                disabled={placing}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-60"
              >
                {placing ? (
                  <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                ) : (
                  <><Lock size={18} /> Confirm & Place Order (₹{grandTotal.toLocaleString('en-IN')})</>
                )}
              </button>

            </div>

          </div>

          {/* RIGHT: Order Breakdown Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-md sticky top-24">
              <h3 className="font-serif font-black text-xl text-text-main mb-4 pb-3 border-b border-border-color">
                Order Review ({cartItems.length} items)
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
                  <span>Cart Items Total</span>
                  <span className="font-bold text-text-main">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping Fee</span>
                  <span className={shippingFree ? 'font-bold text-green-600 dark:text-green-400' : 'font-bold text-text-main'}>
                    {shippingFree ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-text-main pt-2 border-t border-border-color">
                  <span>Total Amount</span>
                  <span className="text-primary font-serif">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-bg-main border border-border-color rounded-2xl p-4 mt-5 flex items-center gap-3 text-xs text-text-muted">
                <ShieldCheck size={20} className="text-green-500 shrink-0" />
                <span>Your order is backed by Ladli 100% Quality &amp; Safe Delivery Guarantee.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Online Simulated Payment Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-color rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative animate-slide-in">
            {qrStatus === 'waiting' && (
              <>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Scan &amp; Pay via UPI</p>
                <h3 className="text-2xl font-black font-serif text-text-main mb-4">₹{grandTotal.toLocaleString('en-IN')}</h3>
                
                <div className="bg-white p-3 rounded-2xl inline-block border border-border-color mb-4 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `upi://pay?pa=ladlistore@upi&pn=LadliStore&am=${grandTotal}&cu=INR`
                    )}`}
                    alt="UPI QR Code"
                    className="w-44 h-44 mx-auto"
                  />
                </div>

                <p className="text-xs text-text-muted flex items-center justify-center gap-1.5 mb-3">
                  <QrCode size={14} /> Scan with Google Pay, PhonePe, Paytm or Any UPI App
                </p>

                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] p-2.5 rounded-xl mb-4">
                  Demo Mode: Simulated payment verification for testing.
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQrModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border-color text-text-muted font-bold text-xs hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulatePayment}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-hover transition-colors shadow-md"
                  >
                    Paid Successfully ✓
                  </button>
                </div>
              </>
            )}

            {qrStatus === 'verifying' && (
              <div className="py-8 flex flex-col items-center">
                <Loader2 size={40} className="text-primary animate-spin mb-3" />
                <p className="font-bold text-text-main">Verifying Transaction...</p>
                <p className="text-xs text-text-muted mt-1">Checking with payment gateway</p>
              </div>
            )}

            {qrStatus === 'success' && (
              <div className="py-8 flex flex-col items-center">
                <CheckCircle size={48} className="text-green-500 mb-3" />
                <p className="font-bold text-text-main text-lg">Payment Verified!</p>
                <p className="text-xs text-text-muted mt-1">Creating your order now...</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Payment;

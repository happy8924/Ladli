import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader,
  MapPin,
  Phone,
  User,
  Wallet,
  Banknote,
  QrCode,
  X
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import CouponBox from '../components/CouponBox';

const EMPTY_SHIPPING = {
  shipping_name: '',
  shipping_phone: '',
  shipping_address: '',
  shipping_city: '',
  shipping_state: '',
  shipping_pincode: '',
  payment_method: 'cod',
};

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

  const [placing, setPlacing]           = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId]           = useState(null);
  const [error, setError]               = useState('');
  const [discount, setDiscount]         = useState(0);
  const [shippingForm, setShippingForm] = useState(EMPTY_SHIPPING);
  const [formErrors, setFormErrors]     = useState({});

  const SHIPPING_THRESHOLD = 2000;
  const shippingFree       = totalPrice >= SHIPPING_THRESHOLD;
  const shipping           = shippingFree ? 0 : 150;
  const grandTotal         = totalPrice - discount + shipping;

  const [showPayModal, setShowPayModal] = useState(false);
  const [payStatus, setPayStatus]       = useState('waiting'); // 'waiting' | 'success'
  const [pendingItems, setPendingItems] = useState(null);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(f => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors(fe => ({ ...fe, [name]: undefined }));
  };

  const validateShipping = () => {
    const errs = {};
    if (!shippingForm.shipping_name.trim()) errs.shipping_name = 'Naam zaroori hai';
    if (!/^\d{10}$/.test(shippingForm.shipping_phone.trim())) errs.shipping_phone = '10-digit phone number daaliye';
    if (!shippingForm.shipping_address.trim()) errs.shipping_address = 'Address zaroori hai';
    if (!shippingForm.shipping_city.trim()) errs.shipping_city = 'City zaroori hai';
    if (!shippingForm.shipping_state.trim()) errs.shipping_state = 'State zaroori hai';
    if (!/^\d{6}$/.test(shippingForm.shipping_pincode.trim())) errs.shipping_pincode = '6-digit pincode daaliye';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setError('');
    if (!validateShipping()) {
      setError('Delivery details bhar dijiye upar.');
      return;
    }

    const items = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      selected_size: item.selectedSize || 'M'
    }));

    if (shippingForm.payment_method === 'cod') {
      await finalizeOrder(items);
      return;
    }

    // Online payment — simulated QR checkout (no real gateway wired up)
    setPendingItems(items);
    setPayStatus('waiting');
    setShowPayModal(true);
  };

  const finalizeOrder = async (items) => {
    setPlacing(true);
    try {
      const res = await api.post('/orders/', { items, ...shippingForm });
      setOrderId(res.data.id);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.detail || 'Order place karne mein problem aayi.');
    } finally {
      setPlacing(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setPayStatus('success');
    setTimeout(async () => {
      setShowPayModal(false);
      await finalizeOrder(pendingItems);
    }, 1200);
  };

  useEffect(() => {
    if (orderSuccess && orderId) {
      navigate(`/order-success/${orderId}`);
    }
  }, [orderSuccess, orderId, navigate]);

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingBag size={64} className="empty-icon" />
            <h2>Aapka Cart Khaali Hai</h2>
            <p>Apni pasandida Chaniya Choli add karo.</p>
            <Link to="/" className="btn-luxury">Collection Dekho</Link>
          </div>
        </div>
        <style>{`
          .empty-cart { max-width: 400px; margin: 6rem auto; text-align: center; }
          .empty-icon { opacity: 0.4; margin-bottom: 1rem; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">

        {/* HEADER */}
        <div className="cart-header">
          <Link to="/" className="back-link"><ChevronLeft size={18} />Collection</Link>
          <h1>Boutique Bag</h1>
          <p className="item-count">{cartItems.reduce((s, i) => s + i.quantity, 0)} items</p>
        </div>

        <div className="cart-layout">

          {/* CART ITEMS */}
          <div className="cart-items">

            {/* Shipping progress bar */}
            {!shippingFree ? (
              <div className="shipping-bar">
                <Tag size={14} />
                <span>₹{(SHIPPING_THRESHOLD - totalPrice).toLocaleString()} aur kharido — free shipping milegi!</span>
              </div>
            ) : (
              <div className="shipping-bar free">
                <CheckCircle size={14} />
                <span>Free shipping mil raha hai!</span>
              </div>
            )}

            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div key={item.id} className="cart-item" layout>

                  <Link to={`/product/${item.id}`} className="item-img-wrap">
                    <img src={item.image_url} alt={item.name} className="item-img" />
                  </Link>

                  <div className="item-info">
                    <p className="item-fabric">{item.fabric || 'Designer Silk'}</p>
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-size">Size: <strong>{item.selectedSize || 'M'}</strong></p>

                    <div className="item-bottom">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => decreaseQuantity(item.id)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => increaseQuantity(item.id)}><Plus size={14} /></button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="item-price">
                    ₹{(item.price * item.quantity).toLocaleString()}
                    {item.quantity > 1 && <span className="unit-price">₹{item.price.toLocaleString()} each</span>}
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>

          </div>

          {/* ORDER SUMMARY */}
          <div className="order-summary">
            <h2 className="summary-title">Order Summary</h2>

            {/* DELIVERY DETAILS */}
            <div className="ship-section">
              <h3 className="ship-title"><MapPin size={15} /> Delivery Address</h3>

              <div className="ship-field">
                <User size={14} className="ship-icon" />
                <input
                  name="shipping_name"
                  value={shippingForm.shipping_name}
                  onChange={handleShippingChange}
                  placeholder="Full Name"
                  className={formErrors.shipping_name ? 'err' : ''}
                />
              </div>
              {formErrors.shipping_name && <p className="field-err">{formErrors.shipping_name}</p>}

              <div className="ship-field">
                <Phone size={14} className="ship-icon" />
                <input
                  name="shipping_phone"
                  value={shippingForm.shipping_phone}
                  onChange={handleShippingChange}
                  placeholder="10-digit Mobile Number"
                  maxLength={10}
                  className={formErrors.shipping_phone ? 'err' : ''}
                />
              </div>
              {formErrors.shipping_phone && <p className="field-err">{formErrors.shipping_phone}</p>}

              <div className="ship-field">
                <MapPin size={14} className="ship-icon" />
                <input
                  name="shipping_address"
                  value={shippingForm.shipping_address}
                  onChange={handleShippingChange}
                  placeholder="House No, Street, Area"
                  className={formErrors.shipping_address ? 'err' : ''}
                />
              </div>
              {formErrors.shipping_address && <p className="field-err">{formErrors.shipping_address}</p>}

              <div className="ship-row">
                <div>
                  <input
                    name="shipping_city"
                    value={shippingForm.shipping_city}
                    onChange={handleShippingChange}
                    placeholder="City"
                    className={formErrors.shipping_city ? 'err' : ''}
                  />
                  {formErrors.shipping_city && <p className="field-err">{formErrors.shipping_city}</p>}
                </div>
                <div>
                  <input
                    name="shipping_state"
                    value={shippingForm.shipping_state}
                    onChange={handleShippingChange}
                    placeholder="State"
                    className={formErrors.shipping_state ? 'err' : ''}
                  />
                  {formErrors.shipping_state && <p className="field-err">{formErrors.shipping_state}</p>}
                </div>
              </div>

              <div className="ship-field">
                <input
                  name="shipping_pincode"
                  value={shippingForm.shipping_pincode}
                  onChange={handleShippingChange}
                  placeholder="Pincode"
                  maxLength={6}
                  className={formErrors.shipping_pincode ? 'err' : ''}
                />
              </div>
              {formErrors.shipping_pincode && <p className="field-err">{formErrors.shipping_pincode}</p>}
            </div>

            {/* PAYMENT METHOD */}
            <div className="ship-section">
              <h3 className="ship-title"><Wallet size={15} /> Payment Method</h3>
              <div className="pay-options">
                <label className={`pay-option ${shippingForm.payment_method === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={shippingForm.payment_method === 'cod'}
                    onChange={handleShippingChange}
                  />
                  <Banknote size={16} /> Cash on Delivery
                </label>
                <label className={`pay-option ${shippingForm.payment_method === 'online' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={shippingForm.payment_method === 'online'}
                    onChange={handleShippingChange}
                  />
                  <Wallet size={16} /> Pay Online (UPI/Card)
                </label>
              </div>
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row" style={{ color: '#16a34a' }}>
                  <span>Discount</span>
                  <span>- ₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingFree ? 'Free' : `₹${shipping}`}</span>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon Box */}
            <CouponBox totalPrice={totalPrice} onDiscount={setDiscount} />

            {error && (
              <div className="error-msg">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button className="btn-luxury place-btn" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? (
                <><Loader size={18} className="spin" />Processing...</>
              ) : (
                <><ShoppingBag size={18} />Order Place Karo</>
              )}
            </button>

            {!user && <p className="login-note">Login required for order.</p>}
          </div>

        </div>
      </div>

      <style>{`
        .cart-page { padding: 2rem 0 6rem; background: #0b0f1a; min-height: 100vh; color: #e5e7eb; }
        .cart-header { margin-bottom: 2rem; }
        .back-link { display: inline-flex; align-items: center; color: #9ca3af; text-decoration: none; font-size: 0.9rem; }
        .cart-header h1 { font-size: 2rem; margin-top: 1rem; font-family: 'Playfair Display', serif; }
        .item-count { color: #9ca3af; }
        .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; }
        .cart-item { display: grid; grid-template-columns: 100px 1fr auto; gap: 1rem; padding: 1.5rem 0; border-bottom: 1px solid #1f2937; }
        .item-img-wrap { width: 100px; height: 120px; overflow: hidden; border-radius: 8px; }
        .item-img { width: 100%; height: 100%; object-fit: cover; }
        .item-fabric { font-size: 0.7rem; text-transform: uppercase; color: #a78bfa; font-weight: bold; margin-bottom: 0.5rem; }
        .item-name { font-size: 1.1rem; margin-bottom: 0.5rem; color: #f3f4f6; }
        .item-size { margin-bottom: 1rem; color: #9ca3af; }
        .item-bottom { display: flex; align-items: center; gap: 1rem; }
        .qty-control { display: flex; align-items: center; border: 1px solid #374151; border-radius: 6px; }
        .qty-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #e5e7eb; }
        .qty-num { padding: 0 12px; font-weight: bold; }
        .remove-btn { color: #ef4444; }
        .item-price { font-size: 1.2rem; font-weight: bold; color: #f3f4f6; }
        .unit-price { display: block; font-size: 0.7rem; color: #6b7280; }
        .order-summary { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 1.75rem; height: fit-content; }
        .summary-title { margin-bottom: 1.25rem; color: #f3f4f6; }

        .ship-section { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #1f2937; }
        .ship-title { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #a78bfa; margin-bottom: 0.9rem; }
        .ship-field { display: flex; align-items: center; gap: 8px; background: #0b0f1a; border: 1px solid #374151; border-radius: 10px; padding: 0.6rem 0.75rem; margin-bottom: 0.5rem; }
        .ship-icon { color: #6b7280; flex-shrink: 0; }
        .ship-field input { background: transparent; border: none; outline: none; color: #f3f4f6; width: 100%; font-size: 0.875rem; }
        .ship-field input::placeholder { color: #6b7280; }
        .ship-field.err, .ship-field input.err { border-color: #ef4444; }
        .ship-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; }
        .ship-row input { width: 100%; background: #0b0f1a; border: 1px solid #374151; border-radius: 10px; padding: 0.6rem 0.75rem; color: #f3f4f6; outline: none; font-size: 0.875rem; }
        .ship-row input::placeholder { color: #6b7280; }
        .ship-row input.err { border-color: #ef4444; }
        .field-err { color: #f87171; font-size: 0.72rem; margin: -0.15rem 0 0.5rem 0.25rem; }

        .pay-options { display: flex; flex-direction: column; gap: 0.5rem; }
        .pay-option { display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; border: 1px solid #374151; border-radius: 10px; cursor: pointer; font-size: 0.875rem; color: #d1d5db; transition: all 0.15s; }
        .pay-option input { accent-color: #6B46C1; }
        .pay-option.active { border-color: #6B46C1; background: rgba(107,70,193,0.12); color: #f3f4f6; }

        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #d1d5db; }
        .total-row { font-size: 1.2rem; font-weight: bold; border-top: 1px solid #1f2937; padding-top: 1rem; color: #f3f4f6; }
        .place-btn { width: 100%; margin-top: 1.5rem; background: #6B46C1; color: white; border: none; border-radius: 12px; padding: 0.9rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
        .place-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .shipping-bar { display: flex; align-items: center; gap: 8px; padding: 12px; border-radius: 8px; background: #1f2937; margin-bottom: 1rem; color: #d1d5db; }
        .shipping-bar.free { background: rgba(22,163,74,0.15); color: #4ade80; }
        .error-msg { display: flex; align-items: center; gap: 8px; color: #f87171; margin-top: 1rem; font-size: 0.875rem; }
        .login-note { color: #9ca3af; font-size: 0.8rem; text-align: center; margin-top: 0.75rem; }
        @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .ship-row { grid-template-columns: 1fr; } }

        .pay-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
        .pay-modal { position: relative; background: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 2rem; width: 100%; max-width: 340px; text-align: center; }
        .pay-modal-close { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #9ca3af; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
        .pay-modal-label { color: #a78bfa; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
        .pay-modal-amount { color: #f3f4f6; font-size: 1.8rem; font-weight: 900; margin-bottom: 1.25rem; }
        .pay-qr-wrap { background: white; padding: 12px; border-radius: 14px; display: inline-block; margin-bottom: 1rem; }
        .pay-qr-img { display: block; width: 180px; height: 180px; }
        .pay-modal-hint { display: flex; align-items: center; justify-content: center; gap: 6px; color: #9ca3af; font-size: 0.8rem; margin-bottom: 1rem; }
        .pay-demo-note { background: rgba(245,158,11,0.12); color: #fbbf24; font-size: 0.72rem; padding: 8px 10px; border-radius: 8px; margin-bottom: 1.25rem; }
        .pay-simulate-btn { width: 100%; background: #6B46C1; color: white; border: none; border-radius: 12px; padding: 0.85rem; font-weight: 800; cursor: pointer; font-size: 0.9rem; }
        .pay-success { padding: 1rem 0; }
        .pay-success-icon { color: #4ade80; margin-bottom: 0.75rem; }
        .pay-success-text { color: #f3f4f6; font-size: 1.15rem; font-weight: 800; margin-bottom: 0.25rem; }
        .pay-success-sub { color: #9ca3af; font-size: 0.85rem; }
      `}</style>

      {showPayModal && (
        <div className="pay-modal-backdrop">
          <div className="pay-modal">
            {payStatus === 'waiting' ? (
              <>
                <button
                  className="pay-modal-close"
                  onClick={() => { setShowPayModal(false); setError('Payment cancel kar diya.'); }}
                >
                  <X size={16} />
                </button>
                <p className="pay-modal-label">Scan &amp; Pay</p>
                <h3 className="pay-modal-amount">₹{grandTotal.toLocaleString('en-IN')}</h3>
                <div className="pay-qr-wrap">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      `upi://pay?pa=ladlistore@upi&pn=LadliStore&am=${grandTotal}&cu=INR`
                    )}`}
                    alt="UPI QR Code"
                    className="pay-qr-img"
                  />
                </div>
                <p className="pay-modal-hint">
                  <QrCode size={13} /> Kisi bhi UPI app se scan karo (GPay, PhonePe, Paytm)
                </p>
                <div className="pay-demo-note">
                  Demo Mode: Ye ek simulated payment hai, koi real gateway connected nahi hai.
                </div>
                <button className="pay-simulate-btn" onClick={handleSimulatePaymentSuccess}>
                  Maine Payment Kar Diya ✓
                </button>
              </>
            ) : (
              <div className="pay-success">
                <CheckCircle size={48} className="pay-success-icon" />
                <p className="pay-success-text">Payment Successful!</p>
                <p className="pay-success-sub">Order confirm ho raha hai...</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;
// =====================================================
// CouponBox.jsx  —  drop this inside your Cart.jsx
// =====================================================
// Usage:
//   import CouponBox from '../components/CouponBox';
//   <CouponBox totalPrice={totalPrice} onDiscount={setDiscount} />
// Then: grandTotal = totalPrice - discount + shipping

import React, { useState } from 'react';
import { Tag, CheckCircle, XCircle } from 'lucide-react';

// Add more codes here as you like
const VALID_COUPONS = {
  'LADLI10':  { type: 'percent', value: 10,   label: '10% Off'      },
  'NAVRATRI': { type: 'percent', value: 15,   label: '15% Off'      },
  'WELCOME':  { type: 'flat',    value: 200,  label: '₹200 Off'     },
  'FESTIVE50':{ type: 'flat',    value: 500,  label: '₹500 Off'     },
};

const CouponBox = ({ totalPrice, onDiscount }) => {
  const [code,      setCode]      = useState('');
  const [applied,   setApplied]   = useState(null);   // { label, discount }
  const [error,     setError]     = useState('');
  const [inputCode, setInputCode] = useState('');

  const applyCoupon = () => {
    const trimmed = inputCode.trim().toUpperCase();
    const coupon  = VALID_COUPONS[trimmed];

    if (!coupon) {
      setError('Invalid coupon code. Please try again.');
      setApplied(null);
      onDiscount(0);
      return;
    }

    const discount = coupon.type === 'percent'
      ? Math.round(totalPrice * coupon.value / 100)
      : coupon.value;

    setCode(trimmed);
    setApplied({ label: coupon.label, discount });
    onDiscount(discount);
    setError('');
  };

  const removeCoupon = () => {
    setCode('');
    setApplied(null);
    setInputCode('');
    setError('');
    onDiscount(0);
  };

  return (
    <div className="bg-white rounded-2xl border border-border-color shadow-sm p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={18} className="text-primary" />
        <h3 className="font-bold text-text-main">Promo Code</h3>
      </div>

      {applied ? (
        /* Applied State */
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <div>
              <p className="text-sm font-bold text-green-700">{code} Applied!</p>
              <p className="text-xs text-green-600">{applied.label} — You save ₹{applied.discount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button
            onClick={removeCoupon}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <XCircle size={18} />
          </button>
        </div>
      ) : (
        /* Input State */
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={e => { setInputCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="Enter promo code"
            className="flex-1 px-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main text-sm font-medium
                       focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase placeholder:normal-case placeholder:font-normal"
          />
          <button
            onClick={applyCoupon}
            disabled={!inputCode.trim()}
            className="bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
          <XCircle size={13} /> {error}
        </p>
      )}

      {/* Hint */}
      {!applied && (
        <p className="mt-3 text-xs text-text-muted">
          Try: <span className="font-bold text-primary cursor-pointer" onClick={() => setInputCode('WELCOME')}>WELCOME</span>
          {' '}or{' '}
          <span className="font-bold text-primary cursor-pointer" onClick={() => setInputCode('NAVRATRI')}>NAVRATRI</span>
        </p>
      )}
    </div>
  );
};

export default CouponBox;

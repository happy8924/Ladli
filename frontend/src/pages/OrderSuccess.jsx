import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  MapPin,
  Printer,
  ShoppingBag,
  Clock,
  Phone,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../api/api';
import CheckoutStepper from '../components/CheckoutStepper';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (isMounted) {
          setOrder(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch order details:', err);
          setError('Order details load karne mein problem aayi.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg-main py-8 pb-24">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Stepper showing Step 4 Complete */}
        <div className="print:hidden">
          <CheckoutStepper currentStep={4} />
        </div>

        {/* Celebration Banner */}
        <div className="text-center mb-8 print:hidden">
          <div className="w-20 h-20 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main">
            Order Placed Successfully!
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Thank you for shopping with Ladli. Your order reference is <span className="text-primary font-bold">#{orderId}</span>.
          </p>
        </div>

        {loading ? (
          <div className="bg-bg-card border border-border-color rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <Loader2 size={36} className="text-primary animate-spin mb-3" />
            <p className="font-bold text-text-main">Loading Invoice & Order Details...</p>
          </div>
        ) : error ? (
          <div className="bg-bg-card border border-border-color rounded-3xl p-8 text-center text-red-500">
            <AlertCircle size={36} className="mx-auto mb-2" />
            <p className="font-bold">{error}</p>
            <p className="text-xs text-text-muted mt-2">Aapka order place ho chuka hai. Aap "My Orders" tab mein check kar sakte hain.</p>
          </div>
        ) : order && (
          <div className="bg-bg-card border border-border-color rounded-3xl p-6 sm:p-10 shadow-xl print:shadow-none print:border-none print:p-0">
            
            {/* INVOICE HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border-color mb-6">
              <div>
                <h2 className="text-2xl font-black font-serif text-primary">LADLI BOUTIQUE</h2>
                <p className="text-xs text-text-muted">Authentic Chaniya Choli &amp; Bridal Ethnic Wear</p>
                <p className="text-xs text-text-muted">Surat, Gujarat, India • GSTIN: 24AAACL1234F1Z0</p>
              </div>
              <div className="sm:text-right">
                <span className="inline-block bg-primary/10 text-primary text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-1">
                  OFFICIAL TAX INVOICE
                </span>
                <p className="text-sm font-bold text-text-main">Order ID: #{order.id}</p>
                <p className="text-xs text-text-muted flex items-center sm:justify-end gap-1 mt-0.5">
                  <Clock size={12} /> {new Date(order.created_at || Date.now()).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>

            {/* ORDER STATUS BADGE & DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Shipping info */}
              <div className="bg-bg-main p-4 rounded-2xl border border-border-color">
                <h3 className="font-bold text-xs text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={14} /> Shipping Information
                </h3>
                <p className="font-bold text-text-main text-sm flex items-center gap-1.5">
                  <User size={13} className="text-text-muted" /> {order.shipping_name}
                </p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                </p>
                <p className="text-xs text-text-main font-bold mt-2 flex items-center gap-1.5">
                  <Phone size={13} className="text-text-muted" /> Phone: {order.shipping_phone}
                </p>
              </div>

              {/* Payment & Status info */}
              <div className="bg-bg-main p-4 rounded-2xl border border-border-color flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard size={14} /> Payment &amp; Status
                  </h3>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-muted">Payment Method:</span>
                    <span className="font-bold text-text-main uppercase">{order.payment_method || 'COD'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-muted">Payment Status:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 capitalize">
                      {order.payment_status || 'Success / Pending COD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border-color">
                  <span className="text-text-muted">Order Status:</span>
                  <span className="font-black px-2.5 py-1 rounded-md text-xs capitalize bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>

            </div>

            {/* ITEMIZED PRODUCTS TABLE */}
            <div className="mb-8">
              <h3 className="font-bold text-sm text-text-main mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Purchased Items Breakdown
              </h3>

              <div className="border border-border-color rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-bg-main border-b border-border-color text-text-muted uppercase text-[11px] font-bold">
                    <tr>
                      <th className="p-3 sm:p-4">Item Details</th>
                      <th className="p-3 sm:p-4 text-center">Size</th>
                      <th className="p-3 sm:p-4 text-center">Qty</th>
                      <th className="p-3 sm:p-4 text-right">Price</th>
                      <th className="p-3 sm:p-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {order.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-10 h-12 object-cover rounded-lg bg-bg-main shrink-0 border border-border-color print:hidden"
                              />
                            )}
                            <div>
                              <p className="font-bold text-text-main">{item.product?.name || `Product #${item.product_id}`}</p>
                              <p className="text-[11px] text-text-muted">{item.product?.fabric || 'Custom Silk'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center font-bold text-text-main">{item.selected_size || 'M'}</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-text-main">{item.quantity}</td>
                        <td className="p-3 sm:p-4 text-right text-text-muted">₹{(item.price || item.product?.price || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 sm:p-4 text-right font-bold text-text-main">
                          ₹{((item.price || item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTALS SUMMARY */}
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-72 bg-bg-main p-4 rounded-2xl border border-border-color flex flex-col gap-2 text-xs sm:text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-main">₹{(order.total_price || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping &amp; Taxes</span>
                  <span className="font-bold text-green-600 dark:text-green-400">Included / Free</span>
                </div>
                <div className="flex justify-between text-base font-black text-text-main pt-2 border-t border-border-color">
                  <span>Grand Total</span>
                  <span className="text-primary font-serif">₹{(order.total_price || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* ACTIONS FOOTER (Hidden during print) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-color print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto px-6 py-3 border border-border-color text-text-main rounded-xl font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print / Save PDF Receipt
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to={`/track?order=${order.id}`}
                  className="flex-1 sm:flex-initial px-5 py-3 border border-primary/30 text-primary rounded-xl font-bold text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  <MapPin size={16} /> Track Order
                </Link>
                <Link
                  to="/orders"
                  className="flex-1 sm:flex-initial px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Package size={16} /> My Orders
                </Link>
              </div>
            </div>

          </div>
        )}

        <div className="text-center mt-8 print:hidden">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary font-bold text-sm transition-colors"
          >
            <ShoppingBag size={16} /> Shopping Continue Karo
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
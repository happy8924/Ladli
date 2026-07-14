import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle, Truck, Clock, MapPin } from 'lucide-react';
import api from '../api/api';

const STEPS = [
  { key: 'pending',   label: 'Order Placed',    icon: <Clock     size={18} /> },
  { key: 'confirmed', label: 'Confirmed',        icon: <CheckCircle size={18} /> },
  { key: 'shipped',   label: 'Shipped',          icon: <Truck     size={18} /> },
  { key: 'delivered', label: 'Delivered',        icon: <Package   size={18} /> },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const TrackOrder = () => {
  const [searchParams]    = useSearchParams();
  const defaultId         = searchParams.get('order') || '';

  const [orderId, setOrderId] = useState(defaultId);
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch {
      setError('Order not found. Please check the order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if order id comes from URL
  React.useEffect(() => { if (defaultId) handleTrack(); }, []); // eslint-disable-line

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black font-serif text-text-main mb-3">Track Your Order</h1>
          <p className="text-text-muted">Enter your order ID to see the latest status.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. 42)"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border-color bg-white text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Result */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-border-color shadow-sm p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
                {[
                  { label: 'Order ID',  value: `#${order.id}` },
                  { label: 'Date',      value: new Date(order.created_at).toLocaleDateString('en-IN') },
                  { label: 'Items',     value: order.items?.length || '—' },
                  { label: 'Total',     value: `₹${order.total_amount?.toLocaleString('en-IN')}` },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="font-bold text-text-main">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="bg-white rounded-2xl border border-border-color shadow-sm p-6">
              <h2 className="font-black font-serif text-text-main text-lg mb-6">Shipment Progress</h2>

              {order.status === 'cancelled' ? (
                <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                  <Package size={20} />
                  <p className="font-bold text-sm">This order has been cancelled.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border-color z-0" />

                  <div className="flex flex-col gap-6 relative z-10">
                    {STEPS.map((step, idx) => {
                      const done    = idx <= currentStep;
                      const active  = idx === currentStep;
                      return (
                        <div key={step.key} className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
                            ${done
                              ? active
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-green-500 text-white'
                              : 'bg-white border-2 border-border-color text-text-muted'}`}
                          >
                            {step.icon}
                          </div>
                          <div className="pt-1.5">
                            <p className={`font-bold text-sm ${done ? 'text-text-main' : 'text-text-muted'}`}>
                              {step.label}
                            </p>
                            {active && (
                              <p className="text-xs text-primary font-semibold mt-0.5">Current Status</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            {order.delivery_address && (
              <div className="bg-white rounded-2xl border border-border-color shadow-sm p-5 flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Delivery Address</p>
                  <p className="text-sm text-text-main font-medium">{order.delivery_address}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;

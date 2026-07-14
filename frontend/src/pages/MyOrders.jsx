import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../api/api';

// Status badge config
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: <Clock size={14} />,        bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed:  { label: 'Confirmed',  icon: <CheckCircle size={14} />,  bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped:    { label: 'Shipped',    icon: <Truck size={14} />,        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'Delivered',  icon: <Package size={14} />,      bg: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelled',  icon: <XCircle size={14} />,      bg: 'bg-red-50 text-red-700 border-red-200' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
      {config.icon} {config.label}
    </span>
  );
};

const MyOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data);
      } catch (err) {
        setError('Could not load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main mb-1">My Orders</h1>
          <p className="text-text-muted text-sm">Track and manage your purchases</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-text-main mb-3">No orders yet</h2>
            <p className="text-text-muted mb-8 max-w-sm">
              You haven't placed any orders. Explore our beautiful collection!
            </p>
            <Link
              to="/catalog"
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md"
            >
              Shop Now
            </Link>
          </motion.div>
        )}

        {/* Orders List */}
        <div className="flex flex-col gap-5">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-white rounded-2xl border border-border-color shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border-color bg-bg-main">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Order ID</p>
                    <p className="font-bold text-text-main text-sm">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Date</p>
                    <p className="font-bold text-text-main text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Total</p>
                    <p className="font-bold text-text-main text-sm">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border-color last:border-0">
                    <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.product?.image_url || 'https://via.placeholder.com/80'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-main truncate font-serif">{item.product?.name}</p>
                      <p className="text-sm text-text-muted">
                        Size: {item.selected_size} &nbsp;•&nbsp; Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-text-main font-serif shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="px-6 py-3 bg-bg-main border-t border-border-color flex justify-end">
                <Link
                  to={`/track?order=${order.id}`}
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  Track Order <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MyOrders;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle, Clock, XCircle, Star, Edit3 } from 'lucide-react';
import api from '../api/api';
import ReviewModal from '../components/ReviewModal';

// Status badge config
const STATUS_CONFIG = {
  pending:          { label: 'Pending',          icon: <Clock size={14} />,        bg: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-xs' },
  confirmed:        { label: 'Confirmed',        icon: <CheckCircle size={14} />,  bg: 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold shadow-xs' },
  processing:       { label: 'Processing',       icon: <Package size={14} />,      bg: 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-xs' },
  shipped:          { label: 'Shipped',          icon: <Truck size={14} />,        bg: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-extrabold shadow-xs' },
  out_for_delivery: { label: 'Out For Delivery', icon: <Truck size={14} />,        bg: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-extrabold shadow-xs' },
  delivered:        { label: 'Delivered',        icon: <CheckCircle size={14} />,  bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold shadow-xs' },
  cancelled:        { label: 'Cancelled',        icon: <XCircle size={14} />,      bg: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold shadow-xs' },
  return_requested: { label: 'Return Requested', icon: <Clock size={14} />,        bg: 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold shadow-xs' },
  returned:         { label: 'Returned',         icon: <XCircle size={14} />,      bg: 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold shadow-xs' },
};

const StatusBadge = ({ status }) => {
  const normalizedKey = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIG[normalizedKey] || STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${config.bg}`}>
      {config.icon} <span>{config.label}</span>
    </span>
  );
};

const MyOrders = () => {
  const [orders, setOrders]       = useState([]);
  const [myReviews, setMyReviews] = useState({}); // { [productId]: reviewObj }
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  /* Review Modal State */
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchOrdersAndReviews = async () => {
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/reviews/my').catch(() => ({ data: [] })),
      ]);
      setOrders(ordersRes.data);

      const revMap = {};
      reviewsRes.data.forEach(r => {
        revMap[r.product_id] = r;
      });
      setMyReviews(revMap);
    } catch (err) {
      setError('Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  const handleOpenReview = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = (updatedReview) => {
    setMyReviews(prev => ({
      ...prev,
      [updatedReview.product_id]: updatedReview,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-12 pb-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pt-8 pb-24">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black font-serif text-text-main">My Orders</h1>
            <p className="text-sm text-text-muted mt-1">View and track all your purchases &amp; write reviews for delivered items.</p>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-md hover:bg-[#600000] transition-all"
          >
            <ShoppingBag size={15} /> Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border-color p-12 text-center space-y-4">
            <Package size={56} className="mx-auto text-text-muted opacity-40" />
            <h3 className="text-xl font-bold font-serif text-text-main">No orders found</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              You haven't placed any orders yet. Explore our handcrafted royal traditional collection and place your first order!
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-[#800000] text-white px-6 py-3 rounded-2xl font-extrabold text-xs shadow-md hover:bg-[#600000] transition-all mt-2"
            >
              Start Shopping <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const isDelivered = (order.status || '').toLowerCase() === 'delivered';
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-border-color shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border-color bg-bg-main">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Order ID</p>
                        <p className="font-bold text-text-main text-sm">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Date</p>
                        <p className="font-bold text-text-main text-sm">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Total Amount</p>
                        <p className="font-extrabold text-[#800000] text-sm">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-3 divide-y divide-border-color">
                    {order.items?.map((item) => {
                      const prod = item.product || { id: item.product_id, name: `Product #${item.product_id}`, image_url: '' };
                      const existingReview = myReviews[prod.id];

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-16 h-20 bg-slate-100 rounded-xl border border-border-color overflow-hidden shrink-0">
                              <img
                                src={prod.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=800&auto=format&fit=crop'}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link to={`/product/${prod.id}`} className="font-bold text-text-main hover:text-[#800000] transition-colors truncate font-serif block text-base">
                                {prod.name}
                              </Link>
                              <p className="text-xs text-text-muted mt-0.5">
                                Size: <span className="font-bold text-text-main">{item.selected_size}</span> &nbsp;•&nbsp; Qty: <span className="font-bold text-text-main">{item.quantity}</span>
                              </p>
                              <p className="font-extrabold text-sm text-[#800000] font-serif mt-1">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {/* Action Button: Review if Delivered */}
                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {isDelivered && (
                              existingReview ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(prod)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-xs shadow-xs hover:bg-amber-100 transition-colors"
                                >
                                  <Star size={14} className="fill-amber-500 text-amber-500" />
                                  <span>{existingReview.rating}.0 Reviewed</span>
                                  <Edit3 size={12} className="ml-1 opacity-70" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(prod)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800000] text-white font-extrabold text-xs shadow-sm hover:bg-[#600000] transition-colors"
                                >
                                  <Star size={14} className="fill-white" />
                                  <span>Write Review</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-3 bg-bg-main border-t border-border-color flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-muted">
                      {isDelivered ? '🎉 Order successfully delivered to your doorstep.' : 'Tracking details are live for this order.'}
                    </span>
                    <Link
                      to={`/track?order=${order.id}`}
                      className="text-[#800000] font-extrabold text-xs flex items-center gap-1 hover:underline"
                    >
                      Track Order <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={selectedProduct}
        initialRating={myReviews[selectedProduct?.id]?.rating || 5}
        initialComment={myReviews[selectedProduct?.id]?.comment || ''}
        onSuccess={handleReviewSuccess}
      />

    </div>
  );
};

export default MyOrders;

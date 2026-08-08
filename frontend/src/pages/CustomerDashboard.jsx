import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ShoppingBag, Heart, LogOut, Mail, Phone, MapPin,
  Edit2, Save, Package, Truck, CheckCircle, Clock, XCircle,
  ChevronRight, LayoutDashboard, Settings, ShieldCheck, Star, Edit3
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ReviewModal from '../components/ReviewModal';

/* ── Status badge ── */
const STATUS_CONFIG = {
  pending:          { label: 'Pending',          icon: <Clock size={13} />,       cls: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-xs' },
  confirmed:        { label: 'Confirmed',        icon: <CheckCircle size={13} />, cls: 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold shadow-xs' },
  processing:       { label: 'Processing',       icon: <Package size={13} />,     cls: 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-xs' },
  shipped:          { label: 'Shipped',          icon: <Truck size={13} />,       cls: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-extrabold shadow-xs' },
  out_for_delivery: { label: 'Out For Delivery', icon: <Truck size={13} />,       cls: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-extrabold shadow-xs' },
  delivered:        { label: 'Delivered',        icon: <CheckCircle size={13} />, cls: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold shadow-xs' },
  cancelled:        { label: 'Cancelled',        icon: <XCircle size={13} />,     cls: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold shadow-xs' },
  return_requested: { label: 'Return Requested', icon: <Clock size={13} />,       cls: 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold shadow-xs' },
  returned:         { label: 'Returned',         icon: <XCircle size={13} />,     cls: 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold shadow-xs' },
};

const StatusBadge = ({ status }) => {
  const normalizedKey = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const c = STATUS_CONFIG[normalizedKey] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${c.cls}`}>
      {c.icon} <span>{c.label}</span>
    </span>
  );
};

/* ── Sidebar nav items ── */
const TABS = [
  { key: 'overview', label: 'Overview',  icon: <LayoutDashboard size={18} /> },
  { key: 'orders',   label: 'My Orders', icon: <ShoppingBag size={18} /> },
  { key: 'wishlist', label: 'Wishlist',  icon: <Heart size={18} /> },
  { key: 'profile',  label: 'Profile',   icon: <Settings size={18} /> },
];

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate          = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders]       = useState([]);
  const [myReviews, setMyReviews] = useState({});
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);

  /* Review Modal State */
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    address:  user?.address  || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/reviews/my').catch(() => ({ data: [] })),
        ]);
        setOrders(ordersRes.data);
        const revMap = {};
        reviewsRes.data.forEach(r => { revMap[r.product_id] = r; });
        setMyReviews(revMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
  };

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

  /* ── Stats ── */
  const totalSpent   = orders.reduce((s, o) => s + (o.total_price || o.total_amount || 0), 0);
  const deliveredCnt = orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length;
  const pendingCnt   = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes((o.status || '').toLowerCase())).length;

  const stats = [
    { label: 'Total Orders',  value: orders.length,                            icon: <ShoppingBag size={20} />, color: 'bg-amber-100 text-[#800000] border border-amber-300' },
    { label: 'Delivered',     value: deliveredCnt,                             icon: <CheckCircle size={20} />, color: 'bg-emerald-100 text-emerald-900 border border-emerald-300' },
    { label: 'In Progress',   value: pendingCnt,                               icon: <Truck size={20} />,       color: 'bg-cyan-100 text-cyan-900 border border-cyan-300' },
    { label: 'Total Spent',   value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: <Package size={20} />,     color: 'bg-purple-100 text-purple-900 border border-purple-300' },
  ];

  return (
    <div className="min-h-screen bg-bg-main pt-8 pb-24">
      <div className="container max-w-7xl mx-auto px-4">
        
        {/* Header greeting */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border-color shadow-sm rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#800000] text-white flex items-center justify-center font-bold text-2xl shadow-md font-serif">
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black font-serif text-text-main flex items-center gap-2">
                Welcome back, {user?.username || 'Customer'}! 👋
              </h1>
              <p className="text-text-muted text-xs mt-0.5 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600" /> Verified Royal Customer
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all self-start sm:self-center"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-border-color rounded-3xl p-4 shadow-sm space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#800000] text-white shadow-md'
                      : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              
              {/* ════════ OVERVIEW ════════ */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map((st, i) => (
                      <div key={i} className="bg-white border border-[#EADBC8] shadow-xs rounded-3xl p-5 flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">{st.label}</span>
                          <div className={`p-2.5 rounded-2xl ${st.color} shadow-xs`}>{st.icon}</div>
                        </div>
                        <p className="text-2xl font-black font-serif text-[#800000]">{st.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="bg-white border border-border-color rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-black font-serif text-text-main text-lg">Recent Orders</h2>
                      <button onClick={() => setActiveTab('orders')} className="text-[#800000] font-extrabold text-xs hover:underline flex items-center gap-1">
                        View All ({orders.length}) <ChevronRight size={14} />
                      </button>
                    </div>

                    {loading ? (
                      <div className="py-8 text-center text-text-muted text-xs">Loading orders...</div>
                    ) : orders.length === 0 ? (
                      <div className="py-8 text-center text-text-muted text-xs">No orders placed yet.</div>
                    ) : (
                      <div className="divide-y divide-border-color">
                        {orders.slice(0, 3).map(order => {
                          const isDelivered = (order.status || '').toLowerCase() === 'delivered';
                          return (
                            <div key={order.id} className="py-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-text-main text-sm">Order #{order.id}</span>
                                  <span className="text-xs text-text-muted ml-2">
                                    • {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                                <StatusBadge status={order.status} />
                              </div>

                              <div className="space-y-2">
                                {order.items?.map(item => {
                                  const prod = item.product || { id: item.product_id, name: `Product #${item.product_id}`, image_url: '' };
                                  const existingReview = myReviews[prod.id];
                                  return (
                                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs py-1">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-12 bg-slate-100 rounded-lg border border-border-color overflow-hidden shrink-0">
                                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-semibold text-text-main truncate">{prod.name}</span>
                                      </div>
                                      
                                      {isDelivered && (
                                        existingReview ? (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenReview(prod)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-[11px]"
                                          >
                                            <Star size={12} className="fill-amber-500 text-amber-500" />
                                            <span>{existingReview.rating}.0</span>
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenReview(prod)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#800000] text-white font-extrabold text-[11px] shadow-xs hover:bg-[#600000]"
                                          >
                                            <Star size={12} className="fill-white" />
                                            <span>Rate &amp; Review</span>
                                          </button>
                                        )
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ════════ MY ORDERS TAB ════════ */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h2 className="font-black font-serif text-text-main text-xl mb-1">My Orders &amp; Product Reviews</h2>

                  {loading ? (
                    <div className="flex justify-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#800000]" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-bg-card border border-border-color rounded-2xl p-16 text-center">
                      <ShoppingBag size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
                      <h3 className="font-bold text-text-main mb-2">No orders yet</h3>
                      <p className="text-text-muted text-sm mb-6">Explore our collection and place your first order</p>
                      <Link to="/catalog" className="bg-[#800000] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#600000] transition-colors">
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    orders.map(order => {
                      const isDelivered = (order.status || '').toLowerCase() === 'delivered';
                      return (
                        <div key={order.id} className="bg-white border border-border-color rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border-color bg-bg-main/40">
                            <div className="flex flex-wrap gap-x-6 gap-y-1">
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Order ID</p>
                                <p className="font-bold text-text-main text-sm">#{order.id}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Date</p>
                                <p className="font-bold text-text-main text-sm">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Amount</p>
                                <p className="font-extrabold text-[#800000] text-sm">₹{(order.total_price || order.total_amount)?.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>

                          <div className="px-6 py-4 divide-y divide-border-color">
                            {order.items?.map(item => {
                              const prod = item.product || { id: item.product_id, name: `Product #${item.product_id}`, image_url: '' };
                              const existingReview = myReviews[prod.id];
                              return (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-16 bg-slate-100 rounded-xl border border-border-color overflow-hidden shrink-0">
                                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <Link to={`/product/${prod.id}`} className="font-bold text-text-main text-sm hover:text-[#800000] transition-colors truncate font-serif block">
                                        {prod.name}
                                      </Link>
                                      <p className="text-xs text-text-muted">Size: {item.selected_size} • Qty: {item.quantity}</p>
                                      <p className="font-extrabold text-xs text-[#800000] font-serif mt-0.5">
                                        ₹{((item.price_at_order || item.price) * item.quantity).toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Review button if delivered */}
                                  <div className="shrink-0 self-end sm:self-center">
                                    {isDelivered && (
                                      existingReview ? (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReview(prod)}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-xs hover:bg-amber-100 transition-colors"
                                        >
                                          <Star size={13} className="fill-amber-500 text-amber-500" />
                                          <span>{existingReview.rating}.0 Reviewed</span>
                                          <Edit3 size={11} className="ml-1 opacity-70" />
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReview(prod)}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#800000] text-white font-extrabold text-xs shadow-xs hover:bg-[#600000] transition-colors"
                                        >
                                          <Star size={13} className="fill-white" />
                                          <span>Rate &amp; Review</span>
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="px-6 py-3 bg-bg-main/40 border-t border-border-color flex items-center justify-between">
                            <span className="text-xs text-text-muted font-medium">
                              {isDelivered ? 'Order Delivered' : 'In Transit'}
                            </span>
                            <Link to={`/track?order=${order.id}`} className="text-[#800000] font-extrabold text-xs flex items-center gap-1 hover:underline">
                              Track Order <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* ════════ WISHLIST TAB ════════ */}
              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-black font-serif text-text-main text-xl mb-5">My Wishlist</h2>

                  {(!wishlistItems || wishlistItems.length === 0) ? (
                    <div className="bg-bg-card border border-border-color rounded-2xl p-16 text-center">
                      <Heart size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
                      <h3 className="font-bold text-text-main mb-2">Wishlist is empty</h3>
                      <p className="text-text-muted text-sm mb-6">Save items you love for later</p>
                      <Link to="/catalog" className="bg-[#800000] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#600000] transition-colors">
                        Browse Collection
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlistItems.map(item => (
                        <div key={item.id} className="bg-white border border-border-color rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                          <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover rounded-xl" />
                          <div>
                            <h3 className="font-bold font-serif text-text-main text-sm truncate">{item.name}</h3>
                            <p className="text-xs font-extrabold text-[#800000] mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                          <Link to={`/product/${item.id}`} className="block text-center py-2 bg-[#800000] text-white rounded-xl text-xs font-bold hover:bg-[#600000]">
                            View Item
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ════════ PROFILE TAB ════════ */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="bg-white border border-border-color rounded-3xl p-6 shadow-sm">
                    <h2 className="font-black font-serif text-text-main text-xl mb-4">Account Information</h2>
                    <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profile.username}
                          onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                          disabled={!editing}
                          className="w-full px-4 py-2.5 bg-bg-main border border-border-color rounded-2xl text-xs font-bold text-text-main outline-none disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-2.5 bg-bg-main border border-border-color rounded-2xl text-xs font-bold text-text-muted outline-none"
                        />
                      </div>
                      <div className="pt-2 flex gap-3">
                        {!editing ? (
                          <button type="button" onClick={() => setEditing(true)} className="px-5 py-2 bg-[#800000] text-white rounded-xl text-xs font-bold">
                            Edit Profile
                          </button>
                        ) : (
                          <button type="submit" className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
                            Save Changes
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

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

export default CustomerDashboard;

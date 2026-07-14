import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ShoppingBag, Heart, LogOut, Mail, Phone, MapPin,
  Edit2, Save, Package, Truck, CheckCircle, Clock, XCircle,
  ChevronRight, LayoutDashboard, Settings, ShieldCheck
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

/* ── Status badge ── */
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: <Clock size={13} />,       cls: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle size={13} />, cls: 'bg-blue-900/30 text-blue-400 border-blue-700/40' },
  processing:{ label: 'Processing',icon: <Package size={13} />,     cls: 'bg-indigo-900/30 text-indigo-400 border-indigo-700/40' },
  shipped:   { label: 'Shipped',   icon: <Truck size={13} />,       cls: 'bg-purple-900/30 text-purple-400 border-purple-700/40' },
  delivered: { label: 'Delivered', icon: <CheckCircle size={13} />, cls: 'bg-green-900/30 text-green-400 border-green-700/40' },
  cancelled: { label: 'Cancelled', icon: <XCircle size={13} />,     cls: 'bg-red-900/30 text-red-400 border-red-700/40' },
};
const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.cls}`}>
      {c.icon} {c.label}
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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    address:  user?.address  || '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: connect to api.put('/users/me', profile) when backend route exists
    setEditing(false);
  };

  /* ── Stats ── */
  const totalSpent   = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const deliveredCnt = orders.filter(o => o.status === 'delivered').length;
  const pendingCnt   = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length;

  const stats = [
    { label: 'Total Orders',  value: orders.length,        icon: <ShoppingBag size={20} />, color: 'bg-primary/15 text-primary' },
    { label: 'Delivered',     value: deliveredCnt,         icon: <CheckCircle size={20} />, color: 'bg-green-900/30 text-green-400' },
    { label: 'In Progress',   value: pendingCnt,           icon: <Truck size={20} />,       color: 'bg-yellow-900/30 text-yellow-400' },
    { label: 'Total Spent',   value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: <Package size={20} />, color: 'bg-secondary/15 text-secondary' },
  ];

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-6xl mx-auto px-4">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black uppercase shrink-0 shadow-lg shadow-primary/20">
              {user?.username?.charAt(0) || <User size={26} />}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-serif text-text-main">
                Welcome back, {user?.username || 'Customer'}!
              </h1>
              <p className="text-text-muted text-sm flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={14} className="text-green-400" /> Verified Customer Account
              </p>
            </div>
          </div>
          <Link
            to="/catalog"
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors text-center shrink-0"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1">
            <div className="bg-bg-card border border-border-color rounded-2xl p-3 sticky top-24">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all w-full text-left ${
                      activeTab === tab.key
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {tab.key === 'wishlist' && wishlistItems?.length > 0 && (
                      <span className={`ml-auto text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${activeTab === tab.key ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {wishlistItems.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="border-t border-border-color mt-3 pt-3 hidden lg:block">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-900/20 transition-all w-full"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">

              {/* ════════ OVERVIEW ════════ */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(s => (
                      <div key={s.label} className="bg-bg-card border border-border-color rounded-2xl p-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                          {s.icon}
                        </div>
                        <p className="text-2xl font-black font-serif text-text-main">{s.value}</p>
                        <p className="text-xs text-text-muted font-medium mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-bg-card border border-border-color rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-black font-serif text-text-main text-lg">Recent Orders</h2>
                      <button onClick={() => setActiveTab('orders')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-10">
                        <ShoppingBag size={36} className="text-text-muted mx-auto mb-3 opacity-40" />
                        <p className="text-text-muted text-sm mb-4">No orders placed yet</p>
                        <Link to="/catalog" className="text-primary font-bold text-sm hover:underline">Start Shopping →</Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {orders.slice(0, 3).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-color">
                            <div>
                              <p className="font-bold text-text-main text-sm">Order #{order.id}</p>
                              <p className="text-xs text-text-muted mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' • '}₹{order.total_price?.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Links */}
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/faq" className="bg-bg-card border border-border-color rounded-2xl p-5 hover:border-primary/40 transition-all">
                      <p className="font-bold text-text-main text-sm mb-1">Need Help?</p>
                      <p className="text-xs text-text-muted">Visit our FAQ section</p>
                    </Link>
                    <Link to="/track" className="bg-bg-card border border-border-color rounded-2xl p-5 hover:border-primary/40 transition-all">
                      <p className="font-bold text-text-main text-sm mb-1">Track Order</p>
                      <p className="text-xs text-text-muted">Check delivery status</p>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* ════════ ORDERS ════════ */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <h2 className="font-black font-serif text-text-main text-xl mb-1">My Orders</h2>

                  {loading ? (
                    <div className="flex justify-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-bg-card border border-border-color rounded-2xl p-16 text-center">
                      <ShoppingBag size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
                      <h3 className="font-bold text-text-main mb-2">No orders yet</h3>
                      <p className="text-text-muted text-sm mb-6">Explore our collection and place your first order</p>
                      <Link to="/catalog" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors">
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-bg-card border border-border-color rounded-2xl overflow-hidden">
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
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total</p>
                              <p className="font-bold text-text-main text-sm">₹{order.total_price?.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>

                        <div className="px-6 py-4">
                          {order.items?.map(item => (
                            <div key={item.id} className="flex items-center gap-4 py-2.5 border-b border-border-color last:border-0">
                              <div className="w-12 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-text-main text-sm truncate">{item.product?.name}</p>
                                <p className="text-xs text-text-muted">Size: {item.selected_size} • Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-text-main text-sm shrink-0">
                                ₹{(item.price_at_order * item.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="px-6 py-3 bg-bg-main/40 border-t border-border-color flex justify-end">
                          <Link to={`/track?order=${order.id}`} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                            Track Order <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* ════════ WISHLIST ════════ */}
              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-black font-serif text-text-main text-xl mb-5">My Wishlist</h2>

                  {(!wishlistItems || wishlistItems.length === 0) ? (
                    <div className="bg-bg-card border border-border-color rounded-2xl p-16 text-center">
                      <Heart size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
                      <h3 className="font-bold text-text-main mb-2">Wishlist is empty</h3>
                      <p className="text-text-muted text-sm mb-6">Save items you love for later</p>
                      <Link to="/catalog" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors">
                        Browse Collection
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {wishlistItems.map(item => (
                        <Link key={item.id} to={`/product/${item.id}`} className="bg-bg-card border border-border-color rounded-xl overflow-hidden hover:border-primary/40 transition-all">
                          <div className="aspect-[3/4] bg-slate-800">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-bold text-text-main truncate">{item.name}</p>
                            <p className="text-primary font-bold text-sm mt-1">₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ════════ PROFILE ════════ */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">

                  <div className="bg-bg-card border border-border-color rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-black font-serif text-text-main text-xl">Profile Settings</h2>
                      <button
                        onClick={() => setEditing(e => !e)}
                        className="p-2.5 rounded-xl border border-border-color hover:bg-white/5 transition-colors text-text-muted"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>

                    {editing ? (
                      <form onSubmit={handleSave} className="flex flex-col gap-4">
                        {[
                          { key: 'username', label: 'Username', icon: <User size={15} />, type: 'text' },
                          { key: 'email',    label: 'Email',    icon: <Mail size={15} />, type: 'email' },
                          { key: 'phone',    label: 'Phone',    icon: <Phone size={15} />, type: 'tel' },
                          { key: 'address',  label: 'Address',  icon: <MapPin size={15} />, type: 'text' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">{f.label}</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">{f.icon}</span>
                              <input
                                type={f.type}
                                value={profile[f.key]}
                                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main text-sm focus:border-primary outline-none"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-3 mt-2">
                          <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
                            <Save size={16} /> Save Changes
                          </button>
                          <button type="button" onClick={() => setEditing(false)} className="px-6 py-3 rounded-xl border border-border-color text-text-muted font-bold hover:bg-white/5 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col divide-y divide-border-color">
                        {[
                          { label: 'Username', value: profile.username || '—', icon: <User size={16} /> },
                          { label: 'Email',    value: profile.email    || '—', icon: <Mail size={16} /> },
                          { label: 'Phone',    value: profile.phone    || 'Not added', icon: <Phone size={16} /> },
                          { label: 'Address',  value: profile.address  || 'Not added', icon: <MapPin size={16} /> },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-4 py-3.5">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              {item.icon}
                            </div>
                            <div>
                              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{item.label}</p>
                              <p className="text-text-main font-medium text-sm mt-0.5">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-red-700/40 bg-red-900/20 text-red-400 font-bold hover:bg-red-900/30 transition-colors lg:hidden"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

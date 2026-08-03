import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  Users, ShoppingBag, DollarSign, Package, TrendingUp,
  Eye, Plus, Footprints, BarChart3, RefreshCw, AlertTriangle,
  ArrowUpRight, Clock, ShieldCheck, Sparkles, CheckCircle2,
  ChevronRight, Bell, FileText, XCircle, AlertCircle, ArrowRight,
  Info, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  pending:    'bg-amber-500/10 text-amber-300 border-amber-500/30',
  processing: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  packaging:  'bg-purple-500/10 text-purple-300 border-purple-500/30',
  shipped:    'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  delivered:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  cancelled:  'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

const PIE_COLORS = ['#800000', '#C9A227', '#059669', '#2563EB', '#7C3AED'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_sales: 0, order_count: 0, product_count: 0, user_count: 0 });
  const [analytics, setAnalytics] = useState({
    total_visitors: 0, sales_graph: [], monthly_revenue: [], top_products: [], top_categories: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const isFirstLoad = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    else setRefreshing(true);

    const [statsRes, ordersRes, analyticsRes, productsRes] = await Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/orders/all'),
      api.get('/admin/analytics'),
      api.get('/products/'),
    ]);

    const newErrors = [];

    if (statsRes.status === 'fulfilled') {
      setStats(statsRes.value.data);
    } else {
      newErrors.push('Stats payload could not be loaded');
    }

    if (ordersRes.status === 'fulfilled') {
      const orders = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
      setRecentOrders(orders.slice(0, 6));
    } else {
      newErrors.push('Recent orders payload failed');
    }

    if (analyticsRes.status === 'fulfilled') {
      setAnalytics(analyticsRes.value.data);
    } else {
      newErrors.push('Analytics charts payload failed');
    }

    if (productsRes.status === 'fulfilled') {
      const prods = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
      const lowStock = prods.filter(p => p.stock < 5);
      setLowStockProducts(lowStock);
    }

    setErrors(newErrors);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
    isFirstLoad.current = false;
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchDashboardData();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboardData]);

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;
  const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  // Notifications calculation
  const pendingOrdersCount = recentOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const notificationsList = [
    ...(lowStockProducts.length > 0 ? [{ id: 1, type: 'warning', title: 'Low Stock Alert', msg: `${lowStockProducts.length} items have inventory < 5 units. Please restock soon.`, link: '/admin/products', action: 'Restock Now' }] : []),
    ...(pendingOrdersCount > 0 ? [{ id: 2, type: 'info', title: 'Pending Fulfillment', msg: `${pendingOrdersCount} new customer orders waiting for processing and shipment.`, link: '/admin/orders', action: 'Manage Orders' }] : []),
    { id: 3, type: 'success', title: 'Store System Operational', msg: 'Database & live analytics sync running smoothly with zero latency.', action: 'Active' }
  ];

  const statCards = [
    { label: 'Total Revenue',    value: formatPrice(stats.total_sales), icon: <DollarSign size={22} className="text-[#C9A227]" />, sub: 'Lifetime sales earnings' },
    { label: 'Total Orders',     value: stats.order_count,              icon: <ShoppingBag size={22} className="text-[#C9A227]" />, sub: 'Processed orders count' },
    { label: 'Catalog Products', value: stats.product_count,            icon: <Package size={22} className="text-[#C9A227]" />,     sub: 'Active store listings' },
    { label: 'Registered Users', value: stats.user_count,               icon: <Users size={22} className="text-[#C9A227]" />,       sub: 'Customer accounts' },
    { label: 'Store Visitors',   value: analytics.total_visitors,       icon: <Footprints size={22} className="text-[#C9A227]" />,  sub: 'Tracked site visits' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-[#800000] border-t-[#C9A227] animate-spin shadow-lg" />
        <p className="text-slate-300 font-bold text-sm tracking-wide">Loading Executive Admin Dashboard...</p>
      </div>
    );
  }

  const chartTooltipStyle = {
    background: '#3B0000',
    border: '1px solid #C9A227',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.8rem',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Top Banner & Quick Controls */}
      <div className="relative bg-gradient-to-r from-[#4A0000] via-[#6B0000] to-[#800000] border border-[#C9A227]/40 rounded-3xl p-6 md:p-8 shadow-2xl z-20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <CrownIcon /> Official Admin Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-serif text-white tracking-tight flex items-center gap-3">
              Store Control Center <Sparkles size={24} className="text-[#C9A227]" />
            </h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl">
              Welcome, <strong className="text-[#C9A227] font-bold">{user?.username || 'Administrator'}</strong>! Live revenue tracking, low-stock alerts, sales analytics &amp; recent order fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap relative z-30">
            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 border border-[#C9A227]/50 text-white hover:bg-white/20 transition-all font-bold text-xs shadow-lg"
                title="View Notifications"
              >
                <Bell size={18} className="text-[#C9A227] animate-pulse" />
                <span>Notifications</span>
                {notificationsList.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[#C9A227] text-[#4A0000] text-[11px] font-black rounded-full shadow-md">
                    {notificationsList.length}
                  </span>
                )}
              </button>

              {/* Enhanced Notifications Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-88 sm:w-96 bg-[#2A0000] border-2 border-[#C9A227] rounded-3xl shadow-2xl p-5 z-50 text-xs space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#C9A227]/30">
                    <span className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                      <Bell size={16} className="text-[#C9A227]" /> System Alerts ({notificationsList.length})
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-6 h-6 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {notificationsList.map(n => (
                      <div
                        key={n.id}
                        className={`p-3.5 rounded-2xl border ${
                          n.type === 'warning'
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                            : n.type === 'info'
                            ? 'bg-blue-950/60 border-blue-500/50 text-blue-200'
                            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-xs text-[#C9A227] flex items-center gap-1.5">
                            {n.type === 'warning' && <AlertTriangle size={14} className="text-amber-400" />}
                            {n.type === 'info' && <Info size={14} className="text-blue-400" />}
                            {n.type === 'success' && <CheckCircle size={14} className="text-emerald-400" />}
                            {n.title}
                          </p>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => setShowNotifications(false)}
                              className="text-[10px] font-black text-[#C9A227] bg-[#C9A227]/20 px-2 py-0.5 rounded-md hover:bg-[#C9A227] hover:text-[#4A0000] transition-colors"
                            >
                              {n.action}
                            </Link>
                          )}
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">{n.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sync Button */}
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-[#C9A227]/40 text-white px-4 py-3 rounded-2xl font-bold text-xs transition-all disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#C9A227]' : 'text-[#C9A227]'} />
              {refreshing ? 'Syncing...' : 'Sync Data'}
            </button>

            {/* Quick Action: Add Product */}
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#D4AF37] text-[#4A0000] px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus size={16} /> Add Product
            </Link>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#C9A227]" /> Last Synced: {lastUpdated.toLocaleTimeString('en-IN')}
          </span>
          <span className="text-slate-400">Live store tracking active</span>
        </div>
      )}

      {/* ── PROMINENT SYSTEM NOTIFICATIONS CARD ON DASHBOARD PAGE ── */}
      <div className="bg-[#4A0000] border-2 border-[#C9A227]/60 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227]">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                Live Notifications &amp; System Alerts
              </h2>
              <p className="text-slate-300 text-xs">Real-time status updates requiring store admin action.</p>
            </div>
          </div>
          <span className="text-xs font-black text-[#4A0000] bg-[#C9A227] px-3 py-1 rounded-full shadow">
            {notificationsList.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notificationsList.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border shadow-lg flex flex-col justify-between ${
                item.type === 'warning'
                  ? 'bg-[#2E0000] border-amber-500/50 text-amber-200'
                  : item.type === 'info'
                  ? 'bg-[#2E0000] border-blue-500/50 text-blue-200'
                  : 'bg-[#2E0000] border-emerald-500/50 text-emerald-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-[#C9A227] flex items-center gap-1.5">
                    {item.type === 'warning' && <AlertTriangle size={15} className="text-amber-400" />}
                    {item.type === 'info' && <Info size={15} className="text-blue-400" />}
                    {item.type === 'success' && <CheckCircle size={15} className="text-emerald-400" />}
                    {item.title}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{item.msg}</p>
              </div>

              {item.link && (
                <Link
                  to={item.link}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[#4A0000] bg-[#C9A227] hover:bg-[#D4AF37] px-3.5 py-1.5 rounded-xl transition-all self-start shadow"
                >
                  {item.action} <ArrowRight size={13} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 1. DASHBOARD CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-gradient-to-b from-[#4A0000] to-[#2E0000] border border-[#C9A227]/40 rounded-3xl p-5 relative overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-black/40 border border-[#C9A227]/30 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <ArrowUpRight size={18} className="text-[#C9A227] opacity-60 group-hover:opacity-100" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black font-serif text-white mb-1 tracking-tight">
              {card.value}
            </h3>
            <p className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">{card.label}</p>
            <p className="text-[10px] text-slate-300 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 2. QUICK ACTIONS PANEL ── */}
      <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#C9A227]/20">
          <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#C9A227]" /> Quick Operations Panel
          </h2>
          <span className="text-[11px] font-bold text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/30">
            Admin Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="group bg-[#2E0000] border border-[#C9A227]/30 hover:border-[#C9A227] rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#800000] border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs group-hover:text-[#C9A227] transition-colors">Add New Product</h3>
              <p className="text-[10px] text-slate-300">Create new boutique listing</p>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="group bg-[#2E0000] border border-[#C9A227]/30 hover:border-[#C9A227] rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#800000] border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs group-hover:text-[#C9A227] transition-colors">Manage Inventory</h3>
              <p className="text-[10px] text-slate-300">Update stock, prices &amp; colors</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group bg-[#2E0000] border border-[#C9A227]/30 hover:border-[#C9A227] rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#800000] border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs group-hover:text-[#C9A227] transition-colors">Order Fulfillment</h3>
              <p className="text-[10px] text-slate-300">Process customer orders</p>
            </div>
          </Link>

          <Link
            to="/"
            className="group bg-[#2E0000] border border-[#C9A227]/30 hover:border-[#C9A227] rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#800000] border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs group-hover:text-[#C9A227] transition-colors">Live Storefront</h3>
              <p className="text-[10px] text-slate-300">Preview customer view</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 3. LOW STOCK PRODUCTS WARNING ── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#4A0000] border border-amber-500/50 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle size={18} /> Low Stock Warning ({lowStockProducts.length} items needing restock)
            </div>
            <Link to="/admin/products" className="text-xs text-[#C9A227] font-bold hover:underline flex items-center gap-1">
              View All Products <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="bg-[#2E0000] border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-white text-xs truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-300">Stock: <strong className="text-red-400 font-bold">{p.stock} remaining</strong></p>
                </div>
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="px-3 py-1.5 bg-[#C9A227] text-[#4A0000] rounded-xl text-[11px] font-black hover:bg-[#D4AF37] shrink-0 shadow-md"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. ANALYTICS CHARTS GRID (Revenue Chart & Monthly Sales Chart) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Chart (14-Day Sales Revenue) */}
        <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#C9A227]/20">
            <div>
              <h2 className="text-lg font-black font-serif text-white">14-Day Revenue Chart</h2>
              <p className="text-slate-300 text-xs">Daily sales trend analysis</p>
            </div>
            <TrendingUp size={20} className="text-[#C9A227]" />
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={analytics.sales_graph}>
              <defs>
                <linearGradient id="maroonGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A227" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#800000" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#600000" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#E2E8F0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#E2E8F0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={3} fill="url(#maroonGoldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#C9A227]/20">
            <div>
              <h2 className="text-lg font-black font-serif text-white">Monthly Sales Chart</h2>
              <p className="text-slate-300 text-xs">Monthly breakdown over the last 6 months</p>
            </div>
            <BarChart3 size={20} className="text-[#C9A227]" />
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={analytics.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#600000" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#E2E8F0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#E2E8F0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Sales Revenue']} />
              <Bar dataKey="revenue" fill="#C9A227" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── 5. RECENT ORDERS TABLE ── */}
      <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#C9A227]/20">
          <div>
            <h2 className="text-xl font-black font-serif text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#C9A227]" /> Recent Customer Orders
            </h2>
            <p className="text-slate-300 text-xs mt-0.5">Latest order transactions placed on the boutique store.</p>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-xs text-[#C9A227] font-bold hover:underline self-start sm:self-auto"
          >
            View Order Management <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-300">
            <ShoppingBag size={40} className="mx-auto mb-2 opacity-30 text-[#C9A227]" />
            <p className="font-bold text-white text-sm">No recent orders recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#C9A227]/20 text-[#C9A227] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#600000]">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-white font-mono">
                      #{order.order_number || order.id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-100">
                      {order.full_name || order.shipping_name || `User #${order.user_id}`}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#C9A227]">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${STATUS_COLORS[order.status?.toLowerCase()] || STATUS_COLORS.pending}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to="/admin/orders"
                        className="px-3 py-1.5 bg-[#800000] hover:bg-[#600000] border border-[#C9A227]/40 text-[#C9A227] rounded-xl font-bold text-[11px] transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Products & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6">
          <h2 className="text-lg font-black font-serif text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[#C9A227]" /> Best-Selling Boutique Products
          </h2>
          {analytics.top_products.length === 0 ? (
            <p className="text-slate-300 text-xs py-10 text-center">No product sales recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {analytics.top_products.map((p, i) => {
                const max = analytics.top_products[0].revenue || 1;
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-bold truncate">{i + 1}. {p.name}</span>
                      <span className="text-[#C9A227] font-bold shrink-0">{formatPrice(p.revenue)}</span>
                    </div>
                    <div className="h-2 bg-[#2E0000] rounded-full overflow-hidden border border-[#C9A227]/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#800000] via-[#A87B1C] to-[#C9A227]"
                        style={{ width: `${(p.revenue / max) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-300">{p.quantity_sold} units sold</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6">
          <h2 className="text-lg font-black font-serif text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#C9A227]" /> Category Sales Distribution
          </h2>
          {analytics.top_categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <BarChart3 size={32} className="opacity-30 mb-2 text-[#C9A227]" />
              <p className="text-xs">No category distribution recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.top_categories}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {analytics.top_categories.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Legend formatter={(value) => <span style={{ color: '#E2E8F0', fontSize: '0.75rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

    </div>
  );
};

/* Crown Helper Icon */
const CrownIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
  </svg>
);

export default AdminDashboard;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  Users, ShoppingBag, DollarSign, Package, TrendingUp,
  Eye, Plus, Footprints, BarChart3, RefreshCw, AlertTriangle,
  ArrowUpRight, Clock, ShieldCheck, Sparkles, CheckCircle2,
  ChevronRight, Bell, FileText, XCircle, AlertCircle, ArrowRight,
  Info, CheckCircle, Mail, Phone, Crown, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  pending:          'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
  confirmed:        'bg-blue-100 text-blue-900 border-blue-300 font-extrabold',
  processing:       'bg-purple-100 text-purple-900 border-purple-300 font-extrabold',
  packaging:        'bg-purple-100 text-purple-900 border-purple-300 font-extrabold',
  shipped:          'bg-indigo-100 text-indigo-900 border-indigo-300 font-extrabold',
  out_for_delivery: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-extrabold',
  delivered:        'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold',
  cancelled:        'bg-rose-100 text-rose-900 border-rose-300 font-extrabold',
};

const PIE_COLORS = ['#800000', '#C9A227', '#059669', '#2563EB', '#7C3AED'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_sales: 0, order_count: 0, product_count: 0, user_count: 0 });
  const [analytics, setAnalytics] = useState({
    total_visitors: 0, sales_graph: [], monthly_revenue: [], top_products: [], top_categories: []
  });
  const [recentOrders, setRecentOrders]       = useState([]);
  const [recentUsers, setRecentUsers]         = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [errors, setErrors]                   = useState([]);
  const [lastUpdated, setLastUpdated]         = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const isFirstLoad = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    else setRefreshing(true);

    const [statsRes, ordersRes, analyticsRes, productsRes, usersRes] = await Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/orders/all'),
      api.get('/admin/analytics'),
      api.get('/products/'),
      api.get('/admin/users'),
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

    if (usersRes.status === 'fulfilled') {
      const usersList = Array.isArray(usersRes.value.data) ? usersRes.value.data : [];
      setRecentUsers(usersList.slice(0, 5));
      if (usersList.length > 0 && !statsRes.value?.data?.user_count) {
        setStats(prev => ({ ...prev, user_count: usersList.length }));
      }
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
    { id: 3, type: 'success', title: 'Store System Operational', msg: `Database synced. ${stats.user_count || recentUsers.length} registered customer accounts active.`, action: 'Active' }
  ];

  const statCards = [
    { label: 'Total Revenue',    value: formatPrice(stats.total_sales), icon: <DollarSign size={22} className="text-[#C9A227]" />, sub: 'Lifetime sales earnings', link: '/admin/orders' },
    { label: 'Total Orders',     value: stats.order_count,              icon: <ShoppingBag size={22} className="text-[#C9A227]" />, sub: 'Processed orders count', link: '/admin/orders' },
    { label: 'Catalog Products', value: stats.product_count,            icon: <Package size={22} className="text-[#C9A227]" />,     sub: 'Active store listings', link: '/admin/products' },
    { label: 'Registered Users', value: stats.user_count || recentUsers.length, icon: <Users size={22} className="text-[#C9A227]" />, sub: 'Registered customer accounts', link: '/admin/users' },
    { label: 'Store Visitors',   value: analytics.total_visitors,       icon: <Footprints size={22} className="text-[#C9A227]" />,  sub: 'Tracked site visits', link: '#' },
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
                <Crown size={14} /> Official Admin Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-serif text-white tracking-tight flex items-center gap-3">
              Store Control Center <Sparkles size={24} className="text-[#C9A227]" />
            </h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl">
              Welcome, <strong className="text-[#C9A227] font-bold">{user?.username || 'Administrator'}</strong>! Live revenue tracking, customer registrations ({stats.user_count || recentUsers.length} Users), low-stock alerts &amp; analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Home Page Button */}
            <Link
              to="/"
              className="flex items-center gap-2 bg-[#2A0000] hover:bg-[#3B0000] border border-[#C9A227]/50 text-white px-4 py-3 rounded-2xl font-bold text-xs transition-all shadow-md"
              title="Go to Home Page"
            >
              <Home size={16} className="text-[#C9A227]" />
              <span>Home Page</span>
            </Link>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 bg-[#2A0000] hover:bg-[#3B0000] border border-[#C9A227]/50 text-white px-4 py-3 rounded-2xl font-bold text-xs transition-all shadow-md"
                title="View Notifications"
              >
                <Bell size={18} className="text-[#C9A227] animate-pulse" />
                <span>Alerts</span>
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
          <span className="text-slate-400">Live store tracking active • Registered Users: {stats.user_count || recentUsers.length}</span>
        </div>
      )}

      {/* ── 1. DASHBOARD STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-gradient-to-b from-[#4A0000] to-[#2E0000] border border-[#C9A227]/40 rounded-3xl p-5 relative overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] group block"
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
          </Link>
        ))}
      </div>

      {/* ── 2. ANALYTICS CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend AreaChart */}
        <div className="lg:col-span-2 bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-[#C9A227]" />
              <div>
                <h2 className="text-lg font-black font-serif text-white">Revenue Trend &amp; Sales Analytics</h2>
                <p className="text-slate-300 text-xs">Live sales performance graph</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/30 uppercase tracking-wider">
              Real-time
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {analytics.sales_graph && analytics.sales_graph.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.sales_graph}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A227" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#800000" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#EADBC8" fontSize={11} />
                  <YAxis stroke="#EADBC8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']} />
                  <Area type="monotone" dataKey="sales" stroke="#C9A227" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <BarChart3 size={32} className="text-[#C9A227] mb-2 opacity-50" />
                No revenue trend data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown PieChart */}
        <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-[#C9A227]" />
              <div>
                <h2 className="text-lg font-black font-serif text-white">Sales By Category</h2>
                <p className="text-slate-300 text-xs">Product category distribution</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {analytics.top_categories && analytics.top_categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.top_categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {analytics.top_categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#EADBC8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                <PieChart size={32} className="text-[#C9A227] mb-2 opacity-50" />
                No category distribution data available yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── 3. REGISTERED CUSTOMERS & USERS SUITE ── */}
      <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black font-serif text-white flex items-center gap-2">
                Registered Customer Accounts ({stats.user_count || recentUsers.length})
              </h2>
              <p className="text-slate-300 text-xs">Recent customer signups &amp; registered store accounts.</p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-black text-[#4A0000] bg-[#C9A227] hover:bg-[#D4AF37] px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1"
          >
            View All Users <ChevronRight size={14} />
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading registered customer accounts...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUsers.map(u => (
              <div key={u.id} className="bg-[#2E0000] border border-[#C9A227]/30 rounded-2xl p-4 flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-full bg-[#800000] text-amber-300 font-black flex items-center justify-center text-sm border border-[#C9A227]/50 shrink-0">
                  {(u.username || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-extrabold text-white text-xs truncate">{u.username}</p>
                    <span className="text-[10px] font-black uppercase text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded border border-[#C9A227]/30">
                      {u.role || 'User'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5 flex items-center gap-1">
                    <Mail size={11} className="text-[#C9A227]" /> {u.email}
                  </p>
                  {u.phone && (
                    <p className="text-[10px] text-emerald-400 truncate mt-0.5 flex items-center gap-1">
                      <Phone size={10} /> {u.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. QUICK OPERATIONS PANEL ── */}
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
              <p className="text-[10px] text-slate-300">Process shipping &amp; delivery</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group bg-[#2E0000] border border-[#C9A227]/30 hover:border-[#C9A227] rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#800000] border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs group-hover:text-[#C9A227] transition-colors">Registered Users</h3>
              <p className="text-[10px] text-slate-300">View registered customer accounts ({stats.user_count || recentUsers.length})</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 5. RECENT ORDERS TABLE ── */}
      <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#C9A227]" />
            <h2 className="text-lg font-black font-serif text-white">Recent Customer Orders</h2>
          </div>
          <Link to="/admin/orders" className="text-xs font-black text-[#C9A227] hover:underline flex items-center gap-1">
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#C9A227]/30 bg-[#2E0000]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1F0000] text-[#C9A227] font-bold uppercase text-[10px] tracking-wider border-b border-[#C9A227]/30">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A227]/20 text-slate-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No orders placed yet.</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">#{order.id}</td>
                    <td className="px-6 py-4 text-slate-300">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 font-semibold text-white">{order.shipping_name || `User #${order.user_id}`}</td>
                    <td className="px-6 py-4 font-bold text-[#C9A227]">{formatPrice(order.total_price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase border ${STATUS_COLORS[order.status] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/admin/orders" className="text-xs font-bold text-[#C9A227] hover:underline">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
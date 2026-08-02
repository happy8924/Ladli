import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  Users, ShoppingBag, DollarSign, Package, TrendingUp,
  Eye, Plus, Footprints, BarChart3, RefreshCw, AlertTriangle,
  ArrowUpRight, Clock, ShieldCheck, Sparkles, CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  pending:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  packaging:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const PIE_COLORS = ['#991B1B', '#D97706', '#059669', '#2563EB', '#7C3AED'];

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
      setRecentOrders(ordersRes.value.data.slice(0, 5));
    } else {
      newErrors.push('Recent orders payload failed');
    }

    if (analyticsRes.status === 'fulfilled') {
      setAnalytics(analyticsRes.value.data);
    } else {
      newErrors.push('Analytics charts payload failed');
    }

    if (productsRes.status === 'fulfilled') {
      const lowStock = productsRes.value.data.filter(p => p.stock < 5);
      setLowStockProducts(lowStock);
    }

    setErrors(newErrors);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
    isFirstLoad.current = false;
  }, []);

  // Smart window-focus auto-refresh instead of wasteful 30s background polling
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

  const statCards = [
    { label: 'Total Revenue',  value: formatPrice(stats.total_sales),  icon: <DollarSign size={22} />, color: 'from-rose-900 to-red-950 border-rose-800/40 text-rose-300' },
    { label: 'Total Orders',   value: stats.order_count,               icon: <ShoppingBag size={22} />, color: 'from-amber-900 to-amber-950 border-amber-800/40 text-amber-300' },
    { label: 'Catalog Items',  value: stats.product_count,             icon: <Package size={22} />,     color: 'from-emerald-900 to-emerald-950 border-emerald-800/40 text-emerald-300' },
    { label: 'Registered Users', value: stats.user_count,              icon: <Users size={22} />,       color: 'from-blue-900 to-blue-950 border-blue-800/40 text-blue-300' },
    { label: 'Store Visitors', value: analytics.total_visitors,        icon: <Footprints size={22} />,  color: 'from-purple-900 to-purple-950 border-purple-800/40 text-purple-300' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-900 border-t-amber-400 animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Loading Executive Dashboard...</p>
      </div>
    );
  }

  const chartTooltipStyle = {
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: '#F9FAFB',
    fontSize: '0.8rem',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black font-serif text-white tracking-tight">
              Executive Store Metrics
            </h1>
            <Sparkles size={20} className="text-amber-400" />
          </div>
          <p className="text-slate-400 text-sm">
            Welcome back, <strong className="text-white font-bold">{user?.username}</strong>! Live revenue, inventory &amp; order performance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-400' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Data'}
          </button>

          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-900 to-red-800 hover:from-rose-800 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-rose-950/50"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {lastUpdated && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" /> Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </span>
          <span className="text-slate-500">Auto-syncs on window focus</span>
        </div>
      )}

      {/* Errors notification if present */}
      {errors.length > 0 && (
        <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/60 text-red-300 rounded-2xl p-4 text-xs">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="font-bold mb-1">Part of the data payload failed to load:</p>
            <p>{errors.join(', ')}. Check connection or retry sync.</p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border rounded-3xl p-5 relative overflow-hidden shadow-lg transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-black/30 backdrop-blur-md">
                {card.icon}
              </div>
              <ArrowUpRight size={18} className="opacity-40" />
            </div>
            <h3 className="text-2xl font-black font-serif text-white mb-1 tracking-tight">{card.value}</h3>
            <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert Section (if any stock < 5) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle size={18} /> Low Stock Warning ({lowStockProducts.length} items needing restock)
            </div>
            <Link to="/admin/products" className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1">
              View All Products <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-white text-xs truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">Stock: <strong className="text-red-400">{p.stock} remaining</strong></p>
                </div>
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-bold hover:bg-amber-500/20 shrink-0"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Graph (14 Days) */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black font-serif text-white">14-Day Sales Revenue</h2>
              <p className="text-slate-400 text-xs">Daily transaction volume &amp; trend</p>
            </div>
            <TrendingUp size={18} className="text-rose-400" />
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={analytics.sales_graph}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#991B1B" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#991B1B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#E11D48" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black font-serif text-white">Monthly Revenue Breakdown</h2>
              <p className="text-slate-400 text-xs">Performance over the past 6 months</p>
            </div>
            <BarChart3 size={18} className="text-amber-400" />
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={analytics.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#D97706" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Top Products & Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-black font-serif text-white mb-4">Best-Selling Products</h2>
          {analytics.top_products.length === 0 ? (
            <p className="text-slate-500 text-xs py-10 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {analytics.top_products.map((p, i) => {
                const max = analytics.top_products[0].revenue || 1;
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-bold truncate">{i + 1}. {p.name}</span>
                      <span className="text-amber-400 font-bold shrink-0">{formatPrice(p.revenue)}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-900 to-amber-500"
                        style={{ width: `${(p.revenue / max) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">{p.quantity_sold} units sold</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-black font-serif text-white mb-4">Top Categories</h2>
          {analytics.top_categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <BarChart3 size={32} className="opacity-30 mb-2" />
              <p className="text-xs">No category analytics recorded yet.</p>
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
                <Legend formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Amazon / Flipkart Seller Central Quick Operations Control Panel */}
      <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black font-serif text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-400" /> Seller Operations Control Panel
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Quick access shortcuts for managing inventory, listings, store setup &amp; order fulfillment.
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-full border border-slate-700 self-start md:self-auto">
            Amazon / Flipkart Seller Hub Mode Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="group bg-[#1E293B] border border-slate-700 hover:border-amber-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Add New Product</h3>
            <p className="text-slate-400 text-xs mt-1">Create new boutique listings with images &amp; pricing.</p>
          </Link>

          <Link
            to="/admin/products"
            className="group bg-[#1E293B] border border-slate-700 hover:border-amber-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Manage Inventory</h3>
            <p className="text-slate-400 text-xs mt-1">Update stock levels, edit prices, fabric &amp; sizes.</p>
          </Link>

          <Link
            to="/admin/orders"
            className="group bg-[#1E293B] border border-slate-700 hover:border-amber-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Fulfillment Portal</h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-md border border-blue-500/30">
                {stats.order_count} Orders
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Process customer orders &amp; tracking in Order Center.</p>
          </Link>

          <Link
            to="/"
            className="group bg-[#1E293B] border border-slate-700 hover:border-amber-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Eye size={20} />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Live Storefront</h3>
            <p className="text-slate-400 text-xs mt-1">Preview customer view &amp; boutique catalog layout.</p>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
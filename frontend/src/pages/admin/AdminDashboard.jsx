import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  Users, ShoppingBag, DollarSign, Package, TrendingUp,
  Eye, Plus, Footprints, BarChart3, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  pending:    'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  processing: 'bg-blue-900/30 text-blue-400 border-blue-700/40',
  packaging:  'bg-purple-900/30 text-purple-400 border-purple-700/40',
  shipped:    'bg-indigo-900/30 text-indigo-400 border-indigo-700/40',
  delivered:  'bg-green-900/30 text-green-400 border-green-700/40',
  cancelled:  'bg-red-900/30 text-red-400 border-red-700/40',
};

const PIE_COLORS = ['#6B46C1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

// Dashboard silently refetches every 30s so new orders show up without
// the admin having to know to hit reload.
const AUTO_REFRESH_MS = 30000;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_sales: 0, order_count: 0, product_count: 0, user_count: 0 });
  const [analytics, setAnalytics] = useState({
    total_visitors: 0, sales_graph: [], monthly_revenue: [], top_products: [], top_categories: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]); // which parts failed to load, shown to the admin instead of hidden
  const [lastUpdated, setLastUpdated] = useState(null);
  const isFirstLoad = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    else setRefreshing(true);

    // Promise.allSettled instead of Promise.all: one endpoint failing
    // (auth hiccup, network blip, etc.) no longer blanks the whole
    // dashboard silently — each section loads independently and we
    // surface exactly what failed.
    const [statsRes, ordersRes, analyticsRes] = await Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/orders/all'),
      api.get('/admin/analytics'),
    ]);

    const newErrors = [];

    if (statsRes.status === 'fulfilled') {
      setStats(statsRes.value.data);
    } else {
      newErrors.push('Stats load nahi hue');
      console.error('Failed to fetch admin stats:', statsRes.reason);
    }

    if (ordersRes.status === 'fulfilled') {
      setRecentOrders(ordersRes.value.data.slice(0, 5));
    } else {
      newErrors.push('Orders load nahi hue');
      console.error('Failed to fetch orders:', ordersRes.reason);
    }

    if (analyticsRes.status === 'fulfilled') {
      setAnalytics(analyticsRes.value.data);
    } else {
      newErrors.push('Analytics load nahi hue');
      console.error('Failed to fetch analytics:', analyticsRes.reason);
    }

    setErrors(newErrors);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
    isFirstLoad.current = false;
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;
  const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const statCards = [
    { label: 'Total Sales',  value: formatPrice(stats.total_sales),      icon: <DollarSign size={22} />, color: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
    { label: 'Total Orders', value: stats.order_count,                    icon: <ShoppingBag size={22} />, color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
    { label: 'Products',     value: stats.product_count,                  icon: <Package size={22} />,     color: 'bg-gradient-to-br from-sky-500 to-cyan-400' },
    { label: 'Customers',    value: stats.user_count,                     icon: <Users size={22} />,       color: 'bg-gradient-to-br from-emerald-500 to-teal-400' },
    { label: 'Visitors',     value: analytics.total_visitors,             icon: <Footprints size={22} />,  color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const chartTooltipStyle = {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '10px',
    color: '#f3f4f6',
    fontSize: '0.8rem',
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main mb-1">Admin Dashboard</h1>
          <p className="text-text-muted">Welcome back, {user?.username}! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            title="Refresh dashboard data"
            className="flex items-center gap-2 bg-white/5 border border-border-color text-text-main px-4 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {/* Last updated + auto-refresh note */}
      {lastUpdated && (
        <p className="text-text-muted text-xs mb-4">
          Last updated: {lastUpdated.toLocaleTimeString('en-IN')} · Auto-refreshes every 30s
        </p>
      )}

      {/* Error banner — shown instead of silently blanking the dashboard */}
      {errors.length > 0 && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-700/40 text-red-300 rounded-xl p-4 mb-6">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold mb-1">Kuch data load nahi ho paya:</p>
            <p>{errors.join(', ')}. Backend connection ya login check karke "Refresh" try karo. (Details browser console mein hain.)</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-bg-card border border-border-color rounded-2xl p-5 relative overflow-hidden">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${card.color}`}>
              {card.icon}
            </div>
            <h3 className="text-2xl font-black font-serif text-text-main mb-1">{card.value}</h3>
            <p className="text-text-muted text-sm">{card.label}</p>
            {card.label === 'Total Sales' && (
              <TrendingUp size={16} className="absolute top-5 right-5 text-green-400" />
            )}
          </div>
        ))}
      </div>

      {/* Sales Graph + Monthly Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="text-lg font-black font-serif text-text-main mb-1">Sales Graph</h2>
          <p className="text-text-muted text-xs mb-4">Last 14 days revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.sales_graph}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B46C1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6B46C1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6B46C1" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="text-lg font-black font-serif text-text-main mb-1">Monthly Revenue</h2>
          <p className="text-text-muted text-xs mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#EC4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="text-lg font-black font-serif text-text-main mb-4">Top Products</h2>
          {analytics.top_products.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">Koi sales data nahi hai abhi.</p>
          ) : (
            <div className="space-y-4">
              {analytics.top_products.map((p, i) => {
                const max = analytics.top_products[0].revenue || 1;
                return (
                  <div key={p.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-main font-semibold truncate pr-2">{i + 1}. {p.name}</span>
                      <span className="text-text-muted shrink-0">{formatPrice(p.revenue)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${(p.revenue / max) * 100}%` }}
                      />
                    </div>
                    <p className="text-text-muted text-xs mt-1">{p.quantity_sold} sold</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="text-lg font-black font-serif text-text-main mb-4">Top Categories</h2>
          {analytics.top_categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <BarChart3 size={36} className="opacity-30 mb-2" />
              <p className="text-sm">Koi sales data nahi hai abhi.</p>
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
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {analytics.top_categories.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Legend
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black font-serif text-text-main">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            View All <Eye size={15} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <h3 className="font-bold text-text-main mb-1">No orders yet</h3>
            <p className="text-sm">Orders will appear here once customers start shopping.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-color">
                  {['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-border-color last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-bold text-text-main">#{order.id}</td>
                    <td className="py-3 px-2 text-text-muted">{order.shipping_name || `User ${order.user_id}`}</td>
                    <td className="py-3 px-2 text-text-muted">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-2 font-bold text-text-main">{formatPrice(order.total_price)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <Link to="/admin/orders" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors">
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h3 className="font-black font-serif text-text-main text-lg mb-2">Product Management</h3>
          <p className="text-text-muted text-sm mb-5">Manage your product catalog, inventory, and pricing.</p>
          <Link to="/admin/products" className="inline-flex items-center gap-2 bg-white/5 border border-border-color text-text-main px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
            Manage Products <Package size={16} />
          </Link>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h3 className="font-black font-serif text-text-main text-lg mb-2">Order Management</h3>
          <p className="text-text-muted text-sm mb-5">Track orders, update status, and manage shipping.</p>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 bg-white/5 border border-border-color text-text-main px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
            Manage Orders <ShoppingBag size={16} />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
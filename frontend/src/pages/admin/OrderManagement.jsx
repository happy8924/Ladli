import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import {
  Search, Filter, Edit, Package, Truck,
  CheckCircle, XCircle, Clock, X, RefreshCw, AlertTriangle,
  Sparkles, Eye, Calendar
} from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'pending',    label: 'Pending',    icon: Clock,       cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'processing', label: 'Processing', icon: Edit,        cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'packaging',  label: 'Packaging',  icon: Package,     cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'shipped',    label: 'Shipped',    icon: Truck,       cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { value: 'delivered',  label: 'Delivered',  icon: CheckCircle, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'cancelled',  label: 'Cancelled',  icon: XCircle,     cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

const statusMeta = (val) => ORDER_STATUSES.find(s => s.value === val) || ORDER_STATUSES[0];

const OrderManagement = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', tracking_id: '', estimated_delivery: '' });
  const [saving, setSaving]           = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState('');

  const fetchOrders = useCallback(async (isBackground = false) => {
    if (isBackground) setRefreshing(true);
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
      setError('');
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      setError(e.response?.data?.detail || 'Orders could not be loaded from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Smart window focus auto-sync
  useEffect(() => {
    fetchOrders();

    const handleFocus = () => {
      fetchOrders(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchOrders(true);
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchOrders]);

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusUpdate({
      status: order.status,
      tracking_id: order.tracking_id || '',
      estimated_delivery: order.estimated_delivery
        ? new Date(order.estimated_delivery).toISOString().split('T')[0]
        : '',
    });
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const payload = {
        status: statusUpdate.status || null,
        tracking_id: statusUpdate.tracking_id || null,
        estimated_delivery: statusUpdate.estimated_delivery || null,
      };
      const res = await api.patch(`/orders/${selectedOrder.id}/status`, payload);
      setOrders(orders.map(o => (o.id === selectedOrder.id ? res.data : o)));
      setShowModal(false);
      setSelectedOrder(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toString().includes(searchTerm) ||
                         (o.shipping_name && o.shipping_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (o.shipping_phone && o.shipping_phone.includes(searchTerm));
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-900 border-t-amber-400 animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Loading Order Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-serif text-white flex items-center gap-2">
            Order Fulfillment <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track customer orders, manage shipments, update delivery tracking &amp; status.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-600 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-400' : ''} />
          {refreshing ? 'Syncing...' : 'Sync Orders'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/60 text-rose-300 p-4 rounded-2xl text-xs">
          <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Customer Name, or Phone…"
            className="w-full pl-11 pr-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs placeholder:text-slate-400 focus:border-amber-400 outline-none transition-colors"
          />
        </div>

        <div className="relative sm:w-64">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs focus:border-amber-400 outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value} className="bg-[#1E293B] text-white">{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-black text-white text-lg">
            Customer Orders ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <h3 className="font-bold text-white mb-1">No orders found</h3>
            <p className="text-xs">Adjust your search parameters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider text-left">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Shipping Address</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(order => {
                  const meta = statusMeta(order.status);
                  const Icon = meta.icon;
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">#{order.id}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <p className="font-bold text-white">{order.shipping_name || `User #${order.user_id}`}</p>
                        {order.shipping_phone && <p className="text-[10px] text-slate-500">{order.shipping_phone}</p>}
                      </td>
                      <td className="py-3 px-3 text-slate-400 max-w-[200px]">
                        {order.shipping_address ? (
                          <p className="line-clamp-2 truncate" title={`${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`}>
                            {order.shipping_address}, {order.shipping_city}
                          </p>
                        ) : (
                          <span className="italic text-slate-600">Standard Delivery</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="py-3 px-3 text-slate-300 font-bold">{order.items?.length || 0}</td>
                      <td className="py-3 px-3 font-bold text-amber-400 whitespace-nowrap">{formatPrice(order.total_price)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.payment_method === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.payment_method || 'COD'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${meta.cls}`}>
                          <Icon size={12} /> {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-900 transition-colors"
                          title="Update Order Status"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Order Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-700">
              <h3 className="font-black text-lg text-white font-sans">Update Order #{selectedOrder.id}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Order Status
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={e => setStatusUpdate(s => ({ ...s, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-xl text-white text-xs focus:border-amber-400 outline-none cursor-pointer"
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s.value} value={s.value} className="bg-[#1E293B] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Shipment Tracking Number
                </label>
                <input
                  type="text"
                  value={statusUpdate.tracking_id}
                  onChange={e => setStatusUpdate(s => ({ ...s, tracking_id: e.target.value }))}
                  placeholder="e.g. TRK987654321IN"
                  className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-xl text-white text-xs placeholder:text-slate-400 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={statusUpdate.estimated_delivery}
                  onChange={e => setStatusUpdate(s => ({ ...s, estimated_delivery: e.target.value }))}
                  style={{ colorScheme: 'dark' }}
                  className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-xl text-white text-xs focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 text-white font-bold text-xs hover:from-rose-600 hover:to-red-500 transition-all shadow-lg shadow-rose-950/50 disabled:opacity-60"
              >
                {saving ? 'Updating...' : 'Save Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
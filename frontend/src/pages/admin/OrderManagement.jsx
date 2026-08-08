import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import {
  Search, Filter, Edit, Package, Truck,
  CheckCircle, XCircle, Clock, X, RefreshCw, AlertTriangle,
  Sparkles, Eye, Calendar, FileText, Printer, Download, User, MapPin, Phone, DollarSign,
  Navigation, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck
} from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'pending',          label: 'Pending',          icon: Clock,        cls: 'bg-amber-100 text-amber-900 border-amber-300 font-black' },
  { value: 'confirmed',        label: 'Confirmed',        icon: CheckCircle2, cls: 'bg-blue-100 text-blue-900 border-blue-300 font-black' },
  { value: 'processing',       label: 'Processing',       icon: Edit,         cls: 'bg-purple-100 text-purple-900 border-purple-300 font-black' },
  { value: 'shipped',          label: 'Shipped',          icon: Truck,        cls: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-black' },
  { value: 'out_for_delivery', label: 'Out For Delivery', icon: Navigation,   cls: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-black' },
  { value: 'delivered',        label: 'Delivered',        icon: CheckCircle,  cls: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black' },
  { value: 'cancelled',        label: 'Cancelled',        icon: XCircle,      cls: 'bg-rose-100 text-rose-900 border-rose-300 font-black' },
  { value: 'return_requested', label: 'Return Requested', icon: RefreshCw,    cls: 'bg-orange-100 text-orange-900 border-orange-300 font-black' },
  { value: 'returned',         label: 'Returned',         icon: RotateCcw,    cls: 'bg-slate-100 text-slate-900 border-slate-300 font-black' },
];

const statusMeta = (val) => {
  if (!val) return ORDER_STATUSES[0];
  const normalized = val.toLowerCase().replace(/\s+/g, '_');
  return ORDER_STATUSES.find(s => s.value === normalized) || ORDER_STATUSES[0];
};

const TIMELINE_STEPS = [
  { key: 'pending',          label: 'Order Placed' },
  { key: 'confirmed',        label: 'Confirmed' },
  { key: 'processing',       label: 'Processing' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out For Delivery' },
  { key: 'delivered',        label: 'Delivered' }
];

const OrderManagement = () => {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Status Update Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [statusUpdate, setStatusUpdate]   = useState({ status: '', tracking_id: '', estimated_delivery: '' });
  const [saving, setSaving]               = useState(false);

  // View Details Modal State
  const [viewingOrder, setViewingOrder]   = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder]   = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');

  const fetchOrders = useCallback(async (isBackground = false) => {
    if (isBackground) setRefreshing(true);
    try {
      const res = await api.get('/orders/all');
      setOrders(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      setError(e.response?.data?.detail || 'Orders could not be loaded from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const openDetailsModal = (order) => {
    setViewingOrder(order);
    setShowDetailsModal(true);
  };

  const openInvoiceModal = (order) => {
    setInvoiceOrder(order);
    setShowInvoiceModal(true);
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
      if (viewingOrder && viewingOrder.id === selectedOrder.id) {
        setViewingOrder(res.data);
      }
      setShowModal(false);
      setSelectedOrder(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filtered = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchSearch = o.id.toString().includes(term) ||
                         (o.shipping_name && o.shipping_name.toLowerCase().includes(term)) ||
                         (o.shipping_phone && o.shipping_phone.includes(term)) ||
                         (o.shipping_city && o.shipping_city.toLowerCase().includes(term)) ||
                         (o.shipping_state && o.shipping_state.toLowerCase().includes(term));
    const matchStatus  = !statusFilter || (o.status && o.status.toLowerCase().replace(/\s+/g, '_') === statusFilter);
    const matchPayment = !paymentFilter || (o.payment_method && o.payment_method.toLowerCase() === paymentFilter);
    return matchSearch && matchStatus && matchPayment;
  });

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  // Helper to determine active step index for order timeline
  const getTimelineIndex = (statusVal) => {
    if (!statusVal) return 0;
    const normalized = statusVal.toLowerCase().replace(/\s+/g, '_');
    const idx = TIMELINE_STEPS.findIndex(s => s.key === normalized);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-[#800000] border-t-[#C9A227] animate-spin shadow-lg" />
        <p className="text-slate-300 font-bold text-sm tracking-wide">Loading Order Management Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#4A0000] via-[#6B0000] to-[#800000] border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={13} /> Seller Central Fulfillment
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-serif text-white flex items-center gap-3">
              Order Management Portal <Sparkles size={22} className="text-[#C9A227]" />
            </h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1">
              Search, filter, view customer details, track shipment timeline &amp; issue GST tax invoices.
            </p>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-[#C9A227]/40 px-4 py-3 rounded-2xl font-bold text-xs transition-colors disabled:opacity-50 shrink-0 shadow-lg"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#C9A227]' : 'text-[#C9A227]'} />
            {refreshing ? 'Syncing...' : 'Sync Orders'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-950/60 border border-red-800 text-red-200 p-4 rounded-2xl text-xs">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A227]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Customer Name, Phone, City..."
            className="w-full pl-11 pr-4 py-3 bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-2xl text-white text-xs placeholder:text-slate-300 focus:border-[#C9A227] outline-none transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A227]" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#4A0000] border border-[#C9A227]/40 rounded-2xl text-white text-xs focus:border-[#C9A227] outline-none cursor-pointer"
          >
            <option value="">All Order Statuses (9 Statuses)</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value} className="bg-[#4A0000] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Filter */}
        <div className="relative">
          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A227]" />
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#4A0000] border border-[#C9A227]/40 rounded-2xl text-white text-xs focus:border-[#C9A227] outline-none cursor-pointer"
          >
            <option value="">All Payment Methods</option>
            <option value="cod" className="bg-[#4A0000] text-white">Cash On Delivery (COD)</option>
            <option value="online" className="bg-[#4A0000] text-white">Online Paid / Razorpay</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 shadow-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#C9A227]/20">
          <h2 className="font-serif font-black text-white text-lg flex items-center gap-2">
            Store Orders List ({filtered.length})
          </h2>
          <span className="text-xs text-[#C9A227] font-bold bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/30">
            Total {orders.length} Records
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-300">
            <Package size={48} className="mx-auto mb-3 opacity-30 text-[#C9A227]" />
            <h3 className="font-bold text-white mb-1">No matching orders found</h3>
            <p className="text-xs text-slate-300">Try broadening your search term or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#C9A227]/30 text-[#C9A227] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer Details</th>
                  <th className="py-3 px-3">Shipping Location</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total Price</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3">Fulfillment Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#600000]">
                {filtered.map(order => {
                  const meta = statusMeta(order.status);
                  const Icon = meta.icon;
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-white font-mono">#{order.order_number || order.id}</td>
                      <td className="py-3.5 px-3 text-slate-200">
                        <p className="font-bold text-white">{order.shipping_name || `User #${order.user_id}`}</p>
                        {order.shipping_phone && <p className="text-[10px] text-slate-300">{order.shipping_phone}</p>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 max-w-[200px]">
                        {order.shipping_address ? (
                          <p className="line-clamp-2 truncate" title={`${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`}>
                            {order.shipping_address}, {order.shipping_city}
                          </p>
                        ) : (
                          <span className="italic text-slate-400">Standard Delivery</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="py-3.5 px-3 text-white font-bold">{order.items?.length || 0}</td>
                      <td className="py-3.5 px-3 font-bold text-[#C9A227] whitespace-nowrap">{formatPrice(order.total_price)}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          order.payment_method === 'online' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {order.payment_method === 'online' ? 'Paid / Online' : 'COD (Pending)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${meta.cls}`}>
                          <Icon size={12} /> {meta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Order Details */}
                          <button
                            onClick={() => openDetailsModal(order)}
                            className="p-2 rounded-xl bg-[#2E0000] text-slate-200 hover:text-white hover:bg-[#800000] transition-colors border border-[#C9A227]/40"
                            title="View Full Details & Timeline"
                          >
                            <Eye size={14} className="text-[#C9A227]" />
                          </button>

                          {/* Update Order Status */}
                          <button
                            onClick={() => openStatusModal(order)}
                            className="p-2 rounded-xl bg-[#2E0000] text-slate-200 hover:text-white hover:bg-[#800000] transition-colors border border-[#C9A227]/40"
                            title="Update Status & Tracking"
                          >
                            <Edit size={14} className="text-blue-400" />
                          </button>

                          {/* Generate Invoice */}
                          <button
                            onClick={() => openInvoiceModal(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C9A227] text-[#4A0000] hover:bg-[#D4AF37] transition-all text-[11px] font-black shadow-md"
                            title="Generate Tax Invoice"
                          >
                            <FileText size={13} /> Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 1. UPDATE ORDER STATUS MODAL ── */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#4A0000] border-2 border-[#C9A227]/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C9A227]/30">
              <h3 className="font-black text-lg text-white font-serif flex items-center gap-2">
                <Edit size={18} className="text-[#C9A227]" /> Update Order #{selectedOrder.id} Status
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#C9A227] uppercase tracking-wider mb-1.5">
                  Select Order Status (9 Options)
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={e => setStatusUpdate(s => ({ ...s, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#2E0000] border border-[#C9A227]/40 rounded-xl text-white text-xs focus:border-[#C9A227] outline-none cursor-pointer"
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s.value} value={s.value} className="bg-[#4A0000] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C9A227] uppercase tracking-wider mb-1.5">
                  Shipment Tracking Number
                </label>
                <input
                  type="text"
                  value={statusUpdate.tracking_id}
                  onChange={e => setStatusUpdate(s => ({ ...s, tracking_id: e.target.value }))}
                  placeholder="e.g. TRK987654321IN"
                  className="w-full px-4 py-3 bg-[#2E0000] border border-[#C9A227]/40 rounded-xl text-white text-xs placeholder:text-slate-400 focus:border-[#C9A227] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C9A227] uppercase tracking-wider mb-1.5">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={statusUpdate.estimated_delivery}
                  onChange={e => setStatusUpdate(s => ({ ...s, estimated_delivery: e.target.value }))}
                  style={{ colorScheme: 'dark' }}
                  className="w-full px-4 py-3 bg-[#2E0000] border border-[#C9A227]/40 rounded-xl text-white text-xs focus:border-[#C9A227] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-[#C9A227]/20">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-bold text-xs hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#C9A227] text-[#4A0000] font-black text-xs hover:bg-[#D4AF37] transition-all shadow-lg disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Order Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. VIEW COMPLETE ORDER DETAILS & TIMELINE MODAL ── */}
      {showDetailsModal && viewingOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#4A0000] border-2 border-[#C9A227]/60 rounded-3xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#C9A227]/30">
              <div>
                <h3 className="font-black text-xl text-white font-serif flex items-center gap-2">
                  Order Summary #{viewingOrder.id}
                </h3>
                <p className="text-xs text-slate-300">Placed on {formatDate(viewingOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Visual Timeline Progress Tracker */}
            <div className="bg-[#2E0000] border border-[#C9A227]/40 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-[#C9A227] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={15} /> Shipment Progression Timeline
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                {TIMELINE_STEPS.map((step, idx) => {
                  const currentIdx = getTimelineIndex(viewingOrder.status);
                  const isDone     = currentIdx >= idx;
                  const isCurrent  = currentIdx === idx;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all mb-1 border ${
                          isDone
                            ? 'bg-[#C9A227] text-[#4A0000] border-[#C9A227] shadow-md'
                            : 'bg-black/30 text-slate-500 border-slate-700'
                        } ${isCurrent ? 'ring-4 ring-[#C9A227]/40 scale-110' : ''}`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status & Tracking Banner */}
            <div className="bg-[#2E0000] border border-[#C9A227]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Current Status
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusMeta(viewingOrder.status).cls}`}>
                  {statusMeta(viewingOrder.status).label}
                </span>
              </div>
              {viewingOrder.tracking_id && (
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Tracking Number
                  </span>
                  <span className="text-xs font-mono font-bold text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-1 rounded-lg border border-[#C9A227]/30">
                    {viewingOrder.tracking_id}
                  </span>
                </div>
              )}
              <button
                onClick={() => { setShowDetailsModal(false); openStatusModal(viewingOrder); }}
                className="px-3.5 py-2 bg-[#C9A227] hover:bg-[#D4AF37] text-[#4A0000] rounded-xl text-xs font-black transition-colors shadow"
              >
                Change Status
              </button>
            </div>

            {/* Customer Details & Payment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2E0000] border border-[#C9A227]/30 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-[#C9A227] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#C9A227]/20 pb-2">
                  <User size={14} /> Customer Information
                </h4>
                <p className="text-sm font-bold text-white">{viewingOrder.shipping_name || `User #${viewingOrder.user_id}`}</p>
                <p className="text-xs text-slate-200 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#C9A227]" /> {viewingOrder.shipping_phone || 'N/A'}
                </p>
                <div className="text-xs text-slate-200 flex items-start gap-1.5">
                  <MapPin size={13} className="text-[#C9A227] shrink-0 mt-0.5" />
                  <span>
                    {viewingOrder.shipping_address}, {viewingOrder.shipping_city}, {viewingOrder.shipping_state} - {viewingOrder.shipping_pincode}
                  </span>
                </div>
              </div>

              <div className="bg-[#2E0000] border border-[#C9A227]/30 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-[#C9A227] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#C9A227]/20 pb-2">
                  <DollarSign size={14} /> Payment &amp; Billing Info
                </h4>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-300">Payment Mode:</span>
                  <span className="font-bold text-[#C9A227] uppercase">{viewingOrder.payment_method || 'COD'}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-300">Total Amount:</span>
                  <span className="font-bold text-white">{formatPrice(viewingOrder.total_price)}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-300">Est. Delivery Date:</span>
                  <span className="text-white">{formatDate(viewingOrder.estimated_delivery)}</span>
                </div>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="bg-[#2E0000] border border-[#C9A227]/30 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-[#C9A227] text-xs uppercase tracking-wider border-b border-[#C9A227]/20 pb-2">
                Purchased Items ({viewingOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-[#600000]">
                {viewingOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover rounded-xl bg-black border border-[#C9A227]/30 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-14 bg-black rounded-xl flex items-center justify-center text-slate-500 text-xs shrink-0">
                        Item
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate">{item.product?.name || `Product #${item.product_id}`}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Size: <strong className="text-[#C9A227]">{item.selected_size || 'M'}</strong> | Unit Price: {formatPrice(item.price_at_order)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-200 font-bold">Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-[#C9A227]">{formatPrice(item.price_at_order * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-[#C9A227]/20">
              <button
                onClick={() => { setShowDetailsModal(false); openInvoiceModal(viewingOrder); }}
                className="px-4 py-2.5 rounded-xl bg-[#C9A227] text-[#4A0000] font-black text-xs hover:bg-[#D4AF37] transition-all flex items-center gap-1.5 shadow"
              >
                <FileText size={14} /> Generate GST Invoice
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-bold text-xs hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. GST TAX INVOICE GENERATOR & PRINT MODAL ── */}
      {showInvoiceModal && invoiceOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#800000]" />
                <h3 className="font-bold text-lg text-slate-900">Official GST Tax Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#800000] hover:bg-[#600000] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <Printer size={15} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Content */}
            <div id="printable-invoice" className="space-y-6 text-xs text-slate-800">
              
              {/* Header Company Details */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-[#800000] font-serif tracking-tight">LADLI BOUTIQUE</h1>
                  <p className="font-medium text-slate-700">Royal Heritage Women Fashion Pvt. Ltd.</p>
                  <p className="text-[11px] text-slate-500">104 Luxury Apparel Avenue, Commercial Hub, India</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 24AAACL8924F1Z3 | Support: care@ladli.com</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded mb-1">
                    TAX INVOICE
                  </span>
                  <p className="font-bold text-slate-900 text-sm">#INV-2026-{invoiceOrder.id}</p>
                  <p className="text-[11px] text-slate-500">Date: {formatDate(invoiceOrder.created_at)}</p>
                  <p className="text-[11px] text-slate-500 font-bold">Payment: {invoiceOrder.payment_method?.toUpperCase() || 'COD'}</p>
                </div>
              </div>

              {/* Billed To / Shipped To */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">CUSTOMER BILLING DETAILS</p>
                  <p className="font-bold text-slate-900">{invoiceOrder.shipping_name || `User #${invoiceOrder.user_id}`}</p>
                  <p className="text-slate-600">Phone: {invoiceOrder.shipping_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">SHIPPING ADDRESS</p>
                  <p className="text-slate-700 font-medium">
                    {invoiceOrder.shipping_address}, {invoiceOrder.shipping_city}, {invoiceOrder.shipping_state} - {invoiceOrder.shipping_pincode}
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                    <th className="p-2.5 border border-slate-800">S.No</th>
                    <th className="p-2.5 border border-slate-800">Item Description</th>
                    <th className="p-2.5 border border-slate-800">Size</th>
                    <th className="p-2.5 border border-slate-800 text-center">Qty</th>
                    <th className="p-2.5 border border-slate-800 text-right">Unit Rate</th>
                    <th className="p-2.5 border border-slate-800 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-xs">
                  {invoiceOrder.items?.map((item, index) => (
                    <tr key={item.id}>
                      <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                      <td className="p-2.5 border border-slate-300 font-bold text-slate-900">
                        {item.product?.name || `Product #${item.product_id}`}
                        {item.product?.fabric && <span className="block text-[10px] text-slate-500 font-normal">Fabric: {item.product.fabric}</span>}
                      </td>
                      <td className="p-2.5 border border-slate-300 font-bold">{item.selected_size || 'M'}</td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 border border-slate-300 text-right">{formatPrice(item.price_at_order)}</td>
                      <td className="p-2.5 border border-slate-300 text-right font-bold">{formatPrice(item.price_at_order * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-bold text-slate-900">{formatPrice(invoiceOrder.total_price)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Shipping Charges:</span>
                    <span className="font-bold text-emerald-700">FREE</span>
                  </div>
                  <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-black">
                    <span className="text-slate-900">Total Invoice Amount:</span>
                    <span className="text-[#800000]">{formatPrice(invoiceOrder.total_price)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="border-t border-slate-300 pt-4 text-[10px] text-slate-500 flex justify-between items-end">
                <div>
                  <p className="font-bold text-slate-700 mb-1">Terms &amp; Conditions:</p>
                  <p>1. Returns accepted within 7 days with original tag.</p>
                  <p>2. Computer-generated tax invoice. No signature required.</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-slate-400 w-32 mb-1"></div>
                  <p className="font-bold text-slate-800">Authorized Signatory</p>
                  <p className="text-[9px]">LADLI Boutique</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
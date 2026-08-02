import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import {
  Search, Filter, Edit, Package, Truck,
  CheckCircle, XCircle, Clock, X, RefreshCw, AlertTriangle,
  Sparkles, Eye, Calendar, FileText, Printer, Download, User, MapPin, Phone, DollarSign
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
  
  // Status Update Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', tracking_id: '', estimated_delivery: '' });
  const [saving, setSaving]           = useState(false);

  // View Details Modal State
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
                         (o.shipping_city && o.shipping_city.toLowerCase().includes(term));
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
            Order Fulfillment Center <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track customer orders, manage shipment statuses, view order details &amp; generate official GST invoices.
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

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Customer Name, City, or Phone…"
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
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value} className="bg-[#1E293B] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-black text-white text-lg flex items-center gap-2">
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
                  <th className="py-3 px-3">Shipping Location</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total Amount</th>
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
                        {order.shipping_phone && <p className="text-[10px] text-slate-400">{order.shipping_phone}</p>}
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Order Details */}
                          <button
                            onClick={() => openDetailsModal(order)}
                            className="p-1.5 rounded-lg bg-[#1E293B] text-slate-300 hover:text-white hover:bg-amber-600 transition-colors border border-slate-700"
                            title="View Full Order Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Update Order Status */}
                          <button
                            onClick={() => openStatusModal(order)}
                            className="p-1.5 rounded-lg bg-[#1E293B] text-slate-300 hover:text-white hover:bg-blue-600 transition-colors border border-slate-700"
                            title="Update Status & Tracking"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Generate Invoice */}
                          <button
                            onClick={() => openInvoiceModal(order)}
                            className="flex items-center gap-1 p-1.5 rounded-lg bg-[#1E293B] text-amber-400 hover:text-white hover:bg-amber-600 transition-colors border border-slate-700 text-[11px] font-bold"
                            title="Generate Tax Invoice"
                          >
                            <FileText size={14} /> Invoice
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-700">
              <h3 className="font-black text-lg text-white font-sans">Update Status for Order #{selectedOrder.id}</h3>
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

      {/* ── 2. VIEW ORDER DETAILS MODAL ── */}
      {showDetailsModal && viewingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-700">
              <div>
                <h3 className="font-black text-xl text-white flex items-center gap-2">
                  Order Details #{viewingOrder.id}
                </h3>
                <p className="text-xs text-slate-400">Placed on {formatDate(viewingOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status & Tracking Banner */}
              <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Current Fulfillment Status
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusMeta(viewingOrder.status).cls}`}>
                    {viewingOrder.status}
                  </span>
                </div>
                {viewingOrder.tracking_id && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tracking Number
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {viewingOrder.tracking_id}
                    </span>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => { setShowDetailsModal(false); openStatusModal(viewingOrder); }}
                    className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors border border-rose-700"
                  >
                    Change Status
                  </button>
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-2">
                    <User size={14} className="text-amber-400" /> Customer Information
                  </h4>
                  <p className="text-sm font-bold text-white">{viewingOrder.shipping_name || `User #${viewingOrder.user_id}`}</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> {viewingOrder.shipping_phone || 'N/A'}
                  </p>
                  <div className="text-xs text-slate-300 flex items-start gap-1.5">
                    <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {viewingOrder.shipping_address}, {viewingOrder.shipping_city}, {viewingOrder.shipping_state} - {viewingOrder.shipping_pincode}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-2">
                    <DollarSign size={14} className="text-emerald-400" /> Payment &amp; Billing
                  </h4>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="font-bold text-amber-400 uppercase">{viewingOrder.payment_method || 'COD'}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Total Payable:</span>
                    <span className="font-bold text-white">{formatPrice(viewingOrder.total_price)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Est. Delivery:</span>
                    <span className="text-slate-300">{formatDate(viewingOrder.estimated_delivery)}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-700 pb-2">
                  Purchased Items ({viewingOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-700/60">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-3">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover rounded-xl bg-slate-900 border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs shrink-0">
                          Item
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-xs truncate">{item.product?.name || `Product #${item.product_id}`}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Size: <strong className="text-amber-400">{item.selected_size || 'M'}</strong> | Unit Rate: {formatPrice(item.price_at_order)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-300 font-bold">Qty: {item.quantity}</p>
                        <p className="text-xs font-bold text-amber-400">{formatPrice(item.price_at_order * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-3 border-t border-slate-700">
              <button
                onClick={() => { setShowDetailsModal(false); openInvoiceModal(viewingOrder); }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs hover:from-amber-500 transition-all flex items-center gap-1.5"
              >
                <FileText size={14} /> Generate Invoice
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors"
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
                <FileText size={20} className="text-rose-900" />
                <h3 className="font-bold text-lg text-slate-900">Official GST Tax Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <Printer size={15} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Content */}
            <div id="printable-invoice" className="space-y-6 text-xs text-slate-800">
              
              {/* Header Company Details */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-rose-950 font-serif tracking-tight">LADLI BOUTIQUE</h1>
                  <p className="font-medium text-slate-600">Royal Heritage Women Fashion Pvt. Ltd.</p>
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
                    <span className="text-rose-950">{formatPrice(invoiceOrder.total_price)}</span>
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
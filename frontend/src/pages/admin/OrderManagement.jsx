import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import {
  Search, Filter, Edit, Package, Truck,
  CheckCircle, XCircle, Clock, X
} from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'pending',    label: 'Pending',    icon: Clock,       cls: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40' },
  { value: 'processing', label: 'Processing', icon: Edit,        cls: 'bg-blue-900/30 text-blue-400 border-blue-700/40' },
  { value: 'packaging',  label: 'Packaging',  icon: Package,     cls: 'bg-purple-900/30 text-purple-400 border-purple-700/40' },
  { value: 'shipped',    label: 'Shipped',    icon: Truck,       cls: 'bg-indigo-900/30 text-indigo-400 border-indigo-700/40' },
  { value: 'delivered',  label: 'Delivered',  icon: CheckCircle, cls: 'bg-green-900/30 text-green-400 border-green-700/40' },
  { value: 'cancelled',  label: 'Cancelled',  icon: XCircle,     cls: 'bg-red-900/30 text-red-400 border-red-700/40' },
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

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      // ✅ matches backend route: GET /orders/all (admin/logistics only)
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

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
      // ✅ matches backend route: PATCH /orders/{id}/status
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
    const matchSearch = o.id.toString().includes(searchTerm) || o.user_id.toString().includes(searchTerm);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main mb-1">Order Management</h1>
        <p className="text-text-muted">Track orders, update status, and manage shipping.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or User ID…"
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="relative sm:w-64">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6">
        <h2 className="font-black font-serif text-text-main text-lg mb-5">
          Orders ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto mb-4 opacity-30 text-text-muted" />
            <h3 className="font-bold text-text-main mb-1">No orders found</h3>
            <p className="text-text-muted text-sm">
              {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Orders will appear here once placed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-color">
                  {['Order ID', 'Customer', 'Deliver To', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const meta = statusMeta(order.status);
                  const Icon = meta.icon;
                  return (
                    <tr key={order.id} className="border-b border-border-color last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-bold text-text-main">#{order.id}</td>
                      <td className="py-3 px-2 text-text-muted">
                        <div className="text-text-main font-semibold">{order.shipping_name || `User ${order.user_id}`}</div>
                        {order.shipping_phone && <div className="text-xs">{order.shipping_phone}</div>}
                      </td>
                      <td className="py-3 px-2 text-text-muted max-w-[220px]">
                        {order.shipping_address ? (
                          <span
                            title={`${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`}
                            className="line-clamp-2"
                          >
                            {order.shipping_address}, {order.shipping_city} - {order.shipping_pincode}
                          </span>
                        ) : (
                          <span className="italic text-text-muted/60">Not provided</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-text-muted whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="py-3 px-2 text-text-muted">{order.items?.length || 0} items</td>
                      <td className="py-3 px-2 font-bold text-text-main whitespace-nowrap">{formatPrice(order.total_price)}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          order.payment_method === 'online' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
                        }`}>
                          {order.payment_method === 'online' ? 'Online' : 'COD'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize whitespace-nowrap ${meta.cls}`}>
                          <Icon size={12} /> {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors"
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

      {/* Status Update Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-bg-card border border-border-color rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black font-serif text-lg text-text-main">Update Order #{selectedOrder.id}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={e => setStatusUpdate(s => ({ ...s, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none"
                >
                  {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tracking ID</label>
                <input
                  type="text"
                  value={statusUpdate.tracking_id}
                  onChange={e => setStatusUpdate(s => ({ ...s, tracking_id: e.target.value }))}
                  placeholder="e.g. TRK123456789"
                  className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Estimated Delivery</label>
                <input
                  type="date"
                  value={statusUpdate.estimated_delivery}
                  onChange={e => setStatusUpdate(s => ({ ...s, estimated_delivery: e.target.value }))}
                  className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border-color text-text-muted font-bold text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
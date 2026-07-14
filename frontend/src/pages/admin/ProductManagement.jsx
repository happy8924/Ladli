import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import {
  Plus, Search, Edit, Trash2, Eye, Filter,
  Package, AlertCircle
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [productToDelete, setProductToDelete]   = useState(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data);
    } catch (e) { console.error('Failed to fetch products:', e); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (e) { console.error('Failed to fetch categories:', e); }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete product');
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !selectedCategory || p.category_id === parseInt(selectedCategory, 10);
    return matchSearch && matchCat;
  });

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
  const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', cls: 'bg-red-900/30 text-red-400 border-red-700/40' };
    if (stock < 5)   return { text: 'Low Stock',     cls: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40' };
    return { text: 'In Stock', cls: 'bg-green-900/30 text-green-400 border-green-700/40' };
  };

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main mb-1">Product Management</h1>
          <p className="text-text-muted">Manage your product catalog, inventory, and pricing.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 shrink-0"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="relative sm:w-64">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-color rounded-xl text-text-main text-sm focus:border-primary outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6">
        <h2 className="font-black font-serif text-text-main text-lg mb-5">
          Products ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto mb-4 opacity-30 text-text-muted" />
            <h3 className="font-bold text-text-main mb-1">No products found</h3>
            <p className="text-text-muted text-sm mb-6">
              {searchTerm || selectedCategory ? 'Try adjusting your filters or search terms.' : 'Start by adding your first product.'}
            </p>
            {!searchTerm && !selectedCategory && (
              <Link to="/admin/products/new" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors">
                <Plus size={18} /> Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-color">
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="border-b border-border-color last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-12 h-14 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-text-main truncate">{product.name}</p>
                            {product.fabric && (
                              <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-md mt-0.5 inline-block">{product.fabric}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-text-muted whitespace-nowrap">
                        {product.category?.name || `Category ${product.category_id}`}
                      </td>
                      <td className="py-3 px-2 font-bold text-text-main whitespace-nowrap">{formatPrice(product.price)}</td>
                      <td className="py-3 px-2 font-bold text-text-main">{product.stock}</td>
                      <td className="py-3 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${stockStatus.cls}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-text-muted whitespace-nowrap">{formatDate(product.created_at)}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1.5">
                          <Link to={`/product/${product.id}`} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors">
                            <Eye size={14} />
                          </Link>
                          <Link to={`/admin/products/${product.id}/edit`} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors">
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => { setProductToDelete(product); setShowDeleteModal(true); }}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <Trash2 size={14} />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-bg-card border border-border-color rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertCircle size={24} />
              <h3 className="font-black font-serif text-lg">Delete Product</h3>
            </div>
            <p className="text-text-main text-sm mb-1">
              Are you sure you want to delete <strong>{productToDelete.name}</strong>?
            </p>
            <p className="text-text-muted text-xs mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setProductToDelete(null); }}
                className="px-5 py-2.5 rounded-xl border border-border-color text-text-muted font-bold text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
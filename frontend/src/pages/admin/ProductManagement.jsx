import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import {
  Plus, Search, Edit, Trash2, Eye, Filter,
  Package, AlertCircle, Sparkles, AlertTriangle
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [productToDelete, setProductToDelete]   = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
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
    if (stock === 0) return { text: 'Out of Stock', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    if (stock < 5)   return { text: 'Low Stock',     cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { text: 'In Stock', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-900 border-t-amber-400 animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Loading Product Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-serif text-white flex items-center gap-2">
            Catalog Management <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage your boutique inventory, prices, fabrics, and product details.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-gradient-to-r from-rose-900 to-red-800 hover:from-rose-800 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-rose-950/50 shrink-0"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search catalog by name or description…"
            className="w-full pl-11 pr-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs placeholder:text-slate-400 focus:border-amber-400 outline-none transition-colors"
          />
        </div>
        <div className="relative sm:w-64">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs focus:border-amber-400 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-[#1E293B] text-white">{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-black text-white text-lg">
            Catalog Products ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <h3 className="font-bold text-white mb-1">No products match your search</h3>
            <p className="text-xs mb-4">Try clearing your filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider text-left">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(product => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-12 rounded-xl object-cover shrink-0 bg-slate-900 border border-slate-800"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{product.name}</p>
                            {product.fabric && (
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                {product.fabric}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {product.category?.name || `Category #${product.category_id}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-400 whitespace-nowrap">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{product.stock}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${stockStatus.cls}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{formatDate(product.created_at)}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${product.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-900 transition-colors"
                            title="View Public Page"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-amber-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => { setProductToDelete(product); setShowDeleteModal(true); }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-950 transition-colors"
                            title="Delete Product"
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

      {/* Delete Product Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-rose-500">
              <AlertCircle size={24} />
              <h3 className="font-black font-serif text-lg text-white">Delete Product</h3>
            </div>
            <p className="text-slate-300 text-xs mb-1">
              Are you sure you want to delete <strong>{productToDelete.name}</strong> from catalog?
            </p>
            <p className="text-slate-500 text-[11px] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setProductToDelete(null); }}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold text-xs hover:bg-rose-600 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
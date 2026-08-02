import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Image as ImageIcon, AlertCircle,
  CheckCircle, Package, DollarSign, Layers,
  Plus, Upload, Loader2, X, Sparkles
} from 'lucide-react';
import api from '../../api/api';

const PRESET_COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Mustard Yellow', hex: '#EAB308' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Gold', hex: '#D97706' },
  { name: 'Black', hex: '#18181B' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Orange', hex: '#F97316' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  image_url: '',
  fabric: '',
  sizes: 'S,M,L,XL,2XL',
  colors: 'Red, Maroon, Royal Blue, Mustard Yellow, Emerald Green, Rose Pink, Gold, Black',
};

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]           = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  /* Inline add new category */
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  /* Image upload */
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchCategories = () => {
    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategoryError('');
    setCategorySaving(true);
    try {
      const res = await api.post('/categories/', { name });
      setCategories(cats => [...cats, res.data]);
      setForm(f => ({ ...f, category_id: res.data.id }));
      setNewCategoryName('');
      setAddingCategory(false);
    } catch (err) {
      setCategoryError(err.response?.data?.detail || 'Could not add category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/products/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setForm(f => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`)
      .then(res => {
        const p = res.data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? '',
          stock: p.stock ?? '',
          category_id: p.category_id ?? '',
          image_url: p.image_url || '',
          fabric: p.fabric || '',
          sizes: p.sizes || 'S,M,L,XL,2XL',
          colors: p.colors || 'Red, Maroon, Royal Blue, Mustard Yellow, Emerald Green, Rose Pink, Gold, Black',
        });
      })
      .catch(() => setError('Could not load product details.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleToggleColor = (colorName) => {
    const currentList = form.colors
      ? form.colors.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    let updated;
    if (currentList.some(c => c.toLowerCase() === colorName.toLowerCase())) {
      updated = currentList.filter(c => c.toLowerCase() !== colorName.toLowerCase());
    } else {
      updated = [...currentList, colorName];
    }
    setForm(f => ({ ...f, colors: updated.join(', ') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.price || !form.stock || !form.category_id) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      category_id: parseInt(form.category_id, 10),
      image_url: form.image_url || null,
      fabric: form.fabric || null,
      sizes: form.sizes || 'S,M,L,XL,2XL',
      colors: form.colors || 'Red, Maroon, Royal Blue, Mustard Yellow, Emerald Green, Rose Pink, Gold, Black',
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products/', payload);
      }
      setSuccess(true);
      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-900 border-t-amber-400 animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Loading Product Form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Top Header */}
      <div className="flex items-center gap-4 bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl">
        <Link
          to="/admin/products"
          className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-rose-700 transition-all shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-serif text-white flex items-center gap-2">
            {isEdit ? 'Edit Catalog Item' : 'New Product Entry'} <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {isEdit ? 'Update details for this product in the catalog.' : 'Fill in product information to publish to store.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/60 text-rose-300 px-4 py-3 rounded-2xl text-xs font-medium">
          <AlertCircle size={16} className="shrink-0 text-rose-400" /> {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-medium">
          <CheckCircle size={16} className="shrink-0 text-emerald-400" /> Product {isEdit ? 'updated' : 'created'} successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <Package size={18} className="text-rose-500" /> Basic Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Royal Embroidered Chaniya Choli"
                required
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe fabric texture, embroidery details, fit guidelines..."
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required={!addingCategory}
                  className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-2xl text-white text-xs focus:border-rose-700 outline-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {!addingCategory ? (
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className="mt-2 inline-flex items-center gap-1 text-amber-400 text-xs font-bold hover:underline"
                  >
                    <Plus size={14} /> Add new category inline
                  </button>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Designer Sarees"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-rose-700 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={categorySaving || !newCategoryName.trim()}
                        className="px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500 transition-colors disabled:opacity-50"
                      >
                        {categorySaving ? 'Saving…' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingCategory(false); setNewCategoryName(''); setCategoryError(''); }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {categoryError && <p className="text-rose-400 text-[11px]">{categoryError}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Fabric Type
                </label>
                <input
                  type="text"
                  name="fabric"
                  value={form.fabric}
                  onChange={handleChange}
                  placeholder="e.g. Georgette, Chanderi Silk"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign size={18} className="text-amber-400" /> Pricing &amp; Stock Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Retail Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="2999"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Available Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="25"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sizes & Image Upload */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers size={18} className="text-emerald-400" /> Variants &amp; Media
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                placeholder="S,M,L,XL,2XL"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors"
              />
            </div>

            {/* Color Variants */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Available Colors &amp; Shades (comma separated)
              </label>
              <input
                type="text"
                name="colors"
                value={form.colors}
                onChange={handleChange}
                placeholder="Red, Maroon, Royal Blue, Mustard Yellow, Pink, Gold"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors mb-3"
              />
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick Toggle Preset Apparel Colors:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => {
                  const selected = (form.colors || '')
                    .split(',')
                    .map(item => item.trim().toLowerCase())
                    .includes(c.name.toLowerCase());
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleToggleColor(c.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selected
                          ? 'bg-slate-800 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Product Image
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="w-28 aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900 flex items-center justify-center shrink-0 cursor-pointer hover:border-rose-700 transition-colors overflow-hidden"
                >
                  {uploading ? (
                    <Loader2 size={20} className="text-amber-400 animate-spin" />
                  ) : form.image_url ? (
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <ImageIcon size={20} />
                      <span className="text-[10px]">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <Upload size={14} />}
                    Upload from Device
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, WEBP, HEIC up to 10MB.
                  </p>
                  {uploadError && <p className="text-rose-400 text-[11px]">{uploadError}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || success || uploading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-rose-900 to-red-800 hover:from-rose-800 text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-rose-950/50 transition-all active:scale-95 disabled:opacity-60"
          >
            {saving ? 'Saving Product...' : <><Save size={16} /> {isEdit ? 'Update Product' : 'Publish Product'}</>}
          </button>
          <Link
            to="/admin/products"
            className="px-6 py-3.5 rounded-2xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
};

export default ProductForm;
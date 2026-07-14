import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Image as ImageIcon, AlertCircle,
  CheckCircle, Package, Tag, DollarSign, Layers,
  Plus, Upload, Loader2, X
} from 'lucide-react';
import api from '../../api/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  image_url: '',
  fabric: '',
  sizes: 'S,M,L,XL,2XL',
};

const ProductForm = () => {
  const { id } = useParams();          // present only on edit route
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]           = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  /* ── Inline "add new category" ── */
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  /* ── Image upload ── */
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  /* ── Fetch categories ── */
  const fetchCategories = () => {
    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchCategories(); }, []);

  /* ── Create a new category inline ── */
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
      setCategoryError(
        err.code === 'ECONNABORTED' || !err.response
          ? 'Could not reach the server. Is the backend running?'
          : (err.response?.data?.detail || 'Could not add category.')
      );
    } finally {
      setCategorySaving(false);
    }
  };

  /* ── Upload an image from device (gallery/camera roll) ── */
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
        timeout: 30000, // uploads can take longer than regular API calls
      });
      setForm(f => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setUploadError('Upload timed out — check that the backend server is running.');
      } else if (!err.response) {
        setUploadError('Could not reach the server. Is the backend running?');
      } else {
        setUploadError(err.response?.data?.detail || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ── Fetch product if editing ── */
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
        });
      })
      .catch(() => setError('Could not load product details.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/admin/products"
          className="w-10 h-10 rounded-xl bg-bg-card border border-border-color flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/40 transition-all shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-serif text-text-main">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-text-muted text-sm">
            {isEdit ? 'Update product details below' : 'Fill in the details to add a new product'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          <CheckCircle size={16} className="shrink-0" /> Product {isEdit ? 'updated' : 'created'} successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Basic Info ── */}
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="font-bold text-text-main text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <Package size={16} className="text-primary" /> Basic Information
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Royal Embroidered Chaniya Choli"
                required
                className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the product — fabric, work, occasion, etc."
                className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required={!addingCategory}
                  className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {!addingCategory ? (
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className="mt-2 inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline"
                  >
                    <Plus size={14} /> Add new category
                  </button>
                ) : (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Navratri"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                        className="flex-1 px-3 py-2 bg-bg-main border border-border-color rounded-lg text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={categorySaving || !newCategoryName.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 shrink-0"
                      >
                        {categorySaving ? 'Adding…' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingCategory(false); setNewCategoryName(''); setCategoryError(''); }}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-color text-text-muted hover:bg-white/5 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {categoryError && <p className="text-red-400 text-xs">{categoryError}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Fabric
                </label>
                <input
                  type="text"
                  name="fabric"
                  value={form.fabric}
                  onChange={handleChange}
                  placeholder="e.g. Pure Silk, Georgette"
                  className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Pricing & Stock ── */}
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="font-bold text-text-main text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <DollarSign size={16} className="text-primary" /> Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Price (₹) *
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
                className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="25"
                required
                className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Sizes & Image ── */}
        <div className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h2 className="font-bold text-text-main text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <Layers size={16} className="text-primary" /> Variants & Media
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                placeholder="S,M,L,XL,2XL"
                className="w-full px-4 py-3 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {form.sizes.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Product Image
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Preview / upload dropzone */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="w-32 aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-border-color bg-bg-main flex items-center justify-center shrink-0 cursor-pointer hover:border-primary/50 transition-colors relative"
                >
                  {uploading ? (
                    <Loader2 size={22} className="text-primary animate-spin" />
                  ) : form.image_url ? (
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-text-muted">
                      <ImageIcon size={20} />
                      <span className="text-[10px] font-medium">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center justify-center gap-2 bg-white/5 border border-border-color text-text-main px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-60 w-fit"
                  >
                    {uploading ? (
                      <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload size={16} /> Upload from device</>
                    )}
                  </button>
                  <p className="text-text-muted text-xs">
                    Choose a photo from your gallery/camera roll. Any image format (JPG, PNG, WEBP, GIF, HEIC, BMP, TIFF, SVG…), up to 10MB.
                  </p>
                  {uploadError && (
                    <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {uploadError}</p>
                  )}

                  {/* Fallback: paste a URL instead */}
                  <details className="mt-1">
                    <summary className="text-xs text-text-muted cursor-pointer hover:text-text-main select-none">
                      Or paste an image URL instead
                    </summary>
                    <input
                      type="url"
                      name="image_url"
                      value={form.image_url}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full mt-2 px-4 py-2.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                    />
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit Bar ── */}
        <div className="flex gap-3 sticky bottom-4">
          <button
            type="submit"
            disabled={saving || success || uploading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60"
          >
            {saving ? (
              <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Saving...</>
            ) : (
              <><Save size={18} /> {isEdit ? 'Update Product' : 'Add Product'}</>
            )}
          </button>
          <Link
            to="/admin/products"
            className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-border-color text-text-muted font-bold text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
};

export default ProductForm;
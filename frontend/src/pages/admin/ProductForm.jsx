import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Image as ImageIcon, AlertCircle,
  CheckCircle, Package, DollarSign, Layers,
  Plus, Upload, Loader2, X, Sparkles, Trash2, Palette, Images
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

  const [form, setForm]             = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(isEdit);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  /* Inline add new category */
  const [addingCategory, setAddingCategory]   = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving]   = useState(false);
  const [categoryError, setCategoryError]     = useState('');

  /* Cover Image Upload */
  const coverFileInputRef = useRef(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError]       = useState('');

  /* Color-Specific Images & Extra Gallery Photos */
  const [colorImages, setColorImages]         = useState({}); // { 'Red': 'url', 'Maroon': 'url' }
  const [galleryImages, setGalleryImages]     = useState([]); // ['url1', 'url2']
  const [colorUploading, setColorUploading]   = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);

  const colorFileInputRef     = useRef(null);
  const activeColorForUpload  = useRef('');
  const galleryFileInputRef   = useRef(null);

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

  /* Single cover photo upload */
  const handleCoverImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/products/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setForm(f => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Cover image upload failed.');
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  /* Color-specific image upload handler */
  const triggerColorUpload = (colorName) => {
    activeColorForUpload.current = colorName;
    colorFileInputRef.current?.click();
  };

  const handleColorImageUpload = async (e) => {
    const file = e.target.files?.[0];
    const colorName = activeColorForUpload.current;
    if (!file || !colorName) return;
    setColorUploading(colorName);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/products/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setColorImages(prev => ({ ...prev, [colorName]: res.data.url }));
    } catch (err) {
      setUploadError(err.response?.data?.detail || `Failed to upload photo for ${colorName}`);
    } finally {
      setColorUploading('');
      if (colorFileInputRef.current) colorFileInputRef.current.value = '';
    }
  };

  const handleRemoveColorImage = (colorName) => {
    setColorImages(prev => {
      const next = { ...prev };
      delete next[colorName];
      return next;
    });
  };

  /* Bulk / Multiple Gallery photos upload handler */
  const handleMultipleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryUploading(true);
    setUploadError('');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/products/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }
      setGalleryImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload some gallery photos.');
    } finally {
      setGalleryUploading(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setGalleryImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
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

        // Parse image_urls
        if (p.image_urls) {
          const cImages = {};
          const gImages = [];
          const items = p.image_urls.split(',').map(s => s.trim()).filter(Boolean);
          items.forEach(item => {
            if (item.includes('|')) {
              const [cName, url] = item.split('|');
              if (cName && url) {
                cImages[cName.trim()] = url.trim();
              }
            } else {
              gImages.push(item);
            }
          });
          setColorImages(cImages);
          setGalleryImages(gImages);
        }
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
      // Also remove color image mapping if toggled off
      handleRemoveColorImage(colorName);
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

    // Combine color images & gallery images into image_urls
    const colorEntries = Object.entries(colorImages)
      .filter(([cName, url]) => cName && url)
      .map(([cName, url]) => `${cName}|${url}`);

    const allImageUrls = [...colorEntries, ...galleryImages].join(', ');

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      category_id: parseInt(form.category_id, 10),
      image_url: form.image_url || galleryImages[0] || (Object.values(colorImages)[0] || null),
      image_urls: allImageUrls || null,
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

  // Active color names array
  const activeColorNames = (form.colors || '')
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);

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
      <div className="flex items-center gap-4 bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6">
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
            {isEdit ? 'Update details and color photos for this product.' : 'Fill in product info & upload color-specific photos.'}
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

        {/* Hidden inputs for uploading */}
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverImageFile}
          className="hidden"
        />
        <input
          ref={colorFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleColorImageUpload}
          className="hidden"
        />
        <input
          ref={galleryFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultipleGalleryUpload}
          className="hidden"
        />

        {/* Basic Info */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 space-y-4">
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
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 space-y-4">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign size={18} className="text-amber-400" /> Pricing &amp; Inventory
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

        {/* Colors & Multi-Photo Variants Section */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 space-y-6">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette size={18} className="text-amber-400" /> Color Variants &amp; Color-Specific Photos
          </h2>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Colors (comma separated)
            </label>
            <input
              type="text"
              name="colors"
              value={form.colors}
              onChange={handleChange}
              placeholder="Red, Maroon, Royal Blue, Mustard Yellow, Pink, Gold"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:border-rose-700 outline-none transition-colors"
            />
            <p className="text-[11px] font-semibold text-slate-400">Click to Select / Deselect Color Variants:</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => {
                const selected = activeColorNames.some(item => item.toLowerCase() === c.name.toLowerCase());
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

          {/* Color-Specific Photo Upload Cards */}
          {activeColorNames.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={15} /> Upload Photo for Each Color Variant
                </p>
                <span className="text-[11px] text-slate-400">
                  Customers will see the photo change when selecting a color!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeColorNames.map(cName => {
                  const preset = PRESET_COLORS.find(p => p.name.toLowerCase() === cName.toLowerCase());
                  const hex = preset?.hex || '#94A3B8';
                  const imgUrl = colorImages[cName];
                  const isUploadingThis = colorUploading === cName;

                  return (
                    <div
                      key={cName}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: hex }} />
                          <span className="font-bold text-xs text-white">{cName}</span>
                        </div>
                        {imgUrl && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Photo Added
                          </span>
                        )}
                      </div>

                      <div className="relative aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {isUploadingThis ? (
                          <div className="flex flex-col items-center gap-1">
                            <Loader2 size={22} className="text-amber-400 animate-spin" />
                            <span className="text-[10px] text-slate-400 font-bold">Uploading...</span>
                          </div>
                        ) : imgUrl ? (
                          <>
                            <img src={imgUrl} alt={cName} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveColorImage(cName)}
                              className="absolute top-1.5 right-1.5 p-1.5 bg-rose-900/90 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all"
                              title="Remove Photo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-2 text-slate-500">
                            <ImageIcon size={22} className="mx-auto mb-1 opacity-60" />
                            <p className="text-[10px] font-medium">No photo set</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerColorUpload(cName)}
                        disabled={isUploadingThis}
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Upload size={13} />
                        {imgUrl ? `Change ${cName} Photo` : `Upload ${cName} Photo`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Media: Main Cover & Additional Gallery */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 space-y-6">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <Images size={18} className="text-emerald-400" /> Main Cover &amp; Extra Gallery Photos
          </h2>

          {/* Primary Cover Photo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Primary Display Cover Photo
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div
                onClick={() => !uploadingCover && coverFileInputRef.current?.click()}
                className="w-32 aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 flex items-center justify-center shrink-0 cursor-pointer hover:border-amber-400 transition-colors overflow-hidden relative group"
              >
                {uploadingCover ? (
                  <Loader2 size={24} className="text-amber-400 animate-spin" />
                ) : form.image_url ? (
                  <>
                    <img src={form.image_url} alt="Main Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Change Cover
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <ImageIcon size={24} />
                    <span className="text-[10px]">Upload Cover</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploadingCover ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <Upload size={14} />}
                  Upload Main Cover Image
                </button>
                <p className="text-[11px] text-slate-400">
                  This image will be displayed on catalog cards and store listings.
                </p>
                {uploadError && <p className="text-rose-400 text-[11px] font-semibold">{uploadError}</p>}
              </div>
            </div>
          </div>

          {/* Multiple Extra Gallery Photos */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Images size={15} className="text-amber-400" /> Additional Product Gallery Photos
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload multiple extra detail shots, back views, or close-ups.
                </p>
              </div>

              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={galleryUploading}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {galleryUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Upload Multiple Photos
              </button>
            </div>

            {/* Gallery Grid */}
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {galleryImages.map((gUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group">
                    <img src={gUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-900/90 hover:bg-rose-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                No additional gallery photos added yet. Click <strong>"Upload Multiple Photos"</strong> above to add more images.
              </div>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-[#0F172A] border border-slate-700/60 shadow-2xl rounded-3xl p-6 space-y-4">
          <h2 className="font-serif font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers size={18} className="text-emerald-400" /> Apparel Size Options
          </h2>
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
        </div>

        {/* Submit Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || success || uploadingCover || galleryUploading || Boolean(colorUploading)}
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
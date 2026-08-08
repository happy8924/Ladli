import React, { useState } from 'react';
import { Star, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/api';

const ReviewModal = ({ isOpen, onClose, product, initialRating = 5, initialComment = '', onSuccess }) => {
  const [rating, setRating]     = useState(initialRating);
  const [hoverRating, setHover] = useState(0);
  const [comment, setComment]   = useState(initialComment);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief comment describing your experience.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/reviews/', {
        product_id: product.id,
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
      if (onSuccess) onSuccess(res.data);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EADBC8] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EADBC8] bg-amber-50/50">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-serif font-black text-[#800000] text-lg">Product Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Brief */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/40">
          <div className="w-14 h-16 rounded-xl bg-white border border-[#EADBC8] overflow-hidden shrink-0 shadow-xs">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?q=80&w=800&auto=format&fit=crop'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-bold text-gray-900 text-sm truncate">{product.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">Share your verified purchase experience</p>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              <span>Thank you! Your review has been saved successfully.</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Your Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={active ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                  </button>
                );
              })}
              <span className="ml-2 font-serif font-black text-[#800000] text-sm">
                {rating === 5 ? '5.0 - Excellent!' : rating === 4 ? '4.0 - Very Good' : rating === 3 ? '3.0 - Good' : rating === 2 ? '2.0 - Fair' : '1.0 - Poor'}
              </span>
            </div>
          </div>

          {/* Review Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Write Your Review *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the fabric quality, embroidery, and fit? Would you recommend it?"
              required
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 text-gray-900 text-xs placeholder:text-gray-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2.5 rounded-xl bg-[#800000] hover:bg-[#600000] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReviewModal;

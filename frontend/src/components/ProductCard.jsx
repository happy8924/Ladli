import React, { useState } from 'react';
import { ShoppingBag, Trash2, Heart, Star, Edit, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
    const { toggleCart, isInCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { isAdmin, user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const adminRole = isAdmin || user?.role === 'admin' || user?.role === 'logistics';

    const rating = (Math.random() * (5 - 3.8) + 3.8).toFixed(1);
    const reviews = Math.floor(Math.random() * 200) + 25;
    const inCart = isInCart(product.id);

    return (
        <div 
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl border border-[#EADBC8] hover:border-[#C9A227]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-amber-50/50">
                <Link to={`/product/${product.id}`} className="absolute inset-0">
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {adminRole ? (
                        <span className="px-2.5 py-1 bg-[#800000] text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-md border border-[#C9A227]">
                            Admin View
                        </span>
                    ) : inCart ? (
                        <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-md flex items-center gap-1 border border-emerald-300">
                            <Check size={12} /> In Cart
                        </span>
                    ) : product.price > 3000 && (
                        <span className="px-2.5 py-1 bg-white/95 text-[#800000] text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-sm border border-[#EADBC8]">
                            Premium
                        </span>
                    )}
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-opacity duration-300 border border-[#EADBC8] z-10">
                    <span className="text-xs font-bold text-gray-900">{rating}</span>
                    <Star size={11} className="fill-amber-500 text-amber-500" />
                    <span className="text-[10px] text-gray-500 font-medium ml-0.5 border-l border-gray-200 pl-1">({reviews})</span>
                </div>

                {/* Action Buttons (Hover) */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-transform duration-300 transform z-20 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {adminRole ? (
                        <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="flex-1 bg-[#800000] text-white hover:bg-[#5C0000] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors border border-[#C9A227]"
                        >
                            <Edit size={15} />
                            Edit Product
                        </Link>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleCart(product);
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border ${
                                inCart
                                    ? 'bg-red-600 text-white hover:bg-red-700 border-red-300'
                                    : 'bg-[#800000] text-white hover:bg-[#5C0000] border-[#C9A227]'
                            }`}
                        >
                            {inCart ? (
                                <><Trash2 size={14} /> Remove from Cart</>
                            ) : (
                                <><ShoppingBag size={14} /> Add to Cart</>
                            )}
                        </button>
                    )}
                </div>

                {/* Wishlist Button */}
                {!adminRole && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                            isInWishlist(product.id) 
                                ? 'bg-red-50 text-red-600 shadow-md border border-red-200' 
                                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-600 shadow-sm border border-[#EADBC8]'
                        }`}
                    >
                        <Heart size={16} className={isInWishlist(product.id) ? "fill-current" : ""} />
                    </button>
                )}
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                <h3 className="font-bold text-base text-gray-900 truncate font-serif tracking-wide mb-1 hover:text-[#800000] transition-colors">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                
                <p className="text-xs font-medium text-gray-500 mb-3 truncate">
                    {product.fabric || 'Designer Silk'} • Authentic Handcrafted
                </p>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-lg text-[#800000] font-serif">₹{product.price?.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-400 line-through">₹{Math.round(product.price * 1.35)?.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        25% OFF
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
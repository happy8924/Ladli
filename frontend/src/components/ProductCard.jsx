import React, { useState } from 'react';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isHovered, setIsHovered] = useState(false);

    // Mock rating for visual purpose
    const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
    const reviews = Math.floor(Math.random() * 500) + 10;

    return (
        <div 
            className="group relative flex flex-col bg-bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-pro border border-transparent hover:border-border-color"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Link to={`/product/${product.id}`} className="absolute inset-0">
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.price > 3000 && (
                        <span className="px-2.5 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-text-main rounded-sm shadow-sm">
                            Premium
                        </span>
                    )}
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm transition-opacity duration-300 group-hover:opacity-0">
                    <span className="text-xs font-bold text-text-main">{rating}</span>
                    <Star size={10} className="fill-green-600 text-green-600" />
                    <span className="text-[10px] text-text-muted ml-0.5 border-l border-border-color pl-1">{reviews}</span>
                </div>

                {/* Action Buttons (Visible on Hover) */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-transform duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="flex-1 bg-white dark:bg-slate-800 text-text-main py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-primary hover:text-white transition-colors active:scale-95"
                    >
                        <ShoppingBag size={16} />
                        Add to Cart
                    </button>
                </div>

                {/* Wishlist Button (Always visible but changes on hover) */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isInWishlist(product.id) 
                            ? 'bg-red-50 text-red-500 shadow-md' 
                            : 'bg-white/80 dark:bg-black/50 text-text-muted hover:bg-white dark:hover:bg-slate-800 hover:text-red-500 shadow-sm'
                    }`}
                >
                    <Heart size={16} className={isInWishlist(product.id) ? "fill-current" : ""} />
                </button>
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base text-text-main truncate pr-2 font-serif tracking-wide">{product.name}</h3>
                </div>
                
                <p className="text-sm text-text-muted mb-3 truncate">
                    {product.fabric || 'Designer Silk'} • Handcrafted
                </p>

                <div className="mt-auto flex items-center gap-2">
                    <span className="font-bold text-lg text-text-main font-serif">₹{product.price.toLocaleString('en-IN')}</span>
                    {/* Fake original price for UI */}
                    <span className="text-sm text-text-muted line-through">₹{(product.price * 1.4).toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-green-600 ml-auto bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        {Math.round((1 - 1/1.4) * 100)}% OFF
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
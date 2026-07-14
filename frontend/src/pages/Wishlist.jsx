import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
    const { wishlistItems } = useWishlist();

    return (
        <div className="min-h-screen bg-bg-main py-12 md:py-20">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black font-serif text-text-main mb-4 flex items-center gap-3">
                        My Wishlist <Heart className="text-red-500 fill-red-500" size={40} />
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl">
                        Your curated collection of Ladli's finest Chaniya Cholis. Save your favorite designs here until you're ready to make them yours.
                    </p>
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlistItems.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl p-12 md:p-20 shadow-sm border border-border-color text-center max-w-3xl mx-auto mt-8">
                        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Heart size={48} />
                        </div>
                        <h2 className="text-3xl font-bold font-serif text-text-main mb-4">Your Wishlist is Empty</h2>
                        <p className="text-text-muted text-lg mb-10 max-w-md">
                            Looks like you haven't found your perfect outfit yet. Browse our premium collections and tap the heart icon to save items.
                        </p>
                        <Link
                            to="/catalog"
                            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-hover hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                            <ShoppingBag size={20} />
                            Explore Collections
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
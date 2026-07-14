import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext'; // Import useAuth to track login state

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const auth = useAuth();
    const user = auth?.user; // Get logged-in user

    // Fetch wishlist when user logs in or changes
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlistItems([]); // Clear wishlist if not logged in
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/wishlist/');
            // Backend returns a list of WishlistResponse objects, each with a 'product' nested
            const products = response.data.map(item => item.product);
            setWishlistItems(products);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };

    const toggleWishlist = async (product) => {
        if (!user) {
            alert("Please log in to add items to your wishlist.");
            return;
        }

        const exists = wishlistItems.find(item => item.id === product.id);

        if (exists) {
            try {
                // Delete from backend
                await api.delete(`/wishlist/${product.id}`);
                // Remove from local state
                setWishlistItems(wishlistItems.filter(item => item.id !== product.id));
            } catch (error) {
                console.error("Failed to remove from wishlist", error);
            }
        } else {
            try {
                // Add to backend
                await api.post('/wishlist/', { product_id: product.id });
                // Add to local state
                setWishlistItems([...wishlistItems, product]);
            } catch (error) {
                console.error("Failed to add to wishlist", error);
            }
        }
    };

    const isInWishlist = (id) => {
        return wishlistItems.some(item => item.id === id);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                toggleWishlist,
                isInWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
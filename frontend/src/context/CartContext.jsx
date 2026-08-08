import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_STORAGE_KEY = 'ladli_cart';

export const CartProvider = ({ children }) => {
    const { user, isAdmin } = useAuth();
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load cart from localStorage:', e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e);
        }
    }, [cartItems]);

    // ADD TO CART
    const addToCart = (product, selectedSize = 'M', quantity = 1) => {
        if (isAdmin || user?.role === 'admin' || user?.role === 'logistics') {
            alert('Admin accounts are for store management only. Please log in with a customer account to add items to cart.');
            return;
        }

        const size = selectedSize || 'M';
        const itemKey = product.cartItemId || `${product.id}-${size}`;

        setCartItems(prevItems => {
            const existingIndex = prevItems.findIndex(
                item => (item.cartItemId && item.cartItemId === itemKey) ||
                        (item.id === product.id && item.selectedSize === size)
            );

            if (existingIndex > -1) {
                return prevItems.map((item, idx) =>
                    idx === existingIndex
                        ? { ...item, quantity: item.quantity + (quantity || 1) }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        ...product,
                        cartItemId: itemKey,
                        selectedSize: size,
                        quantity: quantity || 1
                    }
                ];
            }
        });
    };

    // INCREASE QUANTITY
    const increaseQuantity = (id, selectedSize) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                const targetStr = String(id);
                const itemIdStr = String(item.id);
                const cartItemIdStr = String(item.cartItemId || '');

                const isMatch = selectedSize
                    ? (item.id === id && item.selectedSize === selectedSize) ||
                      cartItemIdStr === `${id}-${selectedSize}` ||
                      cartItemIdStr === targetStr
                    : itemIdStr === targetStr || cartItemIdStr === targetStr || cartItemIdStr === `${targetStr}-M`;

                return isMatch ? { ...item, quantity: item.quantity + 1 } : item;
            })
        );
    };

    // DECREASE QUANTITY
    const decreaseQuantity = (id, selectedSize) => {
        setCartItems(prevItems =>
            prevItems
                .map(item => {
                    const targetStr = String(id);
                    const itemIdStr = String(item.id);
                    const cartItemIdStr = String(item.cartItemId || '');

                    const isMatch = selectedSize
                        ? (item.id === id && item.selectedSize === selectedSize) ||
                          cartItemIdStr === `${id}-${selectedSize}` ||
                          cartItemIdStr === targetStr
                        : itemIdStr === targetStr || cartItemIdStr === targetStr || cartItemIdStr === `${targetStr}-M`;

                    return isMatch ? { ...item, quantity: item.quantity - 1 } : item;
                })
                .filter(item => item.quantity > 0)
        );
    };

    // REMOVE FROM CART (Supports object, cartItemId string, or id + selectedSize)
    const removeFromCart = (idOrItem, selectedSize) => {
        setCartItems(prevItems =>
            prevItems.filter(item => {
                // If passed object
                if (typeof idOrItem === 'object' && idOrItem !== null) {
                    const targetKey = idOrItem.cartItemId || `${idOrItem.id}-${idOrItem.selectedSize || 'M'}`;
                    const itemKey = item.cartItemId || `${item.id}-${item.selectedSize || 'M'}`;
                    return itemKey !== targetKey && item.id !== idOrItem.id;
                }

                // If explicit size passed
                if (selectedSize) {
                    const isMatch = (item.id === idOrItem && item.selectedSize === selectedSize) ||
                                    (item.cartItemId === `${idOrItem}-${selectedSize}`) ||
                                    (item.cartItemId === idOrItem);
                    return !isMatch;
                }

                // Match by numeric/string id or cartItemId
                const targetStr = String(idOrItem);
                const itemIdStr = String(item.id);
                const cartItemIdStr = String(item.cartItemId || '');

                const isMatch = itemIdStr === targetStr ||
                                cartItemIdStr === targetStr ||
                                cartItemIdStr.startsWith(`${targetStr}-`);

                return !isMatch;
            })
        );
    };

    // CHECK IF IN CART
    const isInCart = (productId, selectedSize = 'M') => {
        const targetStr = String(productId);
        return cartItems.some(item =>
            String(item.id) === targetStr ||
            item.cartItemId === `${productId}-${selectedSize}` ||
            item.cartItemId === targetStr
        );
    };

    // TOGGLE CART
    const toggleCart = (product, selectedSize = 'M') => {
        if (isInCart(product.id, selectedSize)) {
            removeFromCart(product.id, selectedSize);
        } else {
            addToCart(product, selectedSize);
        }
    };

    // CLEAR CART
    const clearCart = () => {
        setCartItems([]);
        try {
            localStorage.removeItem(CART_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear cart storage:', e);
        }
    };

    // TOTAL ITEMS
    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // TOTAL PRICE
    const totalPrice = cartItems.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                isInCart,
                toggleCart,
                clearCart,
                totalItems,
                totalPrice
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
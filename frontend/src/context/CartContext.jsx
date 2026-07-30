import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'ladli_cart';

export const CartProvider = ({ children }) => {
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
        const itemKey = `${product.id}-${selectedSize}`;

        const existingIndex = cartItems.findIndex(
            item => item.cartItemId === itemKey || (item.id === product.id && item.selectedSize === selectedSize)
        );

        if (existingIndex > -1) {
            setCartItems(
                cartItems.map((item, idx) =>
                    idx === existingIndex
                        ? {
                            ...item,
                            quantity: item.quantity + (quantity || 1)
                        }
                        : item
                )
            );
        } else {
            setCartItems([
                ...cartItems,
                {
                    ...product,
                    cartItemId: itemKey,
                    selectedSize: selectedSize || 'M',
                    quantity: quantity || 1
                }
            ]);
        }
    };

    // INCREASE
    const increaseQuantity = (id, selectedSize) => {
        setCartItems(
            cartItems.map(item => {
                const match = selectedSize
                    ? (item.id === id && item.selectedSize === selectedSize) || item.cartItemId === `${id}-${selectedSize}`
                    : item.id === id || item.cartItemId === id;
                return match ? { ...item, quantity: item.quantity + 1 } : item;
            })
        );
    };

    // DECREASE
    const decreaseQuantity = (id, selectedSize) => {
        setCartItems(
            cartItems
                .map(item => {
                    const match = selectedSize
                        ? (item.id === id && item.selectedSize === selectedSize) || item.cartItemId === `${id}-${selectedSize}`
                        : item.id === id || item.cartItemId === id;
                    return match ? { ...item, quantity: item.quantity - 1 } : item;
                })
                .filter(item => item.quantity > 0)
        );
    };

    // REMOVE
    const removeFromCart = (id, selectedSize) => {
        setCartItems(
            cartItems.filter(item => {
                if (selectedSize) {
                    return !((item.id === id && item.selectedSize === selectedSize) || item.cartItemId === `${id}-${selectedSize}`);
                }
                return item.id !== id && item.cartItemId !== id;
            })
        );
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
        (total, item) => total + item.price * item.quantity,
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
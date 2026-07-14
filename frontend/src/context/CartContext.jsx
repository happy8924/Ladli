import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState([]);

    // ADD TO CART
    const addToCart = (product) => {

        const existingItem = cartItems.find(
            item => item.id === product.id
        );

        if (existingItem) {

            setCartItems(
                cartItems.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1
                        }
                        : item
                )
            );

        } else {

            setCartItems([
                ...cartItems,
                {
                    ...product,
                    quantity: 1
                }
            ]);
        }
    };

    // INCREASE
    const increaseQuantity = (id) => {

        setCartItems(
            cartItems.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1
                    }
                    : item
            )
        );
    };

    // DECREASE
    const decreaseQuantity = (id) => {

        setCartItems(
            cartItems
                .map(item =>
                    item.id === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1
                        }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    // REMOVE
    const removeFromCart = (id) => {

        setCartItems(
            cartItems.filter(item => item.id !== id)
        );
    };

    // TOTAL ITEMS
    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // TOTAL PRICE
    const totalPrice = cartItems.reduce(
        (total, item) =>
            total + item.price * item.quantity,
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
                totalItems,
                totalPrice
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('mega_sushi_cart');
            if (saved) setItems(JSON.parse(saved));
        } catch (e) { }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('mega_sushi_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (product) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeItem = (id) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const increment = (id) => {
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        );
    };

    const decrement = (id) => {
        setItems((prev) =>
            prev
                .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                .filter((i) => i.qty > 0)
        );
    };

    const clear = () => setItems([]);

    const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
                addItem,
                removeItem,
                increment,
                decrement,
                clear,
                totalCount,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
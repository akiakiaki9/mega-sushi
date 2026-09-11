'use client';

import { FaShoppingBag } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import './cart.css';

export default function CartButton() {
    const { totalCount, totalPrice, openCart } = useCart();

    if (totalCount === 0) return null;

    return (
        <button className="cart-fab" onClick={openCart} aria-label="Открыть корзину">
            <span className="cart-fab__icon">
                <FaShoppingBag />
                <span className="cart-fab__badge">{totalCount}</span>
            </span>
            <span className="cart-fab__text">
                <span className="cart-fab__label">Корзина</span>
                <span className="cart-fab__price">
                    {totalPrice.toLocaleString()} сум
                </span>
            </span>
        </button>
    );
}
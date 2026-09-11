'use client';

import { FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import './cart-button.css';

export default function CartButton() {
    const { totalCount, totalPrice, openCart } = useCart();
    const isEmpty = totalCount === 0;

    return (
        <button
            type="button"
            className={`cart-fab ${isEmpty ? 'cart-fab--empty' : 'cart-fab--active'}`}
            onClick={openCart}
            aria-label={isEmpty ? 'Открыть корзину' : `Открыть корзину, товаров: ${totalCount}`}
        >
            <span className="cart-fab__icon">
                <FaShoppingBag />
                {!isEmpty && (
                    <span className="cart-fab__badge">{totalCount}</span>
                )}
            </span>

            <span className="cart-fab__body">
                <span className="cart-fab__label">Корзина</span>
                <span className="cart-fab__value">
                    {isEmpty
                        ? 'Пусто'
                        : `${totalPrice.toLocaleString()} сум`}
                </span>
            </span>

            <span className="cart-fab__arrow">
                <FaArrowRight />
            </span>
        </button>
    );
}
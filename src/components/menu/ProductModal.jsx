'use client';

import { useEffect } from 'react';
import { FaPlus, FaMinus, FaTimes, FaUtensils, FaLayerGroup } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import './menu.css';

export default function ProductModal({ product, onClose }) {
    const { addItem, items, increment, decrement } = useCart();
    const inCart = product ? items.find((i) => i.id === product.id) : null;

    useEffect(() => {
        if (!product) return;

        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);
            window.removeEventListener('keydown', onKey);
        };
    }, [product, onClose]);

    if (!product) return null;

    return (
        <div className="product-modal" onClick={onClose}>
            <div
                className="product-modal__dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="product-modal__close"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    <FaTimes />
                </button>

                {/* ---------- Фото ---------- */}
                <div className="product-modal__image">
                    <img src={product.image} alt={product.name} />
                    {product.badge && (
                        <span className="product-modal__badge">{product.badge}</span>
                    )}
                </div>

                {/* ---------- Информация ---------- */}
                <div className="product-modal__body">
                    <div className="product-modal__head">
                        <h2 className="product-modal__title">{product.name}</h2>

                        {(product.pieces || product.weight) && (
                            <div className="product-modal__meta">
                                {product.pieces && (
                                    <span className="product-modal__meta-item">
                                        <FaLayerGroup />
                                        {product.pieces} шт
                                    </span>
                                )}
                                {product.weight && (
                                    <span className="product-modal__meta-item">
                                        {product.weight}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {product.description && (
                        <p className="product-modal__short">{product.description}</p>
                    )}

                    {product.composition && (
                        <div className="product-modal__composition">
                            <div className="product-modal__composition-label">
                                <FaUtensils />
                                <span>Состав</span>
                            </div>
                            <p>{product.composition}</p>
                        </div>
                    )}

                    {/* ---------- Футер с ценой и кнопкой ---------- */}
                    <div className="product-modal__footer">
                        <div className="product-modal__price">
                            {product.price.toLocaleString()} <small>сум</small>
                        </div>

                        {inCart ? (
                            <div className="product-modal__counter">
                                <button
                                    onClick={() => decrement(product.id)}
                                    aria-label="Уменьшить"
                                >
                                    <FaMinus />
                                </button>
                                <span>{inCart.qty}</span>
                                <button
                                    onClick={() => increment(product.id)}
                                    aria-label="Увеличить"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        ) : (
                            <button
                                className="product-modal__add"
                                onClick={() => addItem(product)}
                            >
                                <FaPlus />
                                <span>Добавить в корзину</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import './menu.css';

export default function MenuCard({ product, onOpen }) {
  const { addItem } = useCart();
  const [animating, setAnimating] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);

    setAnimating(true);
    setAdded(true);

    setTimeout(() => setAnimating(false), 700);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="menu-card">
      <button
        type="button"
        className="menu-card__image"
        onClick={onOpen}
        aria-label={`Открыть ${product.name}`}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="menu-card__badge">{product.badge}</span>}
      </button>

      <div className="menu-card__body">
        <h3 className="menu-card__name">{product.name}</h3>
        {product.description && (
          <p className="menu-card__desc">{product.description}</p>
        )}

        <div className="menu-card__footer">
          <span className="menu-card__price">
            {product.price.toLocaleString()} <small>сум</small>
          </span>

          <button
            className={`menu-card__add ${animating ? 'menu-card__add--anim' : ''
              } ${added ? 'menu-card__add--added' : ''}`}
            onClick={handleAdd}
            disabled={animating}
          >
            <span className="menu-card__add-icon">
              {added ? <FaCheck /> : <FaPlus />}
            </span>
            <span className="menu-card__add-text">
              {added ? 'Добавлено' : 'Добавить'}
            </span>
            <span className="menu-card__add-ripple" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
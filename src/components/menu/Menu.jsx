'use client';

import { useState } from 'react';
import MenuCard from './MenuCard';
import ProductModal from './ProductModal';
import { PRODUCTS } from '@/utils/products';
import './menu.css';

// Порядок категорий: сначала сеты, потом всё остальное
const CATEGORY_ORDER = {
    sets: 0,
    rolls: 1,
    mini: 2,
};

const SORTED_PRODUCTS = [...PRODUCTS].sort((a, b) => {
    const orderA = CATEGORY_ORDER[a.category] ?? 99;
    const orderB = CATEGORY_ORDER[b.category] ?? 99;
    return orderA - orderB;
});

export default function Menu() {
    const [selected, setSelected] = useState(null);

    return (
        <section className="menu" id="menu">
            <div className="container">
                <div className="menu__head">
                    <h2 className="menu__title">Меню</h2>
                    <p className="menu__subtitle">
                        Выбирайте любимые блюда и добавляйте в корзину
                    </p>
                </div>

                <div className="menu__grid">
                    {SORTED_PRODUCTS.map((p) => (
                        <MenuCard key={p.id} product={p} onOpen={() => setSelected(p)} />
                    ))}
                </div>
            </div>

            <ProductModal product={selected} onClose={() => setSelected(null)} />
        </section>
    );
}
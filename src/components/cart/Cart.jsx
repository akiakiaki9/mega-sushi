'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    FaTimes,
    FaPlus,
    FaMinus,
    FaTrash,
    FaUser,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaShoppingBag,
    FaStore,
    FaTruck,
    FaCommentAlt,
    FaLocationArrow,
    FaEdit,
    FaSpinner,
} from 'react-icons/fa';

import { useCart } from '@/context/CartContext';
import CartButton from './CartButton';
import './cart.css';

const LocationMap = dynamic(() => import('./LocationMap'), {
    ssr: false,
    loading: () => (
        <div className="cart__map-loading">
            <div className="cart__map-spinner" />
            <span>Загружаем карту...</span>
        </div>
    ),
});

/*
|--------------------------------------------------------------------------
| ЦЕНТР БУХАРЫ
|--------------------------------------------------------------------------
|
| Это именно стартовая точка карты.
|
*/

const DEFAULT_COORDS = {
    lat: 39.7747,
    lng: 64.4286,
};

const DEFAULT_ADDRESS = 'Abdulazim Somiy 48a, Bukhara';

export default function Cart() {
    const {
        items,
        isOpen,
        closeCart,
        increment,
        decrement,
        removeItem,
        clear,
        totalPrice,
        totalCount,
    } = useCart();

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        type: 'delivery',
        comment: '',
    });

    /*
    |--------------------------------------------------------------------------
    | COORDINATES
    |--------------------------------------------------------------------------
    */

    const [coords, setCoords] = useState(DEFAULT_COORDS);

    const [showMap, setShowMap] = useState(false);

    const [status, setStatus] = useState('idle');

    const [error, setError] = useState('');

    /*
    |--------------------------------------------------------------------------
    | UPDATE FORM
    |--------------------------------------------------------------------------
    */

    const update = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | ОТКРЫТИЕ / ЗАКРЫТИЕ КОРЗИНЫ
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!isOpen) {
            setShowMap(false);
            setError('');

            if (status === 'success') {
                const timer = setTimeout(() => {
                    setStatus('idle');
                }, 300);

                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, status]);

    /*
    |--------------------------------------------------------------------------
    | ОТКРЫТЬ КАРТУ
    |--------------------------------------------------------------------------
    */

    const openMap = () => {
        setError('');
        setShowMap(true);
    };

    /*
    |--------------------------------------------------------------------------
    | ВЫБОР ТОЧКИ НА КАРТЕ
    |--------------------------------------------------------------------------
    */

    const handlePick = (newCoords) => {
        if (!newCoords) {
            return;
        }

        const lat = Number(newCoords.lat);
        const lng = Number(newCoords.lng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return;
        }

        setCoords({
            lat,
            lng,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | ПОЛУЧЕН АДРЕС ОТ КАРТЫ
    |--------------------------------------------------------------------------
    */

    const handleAddressFound = (address) => {
        if (!address) {
            return;
        }

        update('address', address);
        setError('');
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!form.name.trim()) {
            setError('Укажите ваше имя');
            return;
        }

        if (!form.phone.trim()) {
            setError('Укажите номер телефона');
            return;
        }

        if (
            form.type === 'delivery' &&
            !form.address.trim()
        ) {
            setError(
                'Определите адрес доставки или выберите точку на карте'
            );
            return;
        }

        setError('');
        setStatus('sending');

        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer: {
                        ...form,
                        coords,
                    },
                    items,
                    totalPrice,
                    totalCount,
                }),
            });

            if (!res.ok) {
                throw new Error('Ошибка отправки');
            }

            setStatus('success');

            clear();

            setTimeout(() => {
                setStatus('idle');

                closeCart();

                setForm({
                    name: '',
                    phone: '',
                    address: '',
                    type: 'delivery',
                    comment: '',
                });

                setCoords(DEFAULT_COORDS);

                setShowMap(false);
            }, 3200);
        } catch (err) {
            console.error(err);

            setStatus('error');

            setError(
                'Не удалось отправить заказ. Позвоните: +998 99 120 27 00'
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <CartButton />

            {isOpen && (
                <div
                    className="cart-overlay"
                    onClick={closeCart}
                >
                    <div
                        className="cart"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* ==================================================
                            HEADER
                        ================================================== */}

                        <div className="cart__header">
                            <h2 className="cart__title">
                                {status === 'success'
                                    ? 'Готово!'
                                    : 'Корзина'}

                                {status !== 'success' &&
                                    totalCount > 0 && (
                                        <span className="cart__title-count">
                                            {totalCount}
                                        </span>
                                    )}
                            </h2>

                            <button
                                className="cart__close"
                                onClick={closeCart}
                                aria-label="Закрыть"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* ==================================================
                            BODY
                        ================================================== */}

                        <div className="cart__body">
                            {status === 'success' ? (
                                <div className="cart__success">
                                    <div className="cart__success-icon">
                                        <FaCheckCircle />
                                    </div>

                                    <h3>
                                        Заказ отправлен!
                                    </h3>

                                    <p>
                                        Мы свяжемся с вами
                                        в ближайшее время
                                        для подтверждения
                                        заказа.
                                    </p>

                                    <span className="cart__success-phone">
                                        +998 99 120 27 00
                                    </span>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="cart__empty">
                                    <div className="cart__empty-icon">
                                        <FaShoppingBag />
                                    </div>

                                    <p>
                                        Корзина пуста
                                    </p>

                                    <span>
                                        Добавьте блюда из меню
                                    </span>

                                    <button
                                        className="cart__empty-btn"
                                        onClick={closeCart}
                                    >
                                        Перейти в меню
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* ==================================================
                                        PRODUCTS
                                    ================================================== */}

                                    <div className="cart__items">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="cart-item"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="cart-item__img"
                                                />

                                                <div className="cart-item__info">
                                                    <h4 className="cart-item__name">
                                                        {item.name}
                                                    </h4>

                                                    <span className="cart-item__price">
                                                        {(
                                                            item.price *
                                                            item.qty
                                                        ).toLocaleString()}{' '}
                                                        сум
                                                    </span>
                                                </div>

                                                <div className="cart-item__controls">
                                                    <button
                                                        onClick={() =>
                                                            decrement(
                                                                item.id
                                                            )
                                                        }
                                                        aria-label="Уменьшить"
                                                    >
                                                        <FaMinus />
                                                    </button>

                                                    <span>
                                                        {item.qty}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            increment(
                                                                item.id
                                                            )
                                                        }
                                                        aria-label="Увеличить"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>

                                                <button
                                                    className="cart-item__remove"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.id
                                                        )
                                                    }
                                                    aria-label="Удалить"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            className="cart__clear"
                                            onClick={clear}
                                            type="button"
                                        >
                                            <FaTrash />

                                            <span>
                                                Очистить корзину
                                            </span>
                                        </button>
                                    </div>

                                    {/* ==================================================
                                        FORM
                                    ================================================== */}

                                    <form
                                        className="cart__form"
                                        onSubmit={submit}
                                    >
                                        {/* DELIVERY / PICKUP */}

                                        <div className="cart__form-tabs">
                                            <button
                                                type="button"
                                                className={`cart__tab ${
                                                    form.type ===
                                                    'delivery'
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    update(
                                                        'type',
                                                        'delivery'
                                                    )
                                                }
                                            >
                                                <FaTruck />

                                                <span>
                                                    Доставка
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                className={`cart__tab ${
                                                    form.type ===
                                                    'pickup'
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    update(
                                                        'type',
                                                        'pickup'
                                                    )
                                                }
                                            >
                                                <FaStore />

                                                <span>
                                                    Самовывоз
                                                </span>
                                            </button>
                                        </div>

                                        {/* NAME */}

                                        <div className="cart__field">
                                            <FaUser className="cart__field-icon" />

                                            <input
                                                type="text"
                                                placeholder="Ваше имя"
                                                value={form.name}
                                                onChange={(e) =>
                                                    update(
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="name"
                                            />
                                        </div>

                                        {/* PHONE */}

                                        <div className="cart__field">
                                            <FaPhoneAlt className="cart__field-icon" />

                                            <input
                                                type="tel"
                                                placeholder="+998 __ ___ __ __"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    update(
                                                        'phone',
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="tel"
                                            />
                                        </div>

                                        {/* ==================================================
                                            DELIVERY
                                        ================================================== */}

                                        {form.type ===
                                        'delivery' ? (
                                            <>
                                                <div className="cart__address">
                                                    <div className="cart__address-label">
                                                        <FaMapMarkerAlt />

                                                        <span>
                                                            Адрес доставки
                                                        </span>
                                                    </div>

                                                    {form.address ? (
                                                        <div className="cart__address-value">
                                                            <span>
                                                                {
                                                                    form.address
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="cart__address-empty">
                                                            Определите
                                                            адрес или
                                                            выберите
                                                            точку на
                                                            карте
                                                        </div>
                                                    )}

                                                    <div className="cart__address-actions">
                                                        {/* GPS теперь находится внутри LocationMap */}

                                                        <button
                                                            type="button"
                                                            className="cart__address-btn cart__address-btn--primary"
                                                            onClick={
                                                                openMap
                                                            }
                                                        >
                                                            <FaLocationArrow />

                                                            <span>
                                                                {form.address
                                                                    ? 'Изменить местоположение'
                                                                    : 'Определить адрес'}
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="cart__address-btn cart__address-btn--ghost"
                                                            onClick={() =>
                                                                setShowMap(
                                                                    (v) =>
                                                                        !v
                                                                )
                                                            }
                                                        >
                                                            {showMap ? (
                                                                <>
                                                                    <FaTimes />

                                                                    <span>
                                                                        Скрыть
                                                                        карту
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaEdit />

                                                                    <span>
                                                                        Выбрать
                                                                        на
                                                                        карте
                                                                    </span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ==================================================
                                                    MAP
                                                ================================================== */}

                                                {showMap && (
                                                    <div className="cart__map">
                                                        <LocationMap
                                                            coords={
                                                                coords
                                                            }
                                                            onPick={
                                                                handlePick
                                                            }
                                                            onAddressFound={
                                                                handleAddressFound
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="cart__pickup-info">
                                                <FaStore />

                                                <div>
                                                    <strong>
                                                        Самовывоз
                                                    </strong>

                                                    <span>
                                                        {
                                                            DEFAULT_ADDRESS
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* COMMENT */}

                                        <div className="cart__field cart__field--textarea">
                                            <FaCommentAlt className="cart__field-icon" />

                                            <textarea
                                                placeholder="Комментарий к заказу"
                                                value={
                                                    form.comment
                                                }
                                                onChange={(e) =>
                                                    update(
                                                        'comment',
                                                        e.target.value
                                                    )
                                                }
                                                rows={2}
                                            />
                                        </div>

                                        {error && (
                                            <div className="cart__error">
                                                {error}
                                            </div>
                                        )}
                                    </form>
                                </>
                            )}
                        </div>

                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        {items.length > 0 &&
                            status !== 'success' && (
                                <div className="cart__footer">
                                    <div className="cart__total">
                                        <span>
                                            Итого
                                        </span>

                                        <strong>
                                            {totalPrice.toLocaleString()}{' '}
                                            сум
                                        </strong>
                                    </div>

                                    <button
                                        className="cart__submit"
                                        onClick={submit}
                                        disabled={
                                            status ===
                                            'sending'
                                        }
                                        type="button"
                                    >
                                        {status ===
                                        'sending' ? (
                                            <>
                                                <span className="cart__spinner" />

                                                <span>
                                                    Отправляем...
                                                </span>
                                            </>
                                        ) : (
                                            <span>
                                                Оформить заказ
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            )}
        </>
    );
}
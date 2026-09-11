import { FaMapMarkerAlt, FaPhoneAlt, FaTelegramPlane, FaInstagram, FaTruck, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import './contacts.css';

export const metadata = {
    title: 'Контакты — адрес, телефон, доставка',
    description:
        'Mega Sushi в Бухаре: Abdulazim Somiy 48a. Телефон +998 99 120 27 00. Доставка без выходных с 10:00 до 02:00. Telegram, Instagram, карта проезда.',
    alternates: { canonical: '/contacts' },
    openGraph: {
        title: 'Контакты — Mega Sushi Бухара',
        description: 'Адрес, телефон, соцсети и карта. Доставка суши по всей Бухаре.',
        url: '/contacts',
        type: 'website',
    },
};

const CONTACTS = [
    {
        icon: FaMapMarkerAlt,
        title: 'Адрес',
        text: (
            <>
                Abdulazim Somiy 48a,<br />Bukhara 200105
            </>
        ),
        link: {
            href: 'https://yandex.uz/maps/?pt=64.404867,39.743227&z=17&l=map',
            label: 'Открыть на карте',
        },
    },
    {
        icon: FaPhoneAlt,
        title: 'Телефон',
        text: (
            <>
                Доставка без выходных<br />с 10:00 до 02:00
            </>
        ),
        link: { href: 'tel:+998991202700', label: '+998 99 120 27 00' },
    },
    {
        icon: FaTelegramPlane,
        title: 'Telegram',
        text: 'Наш бот для заказов',
        link: { href: 'https://t.me/megasushi_bot', label: '@megasushi_bot' },
    },
    {
        icon: FaInstagram,
        title: 'Instagram',
        text: 'Следите за новостями',
        link: {
            href: 'https://www.instagram.com/mega_sushi_bukhara/',
            label: '@mega_sushi_bukhara',
        },
    },
    {
        icon: FaTruck,
        title: 'Доставка',
        text: (
            <>
                Доставляем по всей Бухаре.<br />Самовывоз: Abdulazim Somiy 48a
            </>
        ),
    },
    {
        icon: FaClock,
        title: 'Режим работы',
        text: (
            <>
                Понедельник — Воскресенье<br />10:00 — 02:00
            </>
        ),
    },
];

export default function ContactsPage() {
    return (
        <div className="contacts">
            <div className="container">
                <div className="contacts__head">
                    <h1 className="contacts__title">Контакты</h1>
                    <p className="contacts__subtitle">
                        Мы всегда рады помочь — свяжитесь удобным способом
                    </p>
                </div>

                <div className="contacts__grid">
                    {CONTACTS.map((c) => {
                        const Icon = c.icon;
                        const isExternal = c.link?.href?.startsWith('http');

                        return (
                            <div className="contacts__card" key={c.title}>
                                <div className="contacts__icon">
                                    <Icon />
                                </div>
                                <h3 className="contacts__card-title">{c.title}</h3>
                                <p className="contacts__card-text">{c.text}</p>
                                {c.link && (
                                    <a
                                        href={c.link.href}
                                        className="contacts__link"
                                        {...(isExternal
                                            ? { target: '_blank', rel: 'noreferrer noopener' }
                                            : {})}
                                    >
                                        <span>{c.link.label}</span>
                                        {isExternal && <FaExternalLinkAlt />}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="contacts__map">
                    <iframe
                        src="https://yandex.uz/map-widget/v1/?pt=64.404867,39.743227&z=17&l=map"
                        frameBorder="0"
                        allowFullScreen
                        loading="lazy"
                        title="Mega Sushi на карте — Abdulazim Somiy 48a, Бухара"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
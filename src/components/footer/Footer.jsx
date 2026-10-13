import Link from 'next/link';
import Image from 'next/image';
import {
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaTelegramPlane,
    FaInstagram,
    FaClock,
} from 'react-icons/fa';
import './footer.css';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer__inner">
                {/* ---------- Колонка 1: Лого + описание ---------- */}
                <div className="footer__col footer__col--brand">
                    <Link href="/" className="footer__logo" aria-label="Mega Sushi — на главную">
                        <Image
                            src="/images/logo.png"
                            alt="Mega Sushi"
                            width={40}
                            height={40}
                            className="footer__logo-img"
                        />
                        <span className="footer__logo-text">
                            Mega<span>Sushi</span>
                        </span>
                    </Link>

                    <p className="footer__desc">
                        Свежие суши и роллы с доставкой по Бухаре. Работаем без выходных
                        с 10:00 до 02:00.
                    </p>

                    <div className="footer__hours">
                        <FaClock />
                        <span>Ежедневно 10:00 — 02:00</span>
                    </div>
                </div>

                {/* ---------- Колонка 2: Навигация ---------- */}
                <div className="footer__col">
                    <h4 className="footer__title">Навигация</h4>
                    <Link href="/" className="footer__link">
                        Главная
                    </Link>
                    <Link href="/#menu" className="footer__link">
                        Меню
                    </Link>
                    <Link href="/contacts" className="footer__link">
                        Контакты
                    </Link>
                </div>

                {/* ---------- Колонка 3: Контакты ---------- */}
                <div className="footer__col">
                    <h4 className="footer__title">Контакты</h4>

                    <a href="tel:+998991202700" className="footer__link">
                        <FaPhoneAlt className="footer__link-icon" />
                        <span>+998 99 120 27 00</span>
                    </a>

                    <span className="footer__link footer__link--static">
                        <FaMapMarkerAlt className="footer__link-icon" />
                        <span>Abdulazim Somiy 48a, Bukhara</span>
                    </span>

                    <div className="footer__socials">
                        <a
                            href="https://t.me/megasushi_bot"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="footer__social"
                            aria-label="Telegram"
                        >
                            <FaTelegramPlane />
                        </a>
                        <a
                            href="https://www.instagram.com/mega_sushi_bukhara/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="footer__social"
                            aria-label="Instagram"
                        >
                            <FaInstagram />
                        </a>
                    </div>
                </div>
            </div>

            {/* ---------- Нижняя строка ---------- */}
            <div className="footer__bottom container">
                <span className="footer__copyright">
                    © {year} Mega Sushi. Все права защищены.
                </span>
                <span className="footer__dev">
                    Разработчик —{' '}
                    <a
                        href="https://www.akbarsoft.uz"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Akbar Soft
                    </a>
                </span>
            </div>
        </footer>
    );
}
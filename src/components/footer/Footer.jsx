import Link from 'next/link';
import './footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer__inner">
                <div className="footer__col">
                    <div className="footer__logo">
                        <span>🍣</span> Mega<span style={{ color: 'var(--accent)' }}>Sushi</span>
                    </div>
                    <p className="footer__desc">
                        Свежие суши и роллы с доставкой по Бухаре. Работаем без выходных с 10:00 до 2:00.
                    </p>
                </div>

                <div className="footer__col">
                    <h4>Навигация</h4>
                    <Link href="/">Главная</Link>
                    <Link href="/contacts">Контакты</Link>
                    <a href="#menu">Меню</a>
                </div>

                <div className="footer__col">
                    <h4>Контакты</h4>
                    <a href="tel:+998991202700">+998 99 120 27 00</a>
                    <span>Abdulazim Somiy 48a, Bukhara</span>
                    <a href="https://www.instagram.com/mega_sushi_bukhara/" target="_blank" rel="noreferrer">
                        Instagram
                    </a>
                    <a href="https://t.me/megasushi_bot" target="_blank" rel="noreferrer">
                        Telegram
                    </a>
                </div>
            </div>

            <div className="footer__bottom container">
                <span>© {new Date().getFullYear()} Mega Sushi. Все права защищены.</span>
            </div>
        </footer>
    );
}
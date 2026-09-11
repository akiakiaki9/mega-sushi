import './contacts.css';

export const metadata = {
    title: 'Контакты — Mega Sushi',
    description: 'Адрес, телефон и соцсети Mega Sushi в Бухаре',
};

export default function ContactsPage() {
    return (
        <div className="contacts">
            <div className="container">
                <div className="contacts__head">
                    <h1 className="contacts__title">Контакты</h1>
                    <p className="contacts__subtitle">Мы всегда рады помочь — свяжитесь удобным способом</p>
                </div>

                <div className="contacts__grid">
                    <div className="contacts__card">
                        <div className="contacts__icon">📍</div>
                        <h3>Адрес</h3>
                        <p>Abdulazim Somiy 48a,<br />Bukhara 200105</p>
                        <a
                            href="https://yandex.uz/maps/?pt=64.404867,39.743227&z=17&l=map"
                            target="_blank"
                            rel="noreferrer"
                            className="contacts__link"
                        >
                            Открыть на карте →
                        </a>
                    </div>

                    <div className="contacts__card">
                        <div className="contacts__icon">📞</div>
                        <h3>Телефон</h3>
                        <p>Доставка без выходных<br />с 10:00 до 2:00</p>
                        <a href="tel:+998991202700" className="contacts__link">
                            +998 99 120 27 00 →
                        </a>
                    </div>

                    <div className="contacts__card">
                        <div className="contacts__icon">✈️</div>
                        <h3>Telegram</h3>
                        <p>Наш бот для заказов</p>
                        <a
                            href="https://t.me/megasushi_bot"
                            target="_blank"
                            rel="noreferrer"
                            className="contacts__link"
                        >
                            @megasushi_bot →
                        </a>
                    </div>

                    <div className="contacts__card">
                        <div className="contacts__icon">📸</div>
                        <h3>Instagram</h3>
                        <p>Следите за новостями</p>
                        <a
                            href="https://www.instagram.com/mega_sushi_bukhara/"
                            target="_blank"
                            rel="noreferrer"
                            className="contacts__link"
                        >
                            @mega_sushi_bukhara →
                        </a>
                    </div>

                    <div className="contacts__card">
                        <div className="contacts__icon">🚚</div>
                        <h3>Доставка</h3>
                        <p>Доставляем по всей Бухаре.<br />Самовывоз: Abdulazim Somiy 48a</p>
                    </div>

                    <div className="contacts__card">
                        <div className="contacts__icon">🕒</div>
                        <h3>Режим работы</h3>
                        <p>Понедельник — Воскресенье<br />10:00 — 02:00</p>
                    </div>
                </div>

                <div className="contacts__map">
                    <iframe
                        src="https://yandex.uz/map-widget/v1/?pt=64.404867,39.743227&z=17&l=map"
                        frameBorder="0"
                        allowFullScreen
                        title="Mega Sushi на карте"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
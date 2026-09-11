import Image from 'next/image';
import { FaTruck, FaClock, FaLeaf, FaPhoneAlt, FaUtensils } from 'react-icons/fa';
import './hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true"></div>

      <div className="container hero__inner">
        <div className="hero__content">
          <div className="hero__badge">
            <FaClock className="hero__badge-icon" />
            <span>Доставка 10:00 — 02:00</span>
          </div>

          <h1 className="hero__title">
            Свежие суши
            <br />
            в <span>Бухаре</span>
          </h1>

          <p className="hero__subtitle">
            Готовим из свежих ингредиентов и доставляем за 60 минут.
            Работаем без выходных.
          </p>

          <div className="hero__actions">
            <a href="#menu" className="hero__btn hero__btn--primary">
              <FaUtensils />
              <span>Смотреть меню</span>
            </a>
            <a href="tel:+998991202700" className="hero__btn hero__btn--ghost">
              <FaPhoneAlt />
              <span>+998 99 120 27 00</span>
            </a>
          </div>

          <div className="hero__features">
            <div className="hero__feature">
              <span className="hero__feature-icon">
                <FaTruck />
              </span>
              <span className="hero__feature-text">Быстрая доставка</span>
            </div>
            <div className="hero__feature">
              <span className="hero__feature-icon">
                <FaLeaf />
              </span>
              <span className="hero__feature-text">Свежие ингредиенты</span>
            </div>
            <div className="hero__feature">
              <span className="hero__feature-icon">
                <FaClock />
              </span>
              <span className="hero__feature-text">Работаем до 2:00</span>
            </div>
          </div>
        </div>

        <div className="hero__image">
          <div className="hero__image-glow" aria-hidden="true"></div>
          <Image
            src="/images/hero.PNG"
            alt="Свежие суши Mega Sushi"
            width={640}
            height={640}
            priority
            className="hero__image-img"
          />
        </div>
      </div>
    </section>
  );
}
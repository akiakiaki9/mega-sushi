'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaTelegramPlane, FaInstagram, FaPhoneAlt } from 'react-icons/fa';
import './navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Главная' },
    { href: '/#menu', label: 'Меню', hash: true },
    { href: '/contacts', label: 'Контакты' },
  ];

  // Блокируем скролл body при открытом мобильном меню
  useEffect(() => {
    if (mobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileOpen]);

  // Закрываем меню при смене роута
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Закрываем меню на resize (если вернулись к desktop)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  // Escape закрывает меню
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (l) => {
    if (l.hash) return false;
    return pathname === l.href;
  };

  const handleMenuClick = (e, l) => {
    setMobileOpen(false);

    if (l.hash) {
      e.preventDefault();
      if (pathname === '/') {
        const el = document.getElementById('menu');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        router.push(l.href);
      }
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner container">
          <Link
            href="/"
            className="navbar__logo"
            onClick={() => setMobileOpen(false)}
            aria-label="Mega Sushi — на главную"
          >
            <Image
              src="/images/logo.png"
              alt="Mega Sushi"
              width={44}
              height={44}
              className="navbar__logo-img"
              priority
            />
            <span className="navbar__logo-text">
              Mega<span>Sushi</span>
            </span>
          </Link>

          <nav
            className={`navbar__nav ${mobileOpen ? 'navbar__nav--open' : ''}`}
          >
            <div className="navbar__nav-inner">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`navbar__link ${
                    isActive(l) ? 'navbar__link--active' : ''
                  }`}
                  onClick={(e) => handleMenuClick(e, l)}
                >
                  {l.label}
                </Link>
              ))}

              <a
                href="tel:+998991202700"
                className="navbar__phone"
                onClick={() => setMobileOpen(false)}
              >
                <FaPhoneAlt className="navbar__phone-icon" />
                <span>+998 99 120 27 00</span>
              </a>

              {/* Соцсети — на мобилке внизу меню */}
              <div className="navbar__socials navbar__socials--mobile">
                <a
                  href="https://t.me/megasushi_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="navbar__social"
                  aria-label="Telegram"
                >
                  <FaTelegramPlane />
                </a>
                <a
                  href="https://www.instagram.com/mega_sushi_bukhara/"
                  target="_blank"
                  rel="noreferrer"
                  className="navbar__social"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>
          </nav>

          {/* Соцсети — на десктопе справа */}
          <div className="navbar__socials navbar__socials--desktop">
            <a
              href="https://t.me/megasushi_bot"
              target="_blank"
              rel="noreferrer"
              className="navbar__social"
              aria-label="Telegram"
            >
              <FaTelegramPlane />
            </a>
            <a
              href="https://www.instagram.com/mega_sushi_bukhara/"
              target="_blank"
              rel="noreferrer"
              className="navbar__social"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          </div>

          <button
            className="navbar__burger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
          >
            <span className={mobileOpen ? 'open' : ''}></span>
          </button>
        </div>
      </header>

      <div
        className={`navbar__backdrop ${mobileOpen ? 'navbar__backdrop--open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
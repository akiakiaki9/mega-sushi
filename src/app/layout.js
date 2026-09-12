import Navbar from '@/components/navbar/Navbar';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Footer from '@/components/footer/Footer';
import Cart from '@/components/cart/Cart';

const SITE_URL = 'https://www.megasushi.uz';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Доставка суши и роллов в Бухаре | Mega Sushi',
    template: '%s | Mega Sushi',
  },
  description:
    'Свежие суши и роллы с доставкой по Бухаре. Работаем без выходных с 10:00 до 2:00.',
  keywords: ['суши Бухара', 'роллы Бухара', 'доставка суши Бухара', 'Mega Sushi'],
  alternates: { canonical: '/' },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Mega Sushi',
    title: 'Доставка суши и роллов в Бухаре | Mega Sushi',
    description: 'Свежие суши и роллы с доставкой по Бухаре.',
    images: ['/images/logo.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0d',
};

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Mega Sushi',
  description: 'Свежие суши и роллы с доставкой по Бухаре',
  url: SITE_URL,
  telephone: '+998991202700',
  image: `${SITE_URL}/images/logo.png`,
  logo: `${SITE_URL}/images/logo.png`,
  servesCuisine: ['Japanese', 'Sushi'],
  priceRange: '20 000 – 400 000 сум',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Abdulazim Somiy 48a',
    addressLocality: 'Bukhara',
    postalCode: '200105',
    addressCountry: 'UZ',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 39.743227, longitude: 64.404867 },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '10:00',
    closes: '02:00',
  },
  sameAs: [
    'https://www.instagram.com/mega_sushi_bukhara/',
    'https://t.me/megasushi_bot',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Cart />
        </CartProvider>
      </body>
    </html>
  );
}
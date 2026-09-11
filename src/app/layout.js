import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import Cart from '@/components/cart/Cart';

export const metadata = {
  title: 'Mega Sushi — Доставка суши в Бухаре',
  description: 'Свежие суши и роллы с доставкой по Бухаре. Работаем без выходных с 10:00 до 2:00.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
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
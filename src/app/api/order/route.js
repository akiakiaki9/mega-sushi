import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Координаты заведения (для построения маршрута)
const SHOP_LAT = 39.743227;
const SHOP_LNG = 64.404867;
const SHOP_ADDRESS = 'Abdulazim Somiy 48a, Bukhara';

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildRouteLinks(lat, lng) {
  // Google Maps — маршрут от заведения до клиента
  const googleRoute =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${SHOP_LAT},${SHOP_LNG}` +
    `&destination=${lat},${lng}` +
    `&travelmode=driving`;

  // Яндекс.Карты — маршрут от заведения до клиента
  const yandexRoute =
    `https://yandex.ru/maps/?rtext=${SHOP_LAT},${SHOP_LNG}~${lat},${lng}` +
    `&rtt=auto`;

  // Точка на карте (одна точка — место заказа)
  const yandexPoint =
    `https://yandex.ru/maps/?pt=${lng},${lat}&z=17&l=map`;

  return { googleRoute, yandexRoute, yandexPoint };
}

function buildMessage({ customer, items, totalPrice, totalCount }) {
  const typeLabel = customer.type === 'pickup' ? '🏪 Самовывоз' : '🚚 Доставка';

  const itemsText = items
    .map(
      (i) =>
        `• ${escapeHtml(i.name)} — ${i.qty} шт × ${i.price.toLocaleString()} = ${(i.price * i.qty).toLocaleString()} сум`
    )
    .join('\n');

  let addressBlock = '';
  if (customer.type === 'pickup') {
    addressBlock = `📍 <b>Забрать:</b> ${SHOP_ADDRESS}`;
  } else {
    addressBlock = `📍 <b>Адрес:</b> ${escapeHtml(customer.address)}`;

    if (customer.coords) {
      const { lat, lng } = customer.coords;
      const { googleRoute, yandexRoute, yandexPoint } = buildRouteLinks(lat, lng);

      addressBlock +=
        `\n\n🧭 <b>Маршрут от заведения:</b>\n` +
        `• <a href="${googleRoute}">Google Maps</a>\n` +
        `• <a href="${yandexRoute}">Яндекс.Карты</a>\n\n` +
        `📌 <a href="${yandexPoint}">Точка на карте</a> ` +
        `(${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }
  }

  return [
    '🍣 <b>НОВЫЙ ЗАКАЗ — Mega Sushi</b>',
    '',
    `<b>Тип:</b> ${typeLabel}`,
    `<b>Имя:</b> ${escapeHtml(customer.name)}`,
    `<b>Телефон:</b> ${escapeHtml(customer.phone)}`,
    addressBlock,
    customer.comment
      ? `\n💬 <b>Комментарий:</b> ${escapeHtml(customer.comment)}`
      : null,
    '',
    '🛒 <b>Состав заказа:</b>',
    itemsText,
    '',
    `<b>Позиций:</b> ${totalCount}`,
    `<b>Итого:</b> ${totalPrice.toLocaleString()} сум`,
    '',
    `🕒 ${new Date().toLocaleString('ru-RU', {
      timeZone: 'Asia/Tashkent',
    })}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, totalPrice, totalCount } = body || {};

    if (!customer || !items || !items.length) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Telegram env vars are missing');
      return NextResponse.json(
        { error: 'Server is not configured' },
        { status: 500 }
      );
    }

    const message = buildMessage({ customer, items, totalPrice, totalCount });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        cache: 'no-store',
      }
    );

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error('Telegram error:', errText);
      return NextResponse.json(
        { error: 'Telegram send failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Order API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
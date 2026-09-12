import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

const SITE_URL = 'https://www.megasushi.uz';

// ==================== ДАННЫЕ ====================
const INFO = {
  phone: '+998 99 120 27 00',
  phoneRaw: '+998991202700',
  address: 'Abdulazim Somiy 48a, Бухара',
  hours: '10:00 — 02:00 (без выходных)',
  instagram: 'https://www.instagram.com/mega_sushi_bukhara/',
  mapLink: 'https://yandex.uz/maps/?pt=64.404867,39.743227&z=17&l=map',
  menuLink: `${SITE_URL}/#menu`,
};

// ==================== ТЕКСТЫ ====================
const WELCOME = `🍣 <b>Mega Sushi</b> — свежие суши с доставкой по Бухаре

⏰ Работаем <b>без выходных</b> с 10:00 до 02:00
🚚 Доставка по всей Бухаре за 60 минут
📞 Телефон: <a href="tel:${INFO.phoneRaw}">${INFO.phone}</a>

👇 Выберите действие ниже или сразу оформите заказ на сайте.`;

const MENU_TEXT = `🍱 <b>Наше меню</b>

Более <b>50 позиций</b>:
• 🍥 Роллы и запечённые роллы
• 🔥 Темпура (жареные)
• 🍣 Мини-роллы
• 🎁 Сеты для компании

Откройте меню на сайте и добавьте любимые блюда в корзину.`;

const CONTACTS_TEXT = `📞 <b>Связаться с нами</b>

<b>Телефон:</b> <a href="tel:${INFO.phoneRaw}">${INFO.phone}</a>
<b>Адрес:</b> ${INFO.address}
<b>Часы работы:</b> ${INFO.hours}

<b>Соцсети:</b>
📷 <a href="${INFO.instagram}">Instagram</a>
🗺 <a href="${INFO.mapLink}">Мы на карте</a>`;

const DELIVERY_TEXT = `🚚 <b>Доставка и оплата</b>

• Доставляем по всей Бухаре
• Среднее время — <b>60 минут</b>
• Оплата: наличные или картой курьеру
• Самовывоз: ${INFO.address}

Хотите сделать заказ? Откройте меню 👇`;

// ==================== КЛАВИАТУРЫ ====================
const mainKeyboard = {
  inline_keyboard: [
    [{ text: '🛒 Заказать суши', url: INFO.menuLink }],
    [
      { text: '📋 Меню', callback_data: 'menu' },
      { text: '📞 Контакты', callback_data: 'contacts' },
    ],
    [{ text: '🚚 Доставка', callback_data: 'delivery' }],
    [
      { text: '📷 Instagram', url: INFO.instagram },
      { text: '🗺 Карта', url: INFO.mapLink },
    ],
  ],
};

const backKeyboard = {
  inline_keyboard: [
    [{ text: '🛒 Заказать суши', url: INFO.menuLink }],
    [{ text: '⬅️ Назад', callback_data: 'back' }],
  ],
};

// ==================== TELEGRAM API ====================
async function tg(method, body) {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`Telegram ${method} error:`, text);
  }

  return res;
}

const sendMessage = (chat_id, text, reply_markup) =>
  tg('sendMessage', {
    chat_id,
    text,
    parse_mode: 'HTML',
    reply_markup,
    disable_web_page_preview: true,
  });

const editMessage = (chat_id, message_id, text, reply_markup) =>
  tg('editMessageText', {
    chat_id,
    message_id,
    text,
    parse_mode: 'HTML',
    reply_markup,
    disable_web_page_preview: true,
  });

const answerCallback = (callback_query_id) =>
  tg('answerCallbackQuery', { callback_query_id });

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ==================== ОБРАБОТЧИКИ ====================
async function handleStart(chat_id, firstName) {
  const greeting = firstName
    ? `Привет, <b>${escapeHtml(firstName)}</b>! 👋\n\n${WELCOME}`
    : WELCOME;

  await sendMessage(chat_id, greeting, mainKeyboard);
}

async function handleHelp(chat_id) {
  await sendMessage(
    chat_id,
    `ℹ️ <b>Что я умею</b>\n\n` +
      `• /start — главное меню\n` +
      `• /menu — открыть меню на сайте\n` +
      `• /contacts — контакты\n` +
      `• /delivery — условия доставки\n\n` +
      `Или просто напишите что угодно — я покажу кнопки.`,
    mainKeyboard
  );
}

async function handleCallback(query) {
  const { id, data, message } = query;
  const chat_id = message.chat.id;
  const message_id = message.message_id;

  await answerCallback(id);

  if (data === 'menu') {
    await editMessage(chat_id, message_id, MENU_TEXT, backKeyboard);
  } else if (data === 'contacts') {
    await editMessage(chat_id, message_id, CONTACTS_TEXT, backKeyboard);
  } else if (data === 'delivery') {
    await editMessage(chat_id, message_id, DELIVERY_TEXT, backKeyboard);
  } else if (data === 'back') {
    await editMessage(chat_id, message_id, WELCOME, mainKeyboard);
  }
}

// ==================== WEBHOOK ====================
export async function POST(request) {
  try {
    // Проверка секрета
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      console.warn('Invalid webhook secret');
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const update = await request.json();

    // ---------- Сообщения ----------
    if (update.message) {
      const { chat, text = '', from } = update.message;
      const chat_id = chat.id;
      const command = text.trim().toLowerCase().split(' ')[0];

      if (command === '/start') {
        await handleStart(chat_id, from?.first_name);
      } else if (command === '/menu') {
        await sendMessage(chat_id, MENU_TEXT, {
          inline_keyboard: [
            [{ text: '🍣 Открыть меню', url: INFO.menuLink }],
            [{ text: '⬅️ Назад', callback_data: 'back' }],
          ],
        });
      } else if (command === '/contacts') {
        await sendMessage(chat_id, CONTACTS_TEXT, backKeyboard);
      } else if (command === '/delivery') {
        await sendMessage(chat_id, DELIVERY_TEXT, backKeyboard);
      } else if (command === '/help') {
        await handleHelp(chat_id);
      } else {
        await sendMessage(
          chat_id,
          `Выберите действие ниже 👇`,
          mainKeyboard
        );
      }
    }

    // ---------- Inline-кнопки ----------
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
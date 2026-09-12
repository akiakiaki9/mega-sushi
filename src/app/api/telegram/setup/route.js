import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// 👇 Хардкод домена
const SITE_URL = 'https://megasushi.uz';

const SHORT_DESCRIPTION =
    '🍣 Mega Sushi — доставка суши и роллов в Бухаре. Работаем с 10:00 до 02:00.';

const DESCRIPTION = `🍣 Mega Sushi — свежие суши и роллы с доставкой по Бухаре.

⏰ Работаем без выходных с 10:00 до 02:00
🚚 Доставка по городу за 60 минут
💳 Оплата наличными или картой курьеру
📞 +998 99 120 27 00

Более 50 позиций: роллы, сеты, темпура и мини-роллы.

👇 Нажмите "Запустить" — и выберите блюда из меню.`;

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

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error(`Telegram ${method} error:`, data);
    }

    return data;
}

export async function GET(request) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'set';

    if (!BOT_TOKEN) {
        return NextResponse.json(
            { ok: false, error: 'BOT_TOKEN not configured' },
            { status: 500 }
        );
    }

    // ---------- SET ----------
    if (action === 'set') {
        const webhookUrl = `${SITE_URL}/api/telegram/webhook`;

        const webhook = await tg('setWebhook', {
            url: webhookUrl,
            secret_token: WEBHOOK_SECRET || undefined,
            allowed_updates: ['message', 'callback_query'],
            drop_pending_updates: true,
        });

        const commands = await tg('setMyCommands', {
            commands: [
                { command: 'start', description: '🏠 Главное меню' },
                { command: 'menu', description: '🍣 Открыть меню' },
                { command: 'contacts', description: '📞 Контакты' },
                { command: 'delivery', description: '🚚 Доставка' },
                { command: 'help', description: 'ℹ️ Помощь' },
            ],
        });

        const shortDescription = await tg('setMyShortDescription', {
            short_description: SHORT_DESCRIPTION,
            language_code: 'ru',
        });

        const description = await tg('setMyDescription', {
            description: DESCRIPTION,
            language_code: 'ru',
        });

        return NextResponse.json({
            ok: true,
            action: 'set',
            webhookUrl,
            results: { webhook, commands, shortDescription, description },
        });
    }

    // ---------- DELETE ----------
    if (action === 'delete') {
        const result = await tg('deleteWebhook', {});
        return NextResponse.json({ ok: true, action: 'delete', result });
    }

    // ---------- INFO ----------
    if (action === 'info') {
        const webhook = await tg('getWebhookInfo', {});
        const commands = await tg('getMyCommands', {});
        const shortDesc = await tg('getMyShortDescription', { language_code: 'ru' });
        const desc = await tg('getMyDescription', { language_code: 'ru' });

        return NextResponse.json({
            ok: true,
            action: 'info',
            telegram: { webhook, commands, shortDescription: shortDesc, description: desc },
        });
    }

    return NextResponse.json(
        { ok: false, error: 'Unknown action' },
        { status: 400 }
    );
}
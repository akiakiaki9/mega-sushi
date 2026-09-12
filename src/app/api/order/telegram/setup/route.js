import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function GET(request) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'set';

    if (!BOT_TOKEN) {
        return NextResponse.json(
            { ok: false, error: 'BOT_TOKEN not configured' },
            { status: 500 }
        );
    }

    try {
        if (action === 'set') {
            // -------- Устанавливаем webhook --------
            if (!SITE_URL) {
                return NextResponse.json(
                    { ok: false, error: 'SITE_URL not configured' },
                    { status: 500 }
                );
            }

            const webhookUrl = `${SITE_URL}/api/telegram/webhook`;

            const res = await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: webhookUrl,
                        secret_token: WEBHOOK_SECRET || undefined,
                        allowed_updates: ['message', 'callback_query'],
                        drop_pending_updates: true,
                    }),
                }
            );

            const data = await res.json();

            // Устанавливаем команды бота
            await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        commands: [
                            { command: 'start', description: '🏠 Главное меню' },
                            { command: 'menu', description: '🍣 Открыть меню' },
                            { command: 'contacts', description: '📞 Контакты' },
                            { command: 'delivery', description: '🚚 Доставка' },
                            { command: 'help', description: 'ℹ️ Помощь' },
                        ],
                    }),
                }
            );

            return NextResponse.json({
                ok: true,
                action: 'set',
                webhookUrl,
                telegram: data,
            });
        }

        if (action === 'delete') {
            // -------- Удаляем webhook --------
            const res = await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
                { method: 'POST' }
            );
            const data = await res.json();

            return NextResponse.json({ ok: true, action: 'delete', telegram: data });
        }

        if (action === 'info') {
            // -------- Информация о webhook --------
            const res = await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
            );
            const data = await res.json();

            return NextResponse.json({ ok: true, action: 'info', telegram: data });
        }

        return NextResponse.json(
            { ok: false, error: 'Unknown action' },
            { status: 400 }
        );
    } catch (err) {
        console.error('Setup error:', err);
        return NextResponse.json(
            { ok: false, error: err.message },
            { status: 500 }
        );
    }
}
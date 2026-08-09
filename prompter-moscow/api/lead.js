/* =========================================================
   /api/lead — приём заявки и отправка её в Telegram.

   Токен бота и chat_id читаются ТОЛЬКО из переменных окружения:
   process.env.TG_TOKEN и process.env.TG_CHAT_ID.
   В браузер они не попадают: этот файл выполняется на сервере Vercel.

   Дублирование на почту — необязательное. Если заданы RESEND_API_KEY,
   MAIL_TO и MAIL_FROM, та же заявка уходит письмом. Если не заданы,
   сайт работает ровно как раньше, только через Telegram.
   ========================================================= */

/* Домены, с которых разрешено отправлять форму. */
var ALLOWED_HOSTS = [
  'prompter-ai.moscow',
  'www.prompter-ai.moscow'
];

/* Ограничение частоты: не больше 3 заявок в минуту с одного IP.
   Счётчик живёт в памяти работающего экземпляра функции. Vercel может
   поднять несколько экземпляров, поэтому это защита от простого спама,
   а не строгая квота. */
var RATE_MAX = 3;
var RATE_WINDOW_MS = 60 * 1000;
var hits = new Map();

function isAllowedOrigin(origin) {
  if (!origin) return false;

  var url;
  try {
    url = new URL(origin);
  } catch (e) {
    return false;
  }

  var host = url.hostname;

  if (ALLOWED_HOSTS.indexOf(host) !== -1) return true;

  // Локальная разработка.
  if (host === 'localhost' || host === '127.0.0.1') return true;

  // Превью-домены Vercel, чтобы можно было проверить форму до привязки домена.
  if (/\.vercel\.app$/.test(host)) return true;

  return false;
}

function clientIp(req) {
  var fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).trim();
  return req.headers['x-real-ip'] || 'unknown';
}

function rateLimited(ip) {
  var now = Date.now();
  var list = (hits.get(ip) || []).filter(function (t) { return now - t < RATE_WINDOW_MS; });

  if (list.length >= RATE_MAX) {
    hits.set(ip, list);
    return true;
  }

  list.push(now);
  hits.set(ip, list);

  // Периодическая чистка, чтобы Map не рос бесконечно.
  if (hits.size > 500) {
    hits.forEach(function (times, key) {
      var alive = times.filter(function (t) { return now - t < RATE_WINDOW_MS; });
      if (alive.length) hits.set(key, alive); else hits.delete(key);
    });
  }

  return false;
}

/* Убираем управляющие символы и переносы строк, схлопываем пробелы,
   режем по длине. Так в сообщение бота не попадёт мусор или разметка. */
function clean(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function moscowTime() {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date()) + ' МСК';
  } catch (e) {
    return new Date().toISOString();
  }
}

/* Письмо с заявкой. Отправляется через HTTP API Resend, поэтому
   в проекте не появляется ни одной npm-зависимости.
   Возвращает true/false и никогда не бросает исключение: почта —
   дополнительный канал, её сбой не должен влиять на ответ клиенту. */
async function sendMail(fields, when) {
  var key = process.env.RESEND_API_KEY;
  var to = process.env.MAIL_TO;
  var from = process.env.MAIL_FROM;

  if (!key || !to || !from) return null;   // почта не настроена — это не ошибка

  var rows = [
    ['Имя', fields.name],
    ['Телефон', fields.phone],
    ['Почта', fields.email],
    ['Компания', fields.company],
    ['Род деятельности', fields.field],
    ['ЛПР', fields.dm],
    ['Время', when]
  ];

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111">' +
    '<h2 style="margin:0 0 16px">Новая заявка с сайта</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse">' +
    rows.map(function (r) {
      return '<tr>' +
        '<td style="border:1px solid #ddd;background:#f6f6f6"><b>' + escapeHtml(r[0]) + '</b></td>' +
        '<td style="border:1px solid #ddd">' + escapeHtml(r[1]) + '</td>' +
        '</tr>';
    }).join('') +
    '</table></div>';

  var text = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');

  try {
    var resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: to.split(',').map(function (a) { return a.trim(); }).filter(Boolean),
        reply_to: fields.email,
        subject: 'Заявка с сайта: ' + fields.name + ', ' + fields.company,
        text: text,
        html: html
      })
    });

    if (!resp.ok) {
      console.error('Письмо не отправлено:', resp.status, await resp.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Не удалось обратиться к почтовому сервису:', err);
    return false;
  }
}

/* Значения пользователя попадают в HTML письма, поэтому экранируем. */
function escapeHtml(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    return res.status(403).json({ ok: false, error: 'forbidden_origin' });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: 'too_many_requests' });
  }

  var token = process.env.TG_TOKEN;
  var chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) {
    console.error('TG_TOKEN или TG_CHAT_ID не заданы в переменных окружения');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  // Vercel сам разбирает JSON, но подстрахуемся на случай строки.
  var body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  var name = clean(body.name, 60);
  var phone = clean(body.phone, 25);
  var email = clean(body.email, 80);
  var company = clean(body.company, 80);
  var field = clean(body.field, 90);
  var dm = clean(body.dm, 10).toLowerCase();

  var digits = phone.replace(/\D/g, '');

  if (name.length < 2) return res.status(400).json({ ok: false, error: 'bad_name' });
  if (digits.length < 10 || digits.length > 12) return res.status(400).json({ ok: false, error: 'bad_phone' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ ok: false, error: 'bad_email' });
  if (company.length < 2) return res.status(400).json({ ok: false, error: 'bad_company' });
  if (field.length < 2) return res.status(400).json({ ok: false, error: 'bad_field' });
  if (dm !== 'да' && dm !== 'нет') return res.status(400).json({ ok: false, error: 'bad_dm' });

  var stamp = moscowTime();

  var text =
    '🆕 Новая заявка\n' +
    '👤 Имя: ' + name + '\n' +
    '📞 Телефон: ' + phone + '\n' +
    '📧 Почта: ' + email + '\n' +
    '🏢 Компания: ' + company + '\n' +
    '📦 Род деятельности: ' + field + '\n' +
    '👔 ЛПР: ' + dm + '\n' +
    '🕒 ' + stamp;

  try {
    var tg = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        disable_web_page_preview: true
      })
    });

    if (!tg.ok) {
      var detail = await tg.text();
      console.error('Telegram ответил ошибкой:', tg.status, detail);
      return res.status(502).json({ ok: false, error: 'telegram_failed' });
    }

    // Телеграм принял заявку. Дублируем письмом, если почта настроена;
    // её сбой не должен превращать принятую заявку в ошибку для клиента.
    var mailed = await sendMail(
      { name: name, phone: phone, email: email, company: company, field: field, dm: dm },
      stamp
    );

    return res.status(200).json({ ok: true, mailed: mailed });
  } catch (err) {
    console.error('Не удалось обратиться к Telegram:', err);
    return res.status(502).json({ ok: false, error: 'telegram_unreachable' });
  }
};

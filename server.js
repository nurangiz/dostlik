const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const TELEGRAM_BOT_TOKEN = '9089759537:AAFHoPgUyJFkjke1pkAkMheq9pQHHz5JgsU';
const TELEGRAM_CHAT_ID = '7290313985';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendTelegramMessage(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ ok: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  // CORS sarlavhalari
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 1. API: Maktubni Telegramga yuborish
  if (req.method === 'POST' && req.url === '/api/send-letter') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { friendName, message, senderName, theme } = JSON.parse(body);

        const now = new Date();
        const dateStr = now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

        const themeNames = {
          emerald: 'Zumrad Zangori (Mehr & Muruvvat)',
          sunset: 'Quyosh Nuri (Saxovat)',
          violet: 'Nilufar Nafisligi (Ezgulik)',
          sky: 'Moviy Tinchlik (Sadoqat)'
        };

        const telegramText = 
`💌 <b>YANGI MURUVVAT MAKTUBI!</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Kimga (Qabul qiluvchi):</b> ${escapeHtml(friendName || 'Doʻstim')}
💬 <b>Maktub matni:</b>
<i>"${escapeHtml(message || '')}"</i>

✍️ <b>Yuboruvchi:</b> ${escapeHtml(senderName || 'Sodiq doʻst')}
🎨 <b>Otkritka mavzusi:</b> ${themeNames[theme] || theme || 'Standart'}
⏰ <b>Vaqti:</b> ${dateStr}
━━━━━━━━━━━━━━━━━━━━━━
🌐 <i>"Doʻstlik va Muruvvat" veb-portalidan yuborildi</i>`;

        const tgResult = await sendTelegramMessage(telegramText);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, tgResult }));
      } catch (err) {
        console.error('Telegram API error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 2. Statik fayllarni uzatish
  let safePath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(__dirname, safePath === '/' ? 'index.html' : safePath);

  // Xavfsizlik: papkadan tashqariga chiqishni oldini olish
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Taqiqlangan');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Sahifa topilmadi');
      } else {
        res.writeHead(500);
        res.end(`Server xatosi: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

server.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}/`);
});

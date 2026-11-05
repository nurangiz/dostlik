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
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Telegramga matnli xabar yuborish
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
          resolve(JSON.parse(data));
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

// Telegramga rasm (Photo) yuborish (Multipart/form-data)
function sendTelegramPhoto(imageBuffer, caption = '', filename = 'muruvvat-maktubi.png') {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const safeCaption = (caption || '').substring(0, 1020);

    const preData = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="chat_id"\r\n\r\n` +
      `${TELEGRAM_CHAT_ID}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="caption"\r\n\r\n` +
      `${safeCaption}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="parse_mode"\r\n\r\n` +
      `HTML\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="photo"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`
    );

    const postData = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([preData, imageBuffer, postData]);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ ok: false, error: 'JSON parse error', raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(fullBody);
    req.end();
  });
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

  // 1. API: Maktub va Rasmlarni Telegram botga yuborish
  if (req.method === 'POST' && req.url === '/api/send-letter') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        const { friendName, message, senderName, theme, imageBase64, userPhotoBase64 } = JSON.parse(rawBody);

        const now = new Date();
        const dateStr = now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

        const themeNames = {
          emerald: 'Zumrad Zangori (Mehr & Muruvvat)',
          sunset: 'Quyosh Nuri (Saxovat)',
          violet: 'Nilufar Nafisligi (Ezgulik)',
          sky: 'Moviy Tinchlik (Sadoqat)'
        };

        const captionText = 
`💌 <b>YANGI MURUVVAT MAKTUBI!</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Kimga:</b> ${escapeHtml(friendName || 'Doʻstim')}
💬 <b>Maktub matni:</b>
<i>"${escapeHtml(message || '')}"</i>

✍️ <b>Yuboruvchi:</b> ${escapeHtml(senderName || 'Sodiq doʻst')}
🎨 <b>Mavzusi:</b> ${themeNames[theme] || theme || 'Standart'}
⏰ <b>Vaqti:</b> ${dateStr}
━━━━━━━━━━━━━━━━━━━━━━
🌐 <i>"Doʻstlik va Muruvvat" veb-portalidan yuborildi</i>`;

        let mainTgResult = null;

        // Agar Otkritka rasmi (imageBase64) bo'lsa, Telegramga Foto qilib yuboramiz
        if (imageBase64 && imageBase64.includes('base64,')) {
          const base64Data = imageBase64.split('base64,')[1];
          const cardBuffer = Buffer.from(base64Data, 'base64');
          mainTgResult = await sendTelegramPhoto(cardBuffer, captionText, 'muruvvat-maktubi.png');
        } else {
          // Aks holda matn qilib yuborish
          mainTgResult = await sendTelegramMessage(captionText);
        }

        // Agar foydalanuvchi qo'shimcha o'z rasmini ham biriktirgan bo'lsa, uni ham alohida foto qilib yuborish
        let userPhotoResult = null;
        if (userPhotoBase64 && userPhotoBase64.includes('base64,')) {
          try {
            const userPhotoData = userPhotoBase64.split('base64,')[1];
            const userPhotoBuffer = Buffer.from(userPhotoData, 'base64');
            const userPhotoCaption = `📸 <b>Biriktirilgan rasm:</b> ${escapeHtml(friendName || '')} va ${escapeHtml(senderName || '')} xotirasi uchun`;
            userPhotoResult = await sendTelegramPhoto(userPhotoBuffer, userPhotoCaption, 'dostlik-rasmi.jpg');
          } catch (pErr) {
            console.error('Foydalanuvchi rasmini yuborishda xatolik:', pErr);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, tgResult: mainTgResult, userPhotoResult }));
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

server.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}/`);
});

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'wishes.json');

// Bazani ishga tushirish (wishes.json mavjud bo'lmasa yaratish)
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Yordamchi funksiyalar
function readWishes() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Bazani o\'qishda xatolik:', err);
    return [];
  }
}

function writeWishes(wishes) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(wishes, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Bazaga yozishda xatolik:', err);
    return false;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

/* ═══════════════════════════════════
   REAL-TIME SSE (Server-Sent Events)
   ═══════════════════════════════════ */
const sseClients = new Set();

function broadcastUpdate() {
  const wishes = readWishes();
  const data = JSON.stringify(wishes);
  for (const client of sseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/wishes/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Hozirgi barcha tabriklarni darhol jo'natish
  const wishes = readWishes();
  res.write(`data: ${JSON.stringify(wishes)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

/* ═══════════════════════════════════
   REST API
   ═══════════════════════════════════ */

// 1. Barcha tabriklarni olish
app.get('/api/wishes', (req, res) => {
  const wishes = readWishes();
  res.json(wishes);
});

// 2. Yangi tabrik qo'shish
app.post('/api/wishes', (req, res) => {
  const { firstName, lastName, message } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring!" });
  }

  const wishes = readWishes();
  const newWish = {
    id: Date.now().toString(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  // Yangi tabrikni eng boshiga qo'shamiz (eng yangilari tepada chiqadi)
  wishes.unshift(newWish);
  writeWishes(wishes);

  // Real-time ulangan barcha foydalanuvchilar va adminga tarqatish
  broadcastUpdate();

  res.status(201).json(newWish);
});

// 3. Tabrikni o'chirish (Admin uchun)
app.delete('/api/wishes/:id', (req, res) => {
  const { id } = req.params;
  const pin = req.headers['x-admin-pin'];

  if (pin !== '20102026') {
    return res.status(403).json({ error: "Ruxsat berilmagan!" });
  }

  let wishes = readWishes();
  wishes = wishes.filter(w => w.id !== id);
  writeWishes(wishes);

  broadcastUpdate();

  res.json({ success: true });
});

/* ═══════════════════════════════════
   STATIC FRONTEND PRODUCTION SERVE
   ═══════════════════════════════════ */
// Deploy qilinganda dist papkasini bitta server orqali tarqatish
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================`);
  console.log(`🎊 To'y Wishbook Serveri ishga tushdi!`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`💾 Lokal Database: ${DB_FILE}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=================================================\n`);
});

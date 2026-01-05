require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'salone-lidia-supersecret-2026-change-in-production!!';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://admin.lidiazucaro.it',
    'https://admin.lidiazucaro.it',
    'https://salone-lidia-dashboards.netlify.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database
const db = new sqlite3.Database('salone.db');
console.log('🗄️ SQLite: salone.db');

// Init + Migrazione
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'client')) DEFAULT 'client',
    first_name TEXT,
    phone TEXT,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    service TEXT,
    date TEXT,
    time TEXT,
    points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'confermato',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users (id)
  )`);

  // MIGRAZIONE colonne mancanti
  const migrations = [
    'ALTER TABLE users ADD COLUMN first_name TEXT',
    'ALTER TABLE users ADD COLUMN phone TEXT', 
    'ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0'
  ];

  migrations.forEach(sql => {
    db.run(sql, function(err) {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`Migrazione ${sql}:`, err.message);
      }
    });
  });

  // Test users
  bcrypt.hash('admin123', 10, (err, adminHash) => {
    if (!err) {
      db.run(`INSERT OR IGNORE INTO users (username, password, role, first_name, phone, points) 
              VALUES (?, ?, 'admin', 'Lidia', '+39 333 1234567', 0)`, ['admin', adminHash]);
    }
  });

  bcrypt.hash('client123', 10, (err, clientHash) => {
    if (!err) {
      db.run(`INSERT OR IGNORE INTO users (username, password, role, first_name, phone, points) 
              VALUES (?, ?, 'client', 'Mario Rossi', '+39 333 9876543', 245)`, ['client', clientHash]);
    }
  });

  console.log('✅ DB + migrations complete');
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

// Routes
app.get('/api/ping', (req, res) => res.json({ 
  status: 'OK', 
  timestamp: new Date().toISOString(),
  routes: ['/api/auth/login', '/api/admin/stats', '/api/admin/clients']
}));

// AUTH LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenziali errate' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        first_name: user.first_name || '',
        points: user.points || 0
      }
    });
  });
});

// ADMIN STATS (SQL Fix)
app.get('/api/admin/stats', authenticateToken, adminOnly, (req, res) => {
  db.get(`
    SELECT 
      COUNT(CASE WHEN u.role = 'client' THEN 1 END) as total_clients,
      COALESCE(SUM(u.points), 0) as total_points,
      COUNT(a.id) as total_appointments
    FROM users u
    LEFT JOIN appointments a ON u.id = a.client_id
  `, (err, stats) => {
    if (err) {
      console.error('Stats SQL error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(stats || { total_clients: 0, total_points: 0, total_appointments: 0 });
  });
});

// ADMIN CLIENTS
app.get('/api/admin/clients', authenticateToken, adminOnly, (req, res) => {
  db.all(`
    SELECT id, username, first_name, phone, points, created_at 
    FROM users WHERE role = 'client' 
    ORDER BY created_at DESC
  `, (err, clients) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ clients, total: clients.length });
  });
});

// CLIENT PROFILE
app.get('/api/client/profile', authenticateToken, (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  
  db.get('SELECT id, username, first_name, phone, points FROM users WHERE id = ?', 
    [req.user.id], (err, profile) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(profile);
    });
});

// CLIENT APPOINTMENTS
app.get('/api/client/appointments', authenticateToken, (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
  
  db.all(`
    SELECT * FROM appointments 
    WHERE client_id = ? 
    ORDER BY date DESC, time ASC
  `, [req.user.id], (err, appointments) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ appointments });
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} non trovato` });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔴 SIGTERM - graceful shutdown');
  db.close((err) => {
    console.log('DB closed');
    process.exit(err ? 1 : 0);
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Salone Lidia API v1.0`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🔗 /api/ping | /api/auth/login | /api/admin/stats`);
  console.log(`👤 admin/admin123 | client/client123\n`);
});

module.exports = app;

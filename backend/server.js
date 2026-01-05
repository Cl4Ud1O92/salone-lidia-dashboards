require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'salone-lidia-secret-2026';

app.use(cors());
app.use(express.json());

// DB
const db = new sqlite3.Database('salone.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'client')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // User di test
  const adminHash = bcrypt.hashSync('admin123', 10);
  const clientHash = bcrypt.hashSync('client123', 10);
  db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', 'admin', adminHash, 'admin');
  db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', 'client', clientHash, 'client');
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/ping', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenziali invalide' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, role: user.role, username } });
  });
});

app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.all('SELECT COUNT(*) as total_clients FROM users WHERE role = "client"', (err, rows) => {
    res.json({ total_clients: rows[0].total_clients || 0 });
  });
});

app.listen(PORT, () => console.log(`Server su http://localhost:${PORT}`));

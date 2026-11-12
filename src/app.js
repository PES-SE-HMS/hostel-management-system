require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { requireLogin } = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 2 },
  })
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.get('/portal.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'portal.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => res.redirect('/login.html'));

module.exports = app;

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// FR-01: login with valid credentials; SEC-01: bcrypt-verified salted hashes
async function login(req, res) {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, password_hash, full_name, role FROM users WHERE username = ?',
      [username]
    );
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Could not start session' });
      req.session.user = { id: user.user_id, username: user.username, name: user.full_name, role: user.role };
      res.json({ message: 'Login successful', user: req.session.user });
    });
  } catch (e) {
    console.error('login error');
    res.status(500).json({ error: 'Server error' });
  }
}

// SEC-05: destroy session on logout
function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
}

function me(req, res) {
  res.json({ user: req.session.user });
}

module.exports = { login, logout, me };

const pool = require('../config/db');

// Wraps async handlers; never leaks internals in error responses (SEC-06)
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error('request failed:', e.code || 'error');
    res.status(500).json({ error: 'Server error' });
  });

async function studentIdFor(userId) {
  const [r] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
  return r[0] ? r[0].student_id : null;
}

// Strict calendar validation: Date.parse alone normalises impossible dates such as
// 2026-02-31 instead of rejecting them.
function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function isDateTime(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match || !isDate(match[1])) return false;
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = Number(match[4] || 0);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
}

module.exports = { pool, wrap, studentIdFor, isDate, isDateTime };

const pool = require('../config/db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SEC-03 / NFR-06: backend validation + normalisation
function validate(body, partial = false) {
  const errors = [];
  const out = {};
  const str = (k, max, required) => {
    if (body[k] === undefined || body[k] === null || String(body[k]).trim() === '') {
      if (required && !partial) errors.push(`${k} is required`);
      return;
    }
    const v = String(body[k]).trim();
    if (v.length > max) errors.push(`${k} must be at most ${max} characters`);
    out[k] = v;
  };
  str('srn', 20, true);
  str('name', 100, true);
  str('email', 100, true);
  str('phone', 15, false);
  str('course', 100, false);
  str('guardian_name', 100, false);
  str('guardian_phone', 15, false);
  if (out.srn) out.srn = out.srn.toUpperCase();
  if (out.email) {
    out.email = out.email.toLowerCase();
    if (!EMAIL_RE.test(out.email)) errors.push('email is invalid');
  }
  if (out.phone && !/^[0-9+\- ]{7,15}$/.test(out.phone)) errors.push('phone is invalid');
  if (body.year !== undefined && body.year !== null && body.year !== '') {
    const y = Number(body.year);
    if (!Number.isInteger(y) || y < 1 || y > 6) errors.push('year must be between 1 and 6');
    else out.year = y;
  }
  return { errors, data: out };
}

async function list(req, res) {
  try {
    const q = `%${String(req.query.q || '').trim()}%`;
    const [rows] = await pool.query(
      `SELECT s.student_id, s.srn, s.name, s.email, s.phone, s.course, s.year,
              r.room_number, b.bed_number
         FROM students s
         LEFT JOIN allocations a ON a.student_id = s.student_id AND a.status = 'active'
         LEFT JOIN beds b ON b.bed_id = a.bed_id
         LEFT JOIN rooms r ON r.room_id = b.room_id
        WHERE s.name LIKE ? OR s.srn LIKE ?
        ORDER BY s.srn`,
      [q, q]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function get(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function create(req, res) {
  const { errors, data } = validate(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
  try {
    const [r] = await pool.query('INSERT INTO students SET ?', [data]);
    res.status(201).json({ message: 'Student created', student_id: r.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'SRN or email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
}

async function update(req, res) {
  const { errors, data } = validate(req.body, true);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
  if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields to update' });
  try {
    const [r] = await pool.query('UPDATE students SET ? WHERE student_id = ?', [data, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'SRN or email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { list, get, create, update, validate };

const { pool, wrap } = require('../utils/helpers');

function audiencesForRole(role) {
  if (role === 'admin') return ['all', 'students', 'staff'];
  if (role === 'student') return ['all', 'students'];
  return ['all', 'staff'];
}

// FR-16
exports.create = wrap(async (req, res) => {
  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '').trim();
  const audience = String(req.body.audience || 'all');
  const errors = [];
  if (!title || title.length > 150) errors.push('title is required (max 150 chars)');
  if (!body || body.length > 1000) errors.push('body is required (max 1000 chars)');
  if (!['all', 'students', 'staff'].includes(audience)) errors.push('audience must be all, students or staff');
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
  const [r] = await pool.query('INSERT INTO announcements (title, body, audience, posted_by) VALUES (?,?,?,?)',
    [title, body, audience, req.session.user.id]);
  res.status(201).json({ message: 'Announcement published', announcement_id: r.insertId });
});

// visible to intended users only
exports.list = wrap(async (req, res) => {
  const audiences = audiencesForRole(req.session.user.role);
  const [rows] = await pool.query(
    `SELECT a.announcement_id, a.title, a.body, a.audience, a.created_on, u.full_name AS posted_by
       FROM announcements a JOIN users u ON u.user_id=a.posted_by
      WHERE a.audience IN (?) ORDER BY a.created_on DESC LIMIT 50`, [audiences]);
  res.json(rows);
});

exports.audiencesForRole = audiencesForRole;

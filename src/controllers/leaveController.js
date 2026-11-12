const { pool, wrap, studentIdFor, isDate } = require('../utils/helpers');

function validate(b) {
  const errors = [];
  if (!isDate(b.from_date)) errors.push('from_date must be YYYY-MM-DD');
  if (!isDate(b.to_date)) errors.push('to_date must be YYYY-MM-DD');
  if (isDate(b.from_date) && isDate(b.to_date) && b.to_date < b.from_date) errors.push('to_date cannot be before from_date');
  const reason = String(b.reason || '').trim();
  if (reason.length < 3 || reason.length > 300) errors.push('reason must be 3-300 characters');
  if (b.destination != null && String(b.destination).trim().length > 150) errors.push('destination must be at most 150 characters');
  return errors;
}

// FR-12
exports.create = wrap(async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
  const sid = await studentIdFor(req.session.user.id);
  if (!sid) return res.status(400).json({ error: 'No student profile linked to this account' });
  const dest = String(req.body.destination || '').trim().slice(0, 150) || null;
  const [r] = await pool.query(
    'INSERT INTO leave_requests (student_id, from_date, to_date, reason, destination) VALUES (?,?,?,?,?)',
    [sid, req.body.from_date, req.body.to_date, String(req.body.reason).trim(), dest]);
  res.status(201).json({ message: 'Leave request submitted', leave_id: r.insertId, status: 'pending' });
});

// FR-14: own requests only
exports.mine = wrap(async (req, res) => {
  const sid = await studentIdFor(req.session.user.id);
  if (!sid) return res.json([]);
  const [rows] = await pool.query(
    'SELECT leave_id, DATE_FORMAT(from_date,"%Y-%m-%d") AS from_date, DATE_FORMAT(to_date,"%Y-%m-%d") AS to_date, reason, destination, status, reviewed_on FROM leave_requests WHERE student_id=? ORDER BY created_on DESC', [sid]);
  res.json(rows);
});

// review queue
exports.list = wrap(async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : null;
  const [rows] = await pool.query(
    `SELECT l.leave_id, DATE_FORMAT(l.from_date,"%Y-%m-%d") AS from_date, DATE_FORMAT(l.to_date,"%Y-%m-%d") AS to_date,
            l.reason, l.destination, l.status, s.srn, s.name AS student_name
       FROM leave_requests l JOIN students s ON s.student_id=l.student_id
      ${status ? 'WHERE l.status=?' : ''} ORDER BY l.created_on DESC`, status ? [status] : []);
  res.json(rows);
});

// FR-13: decision + reviewer recorded; only pending requests can be decided
exports.decide = wrap(async (req, res) => {
  const decision = String(req.body.decision || '');
  if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ error: "decision must be 'approved' or 'rejected'" });
  const [r] = await pool.query(
    "UPDATE leave_requests SET status=?, reviewed_by=?, reviewed_on=NOW() WHERE leave_id=? AND status='pending'",
    [decision, req.session.user.id, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Pending request not found' });
  res.json({ message: `Request ${decision}` });
});

exports.validate = validate;


const { pool, wrap, studentIdFor } = require('../utils/helpers');

const CATEGORIES = [
  'plumbing',
  'electrical',
  'furniture',
  'cleanliness',
  'internet',
  'other'
];

// FR-09: Validate complaint submission.
function validate(body) {
  const errors = [];

  const category = String(body.category || '')
    .toLowerCase()
    .trim();

  const description = String(body.description || '').trim();

  if (!CATEGORIES.includes(category)) {
    errors.push('Invalid complaint category');
  }

  if (description.length < 5 || description.length > 500) {
    errors.push('Description must contain 5-500 characters');
  }

  return {
    errors,
    data: { category, description }
  };
}

// FR-11: Define valid maintenance status transitions.
function isValidTransition(current, next) {
  if (current === next) return true;

  return (
    (current === 'assigned' && next === 'in_progress') ||
    (current === 'in_progress' && next === 'resolved')
  );
}

// FR-09: Student submits a complaint.
exports.create = wrap(async (req, res) => {
  const { errors, data } = validate(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  const sid = await studentIdFor(req.session.user.id);

  if (!sid) {
    return res.status(400).json({
      error: 'No student profile linked to this account'
    });
  }

  const [result] = await pool.query(
    `INSERT INTO complaints
     (student_id, category, description)
     VALUES (?, ?, ?)`,
    [sid, data.category, data.description]
  );

  res.status(201).json({
    message: 'Complaint submitted',
    complaint_id: result.insertId,
    status: 'open'
  });
});

// FR-10: Student views only their complaints.
exports.mine = wrap(async (req, res) => {
  const sid = await studentIdFor(req.session.user.id);

  if (!sid) return res.json([]);

  const [rows] = await pool.query(
    `SELECT complaint_id, category, description,
            status, created_on, updated_on
     FROM complaints
     WHERE student_id = ?
     ORDER BY created_on DESC`,
    [sid]
  );

  res.json(rows);
});

// Admin / Warden: View all complaints.
exports.list = wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.complaint_id, c.category, c.description,
            c.status, c.created_on, s.srn,
            s.name AS student_name,
            u.full_name AS assigned_name,
            c.assigned_to
     FROM complaints c
     JOIN students s ON s.student_id = c.student_id
     LEFT JOIN users u ON u.user_id = c.assigned_to
     ORDER BY c.created_on DESC`
  );

  res.json(rows);
});

// Admin / Warden: List maintenance staff.
exports.staff = wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT user_id, full_name
     FROM users
     WHERE role = 'maintenance'`
  );

  res.json(rows);
});

// FR-11: Assign a complaint to maintenance staff.
exports.assign = wrap(async (req, res) => {
  const complaintId = Number(req.params.id);
  const staffId = Number(req.body.assigned_to);

  if (!Number.isInteger(complaintId) || complaintId <= 0) {
    return res.status(400).json({ error: 'Invalid complaint ID' });
  }

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return res.status(400).json({
      error: 'Valid assigned_to is required'
    });
  }

  const [staff] = await pool.query(
    `SELECT user_id FROM users
     WHERE user_id = ? AND role = 'maintenance'`,
    [staffId]
  );

  if (!staff[0]) {
    return res.status(400).json({
      error: 'Selected user is not maintenance staff'
    });
  }

  const [complaints] = await pool.query(
    `SELECT complaint_id, status
     FROM complaints
     WHERE complaint_id = ?`,
    [complaintId]
  );

  if (!complaints[0]) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  if (
    complaints[0].status === 'in_progress' ||
    complaints[0].status === 'resolved'
  ) {
    return res.status(409).json({
      error: 'Complaint cannot be reassigned in its current status'
    });
  }

  await pool.query(
    `UPDATE complaints
     SET assigned_to = ?,
         status = CASE
           WHEN status = 'open' THEN 'assigned'
           ELSE status
         END
     WHERE complaint_id = ?`,
    [staffId, complaintId]
  );

  res.json({ message: 'Complaint assigned' });
});

// Maintenance staff: View their assigned complaints.
exports.assigned = wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.complaint_id, c.category,
            c.description, c.status, c.created_on, s.srn
     FROM complaints c
     JOIN students s ON s.student_id = c.student_id
     WHERE c.assigned_to = ?
     ORDER BY c.created_on DESC`,
    [req.session.user.id]
  );

  res.json(rows);
});

// FR-11: Update complaint status.
exports.updateStatus = wrap(async (req, res) => {
  const complaintId = Number(req.params.id);
  const status = String(req.body.status || '').trim();
  const user = req.session.user;

  if (!Number.isInteger(complaintId) || complaintId <= 0) {
    return res.status(400).json({ error: 'Invalid complaint ID' });
  }

  if (!['in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({
      error: "Status must be 'in_progress' or 'resolved'"
    });
  }

  const [rows] = await pool.query(
    `SELECT complaint_id, assigned_to, status
     FROM complaints
     WHERE complaint_id = ?`,
    [complaintId]
  );

  const complaint = rows[0];

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  // Maintenance staff can only update their own assignments.
  if (
    user.role === 'maintenance' &&
    Number(complaint.assigned_to) !== Number(user.id)
  ) {
    return res.status(404).json({
      error: 'Complaint not assigned to you'
    });
  }

  // Repeated requests are treated as successful and idempotent.
  if (complaint.status === status) {
    return res.json({ message: 'Status already updated' });
  }

  if (!isValidTransition(complaint.status, status)) {
    return res.status(409).json({
      error: 'Invalid complaint status transition'
    });
  }

  await pool.query(
    `UPDATE complaints
     SET status = ?
     WHERE complaint_id = ?`,
    [status, complaintId]
  );

  res.json({ message: 'Status updated' });
});

exports.CATEGORIES = CATEGORIES;
exports.validate = validate;
exports.isValidTransition = isValidTransition;

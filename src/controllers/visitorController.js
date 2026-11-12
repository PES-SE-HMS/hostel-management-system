const { pool, wrap, isDateTime } = require('../utils/helpers');

function validateVisitor(body = {}) {
  const visitorName = String(body.visitor_name || '').trim();
  const purpose = String(body.purpose || '').trim();
  const visitTime = String(body.visit_time || '').trim();
  const errors = [];

  if (!visitorName || visitorName.length > 100) {
    errors.push('visitor_name is required (max 100 characters)');
  }
  if (!purpose || purpose.length > 200) {
    errors.push('purpose is required (max 200 characters)');
  }
  if (!visitTime || !isDateTime(visitTime)) {
    errors.push('visit_time is required and must be a valid YYYY-MM-DDTHH:MM date and time');
  }

  return { errors, data: { visitorName, purpose, visitTime: visitTime.replace('T', ' ') } };
}

// FR-15: staff must record visitor name, purpose, visit date/time and optional student.
exports.create = wrap(async (req, res) => {
  const { errors, data } = validateVisitor(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  let studentId = null;

  if (req.body.srn && String(req.body.srn).trim()) {
    const srn = String(req.body.srn).trim().toUpperCase();
    const [students] = await pool.query(
      'SELECT student_id FROM students WHERE srn = ?', [srn]
    );
    if (!students[0]) errors.push('No student with that SRN');
    else studentId = students[0].student_id;
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const [result] = await pool.query(
    'INSERT INTO visitors (visitor_name, purpose, visit_time, student_id, recorded_by) VALUES (?,?,?,?,?)',
    [data.visitorName, data.purpose, data.visitTime, studentId, req.session.user.id]
  );

  res.status(201).json({ message: 'Visitor recorded', visitor_id: result.insertId });
});

exports.list = wrap(async (req, res) => {
  const search = String(req.query.q || '').trim();
  const like = `%${search}%`;
  const [rows] = await pool.query(
    `SELECT v.visitor_id, v.visitor_name, v.purpose,
            DATE_FORMAT(v.visit_time, '%Y-%m-%d %H:%i') AS visit_time,
            s.srn, s.name AS student_name
       FROM visitors v
       LEFT JOIN students s ON s.student_id = v.student_id
      WHERE (? = '' OR v.visitor_name LIKE ? OR s.srn LIKE ? OR s.name LIKE ?)
      ORDER BY v.visit_time DESC LIMIT 200`,
    [search, like, like, like]
  );
  res.json(rows);
});

exports.validateVisitor = validateVisitor;

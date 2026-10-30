const pool = require('../config/db');

// FR-04: room/bed availability (derived from current allocations)
async function availability(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.room_id, r.room_number, r.block, r.floor, b.bed_id, b.bed_number,
              IF(a.allocation_id IS NULL, 'available', 'allocated') AS status
         FROM rooms r
         JOIN beds b ON b.room_id = r.room_id
         LEFT JOIN allocations a ON a.bed_id = b.bed_id AND a.status = 'active'
        ORDER BY r.block, r.room_number, b.bed_number`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

// FR-05 + FR-06: allocate a bed; DB unique constraints reject duplicates
async function allocate(req, res) {
  const studentId = Number(req.body.student_id);
  const bedId = Number(req.body.bed_id);
  if (!Number.isInteger(studentId) || !Number.isInteger(bedId)) {
    return res.status(400).json({ error: 'student_id and bed_id are required' });
  }
  try {
    const [s] = await pool.query('SELECT student_id FROM students WHERE student_id = ?', [studentId]);
    const [b] = await pool.query('SELECT bed_id FROM beds WHERE bed_id = ?', [bedId]);
    if (!s[0]) return res.status(404).json({ error: 'Student not found' });
    if (!b[0]) return res.status(404).json({ error: 'Bed not found' });
    const [r] = await pool.query(
      'INSERT INTO allocations (student_id, bed_id, allocated_by) VALUES (?,?,?)',
      [studentId, bedId, req.session.user.id]
    );
    res.status(201).json({ message: 'Bed allocated', allocation_id: r.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Bed already allocated, or student already has an active allocation' });
    }
    res.status(500).json({ error: 'Server error' });
  }
}

async function vacate(req, res) {
  try {
    const [r] = await pool.query(
      "UPDATE allocations SET status='vacated', vacated_on=NOW() WHERE allocation_id=? AND status='active'",
      [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Active allocation not found' });
    res.json({ message: 'Bed vacated' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

// A student sees only their own room details
async function myRoom(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.room_number, r.block, r.floor, b.bed_number, a.allocated_on
         FROM students s
         JOIN allocations a ON a.student_id = s.student_id AND a.status='active'
         JOIN beds b ON b.bed_id = a.bed_id
         JOIN rooms r ON r.room_id = b.room_id
        WHERE s.user_id = ?`,
      [req.session.user.id]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { availability, allocate, vacate, myRoom };
